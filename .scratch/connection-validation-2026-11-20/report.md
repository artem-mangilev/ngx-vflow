# Валидация соединений: как у других и что выбрать для ngx-vflow

Дата: 2026-11-20. Отчёт писался до решения; решение и то, что сделано по нему, — в разделе «Решение» сразу ниже.

## Решение

2026-11-20 автор выбрал вариант 1. Реализовано в рабочем дереве, не закоммичено:

- `ConnectionForValidation<N, E>` = `{ source, target, reconnectedEdge? }`, концы — `ConnectionEventEndpoint<N>`. `ConnectionValidatorFn` и `ConnectionSettings` получили параметры `N`, `E`; вход `[connection]` типизирован типами нод и рёбер своего flow.
- `ConnectionEventEndpoint` и `ConnectionEventHandle` переименованы в `ConnectionEndpoint` и `ConnectionHandle`: тип используется и вне событий. В остальном тексте отчёта стоят старые имена. `reconnectedEdge` и `ConnectionForValidation` остались как были.
- `(connect)` и `ReconnectEvent.connection` теперь несут чистый `Connection` из четырёх полей. Раньше объект заодно содержал `sourceHandleType` и `targetHandleType`, хотя тип их не объявлял; это было и в v2. Изменение видно в `toEqual`-проверках приложений и описано в руководстве по миграции.
- Переписаны шесть валидаторов документации, страницы `handles/connections`, `getting-started/migration`, `testing`.
- В pipeline и ERD помощник поиска порта теперь принимает данные ноды, а не id, поэтому второго помощника, о котором говорит раздел 3.2, не понадобилось.

Проверено: `tsc` и три набора тестов библиотеки (497 + 60 + 6), проверка типов шаблонов документации, шесть демо в браузере на dev-сервере. Не запускались e2e-тесты документации.

## 1. Вывод

Рекомендую вариант 1: один `validator`, аргумент `{ source, target, reconnectedEdge? }`, где `source` и `target` — концы в том же виде, что в событиях жеста (`ConnectionEventEndpoint<N>`: нода и handle). Плоские поля `source`, `target`, `sourceHandle`, `targetHandle`, `sourceHandleType`, `targetHandleType` из аргумента уходят.

Основания:

- Ни одна из 13 просмотренных библиотек не делит валидатор на «создание» и «переподключение». Там, где функций несколько, они делятся по фазе жеста (кандидат под указателем и итог при отпускании) или по уровню (порт, нода, граф).
- Пять библиотек передают валидатору переподключаемое ребро параметром той же функции: JointJS, X6, GoJS, maxGraph, ng-diagram. Семейство xyflow не передаёт, и там же встроенный лимит рёбер на handle считает переносимое ребро (Vue Flow).
- Все шесть валидаторов в документации начинают с поиска ноды по id. Со структурными концами поиск исчезает, а после тикета про подсветку подходящих handle он стал бы квадратичным.
- Два валидатора не дают ничего, чего не даёт необязательное поле, кроме обязательности `edge` в типе. Взамен они заставляют либо дублировать правила, либо оставляют переподключение без проверки по умолчанию.

Перечень файлов — в разделе 8.

## 2. Как у других

Источники — исходники на зафиксированных коммитах и актуальная документация на 2026-11-20. Ссылки собраны под таблицей. Ничего не запускалось: всё ниже прочитано в коде и документации.

### Сводная таблица

| Библиотека                               | Функций                                                                     | Создание и переподключение                                                  | Что в аргументе                                                     | Где задаётся                                          | Декларативные ограничения                                                                     | Возврат                                    | Когда вызывается                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| React Flow 13, Svelte Flow 2, Vue Flow 2 | одна `isValidConnection`                                                    | одна функция, о ребре не знает                                              | четыре id (`Connection`)                                            | глобально и на `Handle`; у handle замещает глобальную | `connectionMode`, `isConnectable*`; лимит рёбер только у Vue (`number`, `'single'`)           | boolean                                    | на каждом движении для ближайшего handle; при отпускании повторно не вызывается        |
| Vue Flow 1 (архив)                       | одна                                                                        | одна, о ребре не знает                                                      | `Connection` и `{ nodes, edges, sourceNode, targetNode }`           | глобально и на handle                                 | `connectable: boolean \| number \| 'single' \| fn`                                            | boolean                                    | на движении                                                                            |
| JointJS                                  | `validateMagnet`, `validateConnection`, `allowLink`                         | одна `validateConnection`; получает `linkView` и `end`                      | view нод, DOM-элементы портов, перетаскиваемый конец, view ребра    | глобально (Paper)                                     | `magnet="passive"`, `multiLinks`, `linkPinning`                                               | boolean                                    | заранее для всех портов при `markAvailable`; при наведении; `allowLink` при отпускании |
| AntV X6                                  | `validateMagnet`, `validateConnection`, `validateEdge`, шесть `allow*`      | одна `validateConnection`; получает `edge` и `type`                         | ячейки, view, id портов, DOM-элементы, ребро, перетаскиваемый конец | глобально (`connecting`)                              | `allowLoop`, `allowMulti` (`'withPort'`), `allowNode`, `allowEdge`, `allowPort`, `allowBlank` | boolean                                    | заранее для всех портов при `highlight`; при наведении; `validateEdge` при отпускании  |
| GoJS                                     | `linkValidation` на инструменте и на ноде, плюс встроенный `isValidLink`    | один предикат; пятый аргумент — ребро или `null`                            | объекты нод и портов, ребро                                         | глобально (инструмент), на ноде, свойства порта       | `from/toLinkable`, `…SelfNode`, `…Duplicates`, `from/toMaxLinks`, `validCycle`                | boolean                                    | лениво для портов рядом с указателем, с кэшем; заранее не считает                      |
| maxGraph / mxGraph                       | `getEdgeValidationError`, `validateEdge`, `isValidSource/Target/Connection` | одна функция; первый аргумент — ребро или `null`                            | объекты ячеек                                                       | на графе                                              | `allowLoops`, `multigraph`, `multiplicities` (мин. и макс. рёбер по типу ноды)                | `string \| null`: причина                  | при наведении; при отпускании показывает сообщение                                     |
| ng-diagram                               | одна `validateConnection`                                                   | одна; `context: { reason: 'draw' \| 'relink' \| 'attach', edge?, end? }`    | объекты нод и портов, контекст                                      | глобально (`linking`)                                 | тип порта `source/target/both`, `relinkable`                                                  | boolean; причина отказа приходит в событии | при прилипании к порту и при отпускании                                                |
| Foblex Flow                              | функции нет                                                                 | правила общие; события раздельные                                           | —                                                                   | на коннекторе                                         | список разрешённых целей, категория, `multiple`, `disabled`, self-connectable                 | —                                          | один раз в начале жеста, цели помечаются классом                                       |
| Rete.js 2                                | `canMakeConnection`, pipe на `connectioncreate`                             | переподключения нет: старое соединение удаляется при захвате                | данные двух сокетов (id ноды, сторона, ключ) или объект соединения  | глобально                                             | `multipleConnections` на входе и выходе (замещает, а не запрещает)                            | boolean                                    | только при отпускании                                                                  |
| LiteGraph                                | `isValidConnection(typeA, typeB)`, `onConnectInput`, `onConnectOutput`      | переподключение — удаление и новое соединение                               | строки типов; у колбэков ноды — индексы слотов, слоты, ноды         | глобально (типы) и на ноде                            | типы слотов, вход держит одно ребро (замещает), петля запрещена                               | boolean                                    | проверка типов заранее (несовместимые слоты приглушены); колбэки ноды при отпускании   |
| ComfyUI frontend                         | то же, плюс отменяемые события `before-move-input/output`                   | перенос ребра явный, но правила те же; `onConnectInput` о переносе не знает | то же                                                               | то же                                                 | то же                                                                                         | boolean                                    | то же                                                                                  |
| Drawflow                                 | валидации нет                                                               | переподключения нет                                                         | —                                                                   | —                                                     | запрет петли и точного дубликата зашит в код                                                  | —                                          | —                                                                                      |
| tldraw                                   | `ShapeUtil.canBind`                                                         | одна; прежней привязки не получает                                          | `{ fromShape, toShape, bindingType }`                               | на классе фигуры; портов нет                          | нет                                                                                           | boolean                                    | как фильтр цели при наведении и при записи привязки                                    |

### Что стоит знать по каждой

**xyflow (React Flow 13.0.2, Svelte Flow 2.0.2, Vue Flow 2.0.2).** `main` уже не v12; логика валидации между `@xyflow/react@12.12.1` и `main` не менялась. Vue Flow переехал в монорепозиторий xyflow как `@xyflow/vue`.

- Тип `IsValidConnection = (edge: EdgeType | Connection) => boolean` ([general.ts#L148][xy-type]); во время жеста библиотека всегда передаёт объект из четырёх id, собранный в одном месте ([XYHandle.ts#L299-L316][xy-handle]).
- При переподключении вызывается тот же глобальный валидатор ([EdgeUpdateAnchors.tsx#L93][xy-anchors]). `edgeUpdaterType` до него не доходит, поэтому валидатор не знает ни о ребре, ни о том, что это переподключение. Ребро получают только `onReconnectStart` и `onReconnect`.
- Переносимое ребро остаётся в хранилище рёбер на всё время жеста: оно скрыто локальным состоянием компонента ([EdgeWrapper/index.tsx#L65][xy-wrapper]). Валидатор, который считает рёбра через `getEdges()`, видит и его.
- `isValidConnection` на `Handle` замещает глобальный, а не складывается с ним ([Handle/index.tsx#L168-L169][xy-handle-react]). При перетаскивании берётся проп handle, с которого начали жест, а при переподключении проп handle не используется вовсе.
- Лимит рёбер: в React и Svelte только пользовательский код (`useNodeConnections` и `isConnectable`, пример [Connection Limit][xy-limit]). В Vue встроен: `HandleConnectable = boolean | number | 'single' | fn` ([handle.ts][xy-vue-handle]), счёт идёт по хранилищу рёбер вместе с переносимым ребром.
- Заранее для всех handle валидатор не вызывается. Класс `connectionindicator` считается статически, без валидатора.
- Vue Flow 1 передавал вторым аргументом `{ nodes, edges, sourceNode, targetNode }` ([handle.ts#L30-L33][vf1-type]); в 2.0 это убрали ради единого типа с React и Svelte ([CHANGELOG][xy-vue-changelog]).
- Svelte Flow имеет отдельный хук только для переподключения: `onbeforereconnect(newEdge, oldEdge)`, он срабатывает при отпускании после `isValidConnection` и может отменить замену ([EdgeReconnectAnchor.svelte#L85-L88][xy-svelte-anchor]). Это ближайший аналог «второго валидатора», но он работает только на последней фазе.
- В обсуждениях просят того, чего нет в аргументе: тип handle и объекты вместо id ([#2710][xy-2710]), причину отказа ([#4123][xy-4123]), различие нового и существующего ребра ([#5632][xy-5632]). Запроса «передайте старое ребро в `isValidConnection`» агент не нашёл.
- Пример [Prevent cycles][xy-cycles] начинает с `nodes.find((node) => node.id === connection.target)`, то есть с того же поиска по id, что и наши демо.

**JointJS.** `validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView)` ([dia.d.ts#L1812][joint-types]): `end` говорит, какой конец тянут, `linkView` — само ребро. Новое ребро добавляется в граф при нажатии и дальше тянется тем же кодом, что и существующее, поэтому функция одна и признака «новое» в ней нет. При `markAvailable: true` она вызывается в начале жеста для каждого порта каждой ноды ([LinkView.mjs#L1937-L1975][joint-linkview]). `allowLink(linkView, paper)` вызывается при отпускании; при `false` новое ребро удаляется, существующее возвращается на место ([документация][joint-allowlink]). Лимита рёбер и типов портов нет.

**AntV X6.** `validateConnection(args)` с `{ type, edge, edgeView, sourceCell, targetCell, sourceView, targetView, sourcePort, targetPort, sourceMagnet, targetMagnet }` ([options.ts#L228-L243][x6-options]). Опции `allow*` принимают boolean или функцию с тем же аргументом и проверяются до пользовательской функции. `validateEdge({ edge, type, previous })` вызывается при отпускании. При `highlight: true` `validateConnection` вызывается заранее для всех портов ([edge/index.ts#L2305-L2351][x6-edge]). Встроенная проверка `allowMulti: false` не исключает переносимое ребро из сравнения (видно в коде, поведение не проверялось).

**GoJS.** Предикат `linkValidation(fromNode, fromPort, toNode, toPort, link)` задаётся на инструменте и на ноде. Из документации: при переподключении пятым аргументом передаётся ребро, при создании — `null` ([LinkingBaseTool.linkValidation][gojs-lv], [Node.linkValidation][gojs-node-lv]). Предикат вызывается только после встроенных проверок, а они декларативны: `fromLinkable`, `toLinkable`, `…LinkableSelfNode`, `…LinkableDuplicates`, `fromMaxLinks`, `toMaxLinks`, `Diagram.validCycle` ([введение в валидацию][gojs-intro]). `isValidCycle(from, to, ignore)` принимает ребро, которое нужно не учитывать: «полезно при переподключении» ([документация][gojs-cycle]). Встроенный `maxLinks` при переподключении считает исходный порт всегда допустимым; это видно только в минифицированном `go-debug.js`. Заранее для всех портов GoJS не считает: `findTargetPort` проверяет порты рядом с указателем и кэширует результат.

**maxGraph / mxGraph.** Единственная библиотека с причиной отказа. `getEdgeValidationError(edge, source, target)` возвращает `null` (допустимо), `''` (недопустимо без сообщения) или текст ошибки ([ValidationMixin.type.ts#L39-L80][mx-type]). При создании `edge` равен `null`, при переподключении — существующее ребро ([EdgeHandler.ts#L538-L540][mx-edgehandler]); встроенные счётчики его исключают (`getDirectedEdgeCount(true, edge)`). `multiplicities` задают минимум и максимум рёбер по типу ноды с текстами ошибок. При отпускании непустая ошибка показывается через `validationAlert`.

**ng-diagram (Angular).** Ближайший родственник по стеку и самый свежий дизайн. `validateConnection(source, sourcePort, target, targetPort, context?)`, где `context = { reason: 'draw' | 'relink' | 'attach', edge?, end? }` добавлен в 1.4.0 ([flow-config.interface.ts#L51-L76, L228-L235][ngd-config]). Одна функция на все операции, объекты нод и портов, переподключаемое ребро — необязательное поле. Причина отказа приходит не из валидатора, а в событии: `EdgeDrawCancelReason = 'noTarget' | 'invalidConnection' | 'invalidTarget' | 'cancelled'`.

**Foblex Flow (Angular).** Функции-валидатора нет, правила только декларативные и задаются на коннекторе: `fCanBeConnectedTo` (список id или категорий), `fConnectorMultiple`, `fConnectorDisabled`, `isSelfConnectable`. Все жесты получают цели через один фильтр ([filter-connectable-targets.ts][foblex-filter]), цели помечаются классом один раз в начале жеста. События раздельные: `fCreateConnection` и `fReassignConnection`. Документация прямо говорит, что правила — только подсказка интерфейса и итог приложение проверяет само ([руководство][foblex-guide]).

**Rete.js 2.** `canMakeConnection(from, to)` в `ClassicFlow` и pipe на `connectioncreate` ([руководство][rete-guide]). Совместимость сокетов в v2 — пользовательский код. `multipleConnections` на порту не запрещает, а замещает: старые соединения удаляются. Переподключения как понятия нет: при захвате соединённого входа соединение удаляется сразу ([classic/index.ts][rete-classic]).

**LiteGraph и ComfyUI.** Глобальная `LiteGraph.isValidConnection(typeA, typeB)` сравнивает строки типов слотов; колбэки ноды `onConnectInput` и `onConnectOutput` могут отказать при отпускании ([litegraph.js#L4393-L4403][lg-connect]). Вход держит одно ребро, новое замещает старое. Несовместимые по типу слоты приглушаются на всё время жеста ([LGraphNode.ts#L4054-L4085][comfy-slots]); колбэки ноды на подсветку не влияют. В ComfyUI перенос ребра стал явным (`LinkConnector`, события `before-move-input`), но при фиксации старое ребро отсоединяется и вызывается обычное соединение ([MovingInputLink.ts#L71-L92][comfy-move]).

**Drawflow.** Хука нет. При отпускании зашиты две проверки: не та же нода и не точный дубликат ([drawflow.js#L474-L476][drawflow]). Переподключения нет.

**tldraw.** Портов нет. `ShapeUtil.canBind({ fromShape, toShape, bindingType })` один на создание и изменение привязки ([ShapeUtil.ts#L307-L314][tldraw-canbind]); прежнюю привязку видит только `BindingUtil.onBeforeChange`, который не может отказать.

### Что из этого следует

1. **Никто не делит валидатор по виду жеста.** Деление есть по фазе: кандидат (`validateConnection`) и итог (`allowLink`, `validateEdge`, `onbeforereconnect`). В ngx-vflow роль итоговой фазы уже играют `(connect)` и `(reconnect)`: рёбрами владеет приложение, и оно может не применить запрос.
2. **Ребро передают параметром.** JointJS, X6, GoJS, maxGraph, ng-diagram дают одной функции переподключаемое ребро; ng-diagram оформил это как необязательное поле контекста, то есть так же, как `reconnectedEdge`.
3. **Где ребро не передают, счёт рёбер ломается.** Vue Flow считает переносимое ребро в лимите handle; X6 не исключает его в `allowMulti`. GoJS и maxGraph исключают его внутри встроенных счётчиков. Это та же ошибка, что была в демо feature-overview.
4. **Объекты вместо id — норма** у всех, кроме xyflow и Drawflow. xyflow в Vue Flow 2 убрал объекты нод ради единого типа, и в обсуждениях их просят вернуть.
5. **Подсветка целей заранее вызывает тот же валидатор** на каждый порт (JointJS `markAvailable`, X6 `highlight`) или ограничивается декларативными правилами (Foblex, LiteGraph). Отдельной функции «для подсветки» нет ни у кого.
6. **Причину отказа возвращает только maxGraph.** ng-diagram отдаёт её в событии и только как вид отказа, без текста.

## 3. Три варианта на валидаторах документации

Валидаторов в документации шесть: пять из постановки и ещё один на лендинге (`apps/docs/src/app/landing/hero-flow.component.ts`). Переподключение включено только в feature-overview.

Форма аргумента в каждом варианте:

```ts
// Вариант 1: один валидатор, структурные концы
validator?: (connection: {
  source: ConnectionEventEndpoint<N>; // { node, handle: { id, type, position } }
  target: ConnectionEventEndpoint<N>;
  reconnectedEdge?: E;
}) => boolean;

// Вариант 2: два валидатора (аргументы как у событий connect и reconnect)
connectValidator?: (connection: ConnectionForValidation) => boolean; // плоские id, без reconnectedEdge
reconnectValidator?: (reconnection: { edge: E; connection: ConnectionForValidation }) => boolean;

// Вариант 3: как сейчас в рабочем дереве
validator?: (connection: Connection & { sourceHandleType; targetHandleType; reconnectedEdge?: Edge }) => boolean;
```

Деление на два валидатора не зависит от формы концов: вариант 2 можно сделать и со структурными концами. Ниже он показан с плоскими, как в предложении; выводы о дублировании от формы концов не зависят.

### 3.1. Типы значений (`connection-validation-demo`)

```ts
// Вариант 3 (сейчас): 4 строки, два поиска по nodes на вызов
validator: ({ source, target }) => this.valueOf(source) === this.valueOf(target),

private valueOf(nodeId: string): string | undefined {
  return this.nodes.find((node) => node.id === nodeId)?.data().value;
}

// Вариант 1: 1 строка, поиска нет
validator: ({ source, target }) => source.node.data().value === target.node.data().value,

// Вариант 2: тело варианта 3 под именем connectValidator
```

### 3.2. Типы портов и запрет цикла (`pipeline`)

```ts
// Вариант 3 (сейчас): два поиска ноды по id, затем обход графа
validator: (c) => {
  const source = this.port(c.source, 'outputs', c.sourceHandle);
  const target = this.port(c.target, 'inputs', c.targetHandle);
  return !!source && source.type === target?.type && !this.reaches(c.target, c.source);
},

// Вариант 1: поиска ноды нет
validator: ({ source, target }) => {
  const output = this.portOf(source, 'outputs');
  const input = this.portOf(target, 'inputs');
  return !!output && output.type === input?.type && !this.reaches(target.node.id, source.node.id);
},

private portOf({ node, handle }: ConnectionEventEndpoint<LabNode>, side: 'inputs' | 'outputs') {
  const prefix = side === 'inputs' ? 'in:' : 'out:';
  return this.ports(node.data())[side].find((port) => prefix + port.id === handle.id);
}
```

Строк не меньше: `(connect)` по-прежнему получает плоский `Connection` и ищет порт по id, поэтому старый помощник `port(id, side, handle)` остаётся, а `portOf` добавляется. Выигрыш здесь в поиске, а не в объёме. Если не хочется второго помощника, вариант 1 позволяет оставить старый код, заменив `c.source` на `source.node.id`.

Правило про цикл при переподключении не требует знать переносимое ребро. Новое ребро делит один конец со старым, и любой путь от цели к источнику, проходящий через старое ребро, сокращается до пути без него: при переносе конца-цели путь уже побывал в источнике до старого ребра, при переносе конца-источника он после старого ребра снова оказывается в цели. Поэтому `reaches` по графу со старым ребром даёт тот же ответ, что и по графу без него. Это верно для типизированных handle; про `any` см. раздел 9.

Во варианте 2 при включении переподключения нужно зарегистрировать то же правило второй раз:

```ts
connectValidator: (c) => this.compatible(c),
reconnectValidator: ({ connection }) => this.compatible(connection),
```

### 3.3. Типы полей (`erd-schema-mapping`)

```ts
// Вариант 3 (сейчас)
validator: (c) => {
  const source = this.field(c.source, 'out:', c.sourceHandle);
  const target = this.field(c.target, 'in:', c.targetHandle);
  return !!source && !!target && source.type === target.type;
},

// Вариант 1
validator: ({ source, target }) => {
  const from = fieldOf(source, 'out:');
  const to = fieldOf(target, 'in:');
  return !!from && !!to && from.type === to.type;
},
```

То же, что в pipeline: два поиска ноды уходят, помощник по id остаётся для `(connect)`.

### 3.4. Люди соединяются один раз, в любом направлении (`relationships-map`)

```ts
// Вариант 3 (сейчас): два поиска ноды и проход по рёбрам
validator: ({ source, target }) =>
  source !== target &&
  this.isPerson(source) &&
  this.isPerson(target) &&
  !this.edges().some(
    (edge) =>
      (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source),
  ),

// Вариант 1: поиска ноды нет
validator: ({ source: { node: a }, target: { node: b }, reconnectedEdge }) =>
  a.component === PersonNodeComponent &&
  b.component === PersonNodeComponent &&
  !this.edges().some(
    (edge) =>
      edge.id !== reconnectedEdge?.id &&
      ((edge.source === a.id && edge.target === b.id) || (edge.source === b.id && edge.target === a.id)),
  ),
```

`source !== target` в текущем коде повторяет встроенное правило (`allowSelfConnections` по умолчанию `false`).

Если в этом демо включить переподключение, правилу нужен `reconnectedEdge` в вариантах 1 и 3: без него handle, с которого сняли конец ребра, показывает отказ, потому что пара уже соединена этим самым ребром. Встроенная проверка дубликатов переносимое ребро исключает, а пользовательская «в любом направлении» — нет. В варианте 2 для этого нужен второй валидатор с тем же телом и одним дополнительным условием.

### 3.5. Порт принимает одно ребро (`feature-overview`)

```ts
// Вариант 3 (сейчас): 6 строк, один поиск ноды
private canConnect({ target, reconnectedEdge }: ConnectionForValidation): boolean {
  const node = this.store.nodes().find((node) => node.id === target);

  return (
    node?.component !== InspectorNodeComponent ||
    !this.store.edges().some((edge) => edge.target === target && edge.id !== reconnectedEdge?.id)
  );
}

// Вариант 1: 3 строки, поиска нет
validator: ({ target, reconnectedEdge }) =>
  target.node.component !== InspectorNodeComponent ||
  !this.store.edges().some((edge) => edge.target === target.node.id && edge.id !== reconnectedEdge?.id),

// Вариант 2: 8 строк, один поиск ноды
connectValidator: ({ target }) => this.inspectorFree(target),
reconnectValidator: ({ edge, connection }) => this.inspectorFree(connection.target, edge),

private inspectorFree(target: string, except?: Edge): boolean {
  const node = this.store.nodes().find((node) => node.id === target);

  return (
    node?.component !== InspectorNodeComponent ||
    !this.store.edges().some((edge) => edge.target === target && edge.id !== except?.id)
  );
}
```

В варианте 2 общее правило всё равно принимает необязательное ребро: поле `reconnectedEdge?` не исчезает, а переезжает из библиотеки в приложение под именем `except?`.

### 3.6. Цвет к градиенту, угол к углу (лендинг)

```ts
// Вариант 3 (сейчас)
validator: ({ source, target, targetHandle }) => {
  const kind = this.data(source)?.kind;

  return target === 'gradient' && (kind === 'angle') === (targetHandle === 'angle') && kind !== 'gradient';
},

// Вариант 1
validator: ({ source, target }) => {
  const kind = source.node.data().kind;

  return target.node.id === 'gradient' && (kind === 'angle') === (target.handle.id === 'angle') && kind !== 'gradient';
},
```

### Итог сравнения

| Валидатор        | Поисков ноды по id на вызов: В3 / В1 | Строк правила: В3 / В1 / В2    | Что ломается при переподключении                                           |
| ---------------- | ------------------------------------ | ------------------------------ | -------------------------------------------------------------------------- |
| Типы значений    | 2 / 0                                | 4 / 1 / 4                      | ничего; в В2 правило нужно назвать дважды                                  |
| Pipeline         | 2 / 0                                | 5 / 5 (+4 помощник) / 5 (+1)   | ничего, цикл считается верно и без ребра; в В2 назвать дважды              |
| ERD              | 2 / 0                                | 5 / 5 (+3 помощник) / 5 (+1)   | ничего; в В2 назвать дважды                                                |
| Карта отношений  | 2 / 0                                | 9 / 8 / 9 (+ второй валидатор) | без `reconnectedEdge` отказ на исходном handle                             |
| Feature overview | 1 / 0                                | 6 / 3 / 8                      | без `reconnectedEdge` нельзя перенести начало ребра, входящего в инспектор |
| Лендинг          | 1 / 0                                | 4 / 4 / 4                      | —                                                                          |

Вариант 3 во всех строках таблицы корректен ровно так же, как вариант 1: отличие только в поиске по id и в объёме. Вариант 2 корректен только при условии, что приложение написало оба валидатора.

## 4. Дают ли два валидатора что-то сверх одного поля

Нет. Разбор по пунктам.

**Что он дал бы.** Одно: в `reconnectValidator` ребро есть всегда, и тип это выражает без `?`. В одном валидаторе то же самое пишется как `if (reconnectedEdge)`.

**Почему правил «только для переподключения» почти нет.** Любое правило — это вопрос о графе после операции. После переподключения граф равен «текущий минус старое ребро плюс новое соединение», после создания — «текущий плюс новое соединение». Создание — частный случай, где вычитать нечего. Поэтому правило переподключения — это то же правило создания, посчитанное без одного ребра, а не другое правило. Необязательное поле выражает это одним условием (`edge.id !== reconnectedEdge?.id`), два валидатора — двумя функциями с общим телом (раздел 3.5).

Правила, которые действительно относятся только к переподключению («это ребро нельзя уводить от его источника»), в одном валидаторе занимают одну строку: `if (reconnectedEdge && reconnectedEdge.source !== source.node.id) return false`. Запрет переподключения целиком уже задаётся на ребре через `reconnectable`.

**Заставит ли дублировать.** Да. Из шести валидаторов документации четыре (типы значений, pipeline, ERD, лендинг) не зависят от вида жеста вообще. В варианте 2 каждое такое правило нужно зарегистрировать дважды, и забытая вторая регистрация ничем не обнаруживается.

**Что происходит, если второй валидатор не написан.** У варианта 2 два возможных поведения, и оба хуже нынешнего:

- Переподключение использует `connectValidator`. Тогда правило «порт принимает одно ребро» ломается ровно так, как сломалось в feature-overview, и починить его внутри `connectValidator` нельзя: ребра в аргументе нет.
- Переподключение без `reconnectValidator` не проверяется приложением. Тогда правило типов портов молча перестаёт действовать при переносе конца ребра.

**Что у других.** Ни одна из 13 библиотек так не делит. Ближайшие случаи: `onbeforereconnect` в Svelte Flow и `allowLink` в JointJS — это отдельная итоговая фаза, а не второй валидатор кандидата; раздельные события у Foblex и ComfyUI — это события, правила у них общие.

## 5. Тикет про подсветку подходящих handle

Тикет `.scratch/handle-eligibility-2026-10-17/issues/01-handle-may-accept-state.md` требует вызвать валидатор по разу на каждый handle в начале жеста. Что это значит для вариантов:

- **Поиск по id становится квадратичным.** В вариантах 2 и 3 каждый вызов делает один-два `nodes.find`. На 1000 нод с двумя handle это 2000 вызовов × 2 поиска × в среднем 500 сравнений = 2 млн сравнений строк на старт жеста, на 5000 нод — 50 млн. Приложение может построить `Map`, но тогда каждое приложение обязано знать об этой ловушке. В варианте 1 нода уже лежит в аргументе: библиотека берёт её из `handle.parentNode.rawNode` без поиска.
- **Аргумент должен описывать жест целиком.** Обходной путь без `reconnectedEdge` — запомнить ребро из `(reconnectStart)` и читать его в валидаторе — после этого тикета зависит от порядка: `begin()` сначала публикует жест и только потом отправляет `reconnectStart`, и если подсветка считается при публикации жеста, валидатор будет вызван раньше, чем приложение запомнит ребро. Поле в аргументе от порядка не зависит. Это довод оставить `reconnectedEdge` в ядре в любом варианте.
- **Один валидатор — одна подсветка.** В варианте 2 подсветка при переподключении обязана вызывать `reconnectValidator`, и приложение, которое его не написало, получает либо подсветку по неверным правилам, либо подсветку всех handle.
- **Неподвижный конец постоянен весь жест.** В варианте 1 это один и тот же объект `source` или `target` во всех вызовах жеста, если библиотека создаёт его один раз. Приложение с дорогим правилом (обход графа в pipeline) может кэшировать результат по этому объекту. В тикет стоит добавить, что неподвижный конец создаётся один раз на жест.

Наблюдение из обзора: JointJS и X6 для подсветки вызывают тот же `validateConnection`, отдельной функции нет. Это подтверждает решение тикета.

## 6. Что брать в ядро из увиденного

Мерка — принцип автора: в ядре только примитив графа, который приложение не выразит существующими средствами.

| Что есть у других                                                                                                     | Брать?                         | Почему                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Объекты нод и портов в аргументе (JointJS, X6, GoJS, maxGraph, ng-diagram)                                            | Да, это вариант 1              | Библиотека держит ноду в руках и отдаёт её без затрат; приложение получает её только поиском. Тип концов уже есть в событиях                                                                                      |
| Переподключаемое ребро в аргументе (те же пять)                                                                       | Да, оставить `reconnectedEdge` | Это состояние жеста, которое в момент проверки знает только ядро                                                                                                                                                  |
| Какой конец тянут (`end` в JointJS и ng-diagram, `type` в X6)                                                         | Нет                            | Выводится из `reconnectedEdge` и концов; ни одному из шести валидаторов не нужно                                                                                                                                  |
| Валидатор на уровне порта (xyflow, Vue Flow)                                                                          | Нет                            | Глобальный валидатор уже получает handle, а `canStart` и `canAccept` покрывают статические случаи. Вторая точка для правил даёт вопрос «замещает или складывается», на котором xyflow получил несколько обращений |
| Лимит рёбер на порту (GoJS `maxLinks`, Vue Flow `connectable: number`, Foblex `multiple`, Rete `multipleConnections`) | Нет                            | Выражается валидатором или `[canAccept]`. К тому же политик две: отказать (feature-overview) или заместить старое ребро (pipeline, Rete, LiteGraph), и лимит в ядре закрепил бы одну                              |
| Типы портов (LiteGraph, Foblex-категории)                                                                             | Нет                            | Данные порта живут в данных ноды приложения; со структурными концами сравнение занимает строку                                                                                                                    |
| Запрет циклов (GoJS `validCycle`)                                                                                     | Нет                            | Обход графа по рёбрам приложения; правило зависит от смысла графа                                                                                                                                                 |
| Причина отказа (maxGraph, частично ng-diagram)                                                                        | Нет                            | `connectEnd` и `reconnectEnd` уже отдают `valid: false` и оба конца; приложение может прогнать свои правила ещё раз и показать текст. Валидатор вызывается на наведении, текст там не нужен                       |
| Отдельная итоговая фаза (JointJS `allowLink`, X6 `validateEdge`)                                                      | Нет                            | Рёбрами владеет приложение: `(connect)` и `(reconnect)` — запросы, которые оно может не применить                                                                                                                 |
| Подсветка целей заранее (JointJS, X6, Foblex, LiteGraph)                                                              | Уже в плане                    | Тикет 01 в `handle-eligibility-2026-10-17`                                                                                                                                                                        |

Замечание про `[canAccept]`. Правило «порт принимает одно ребро» выражается и без валидатора: `[canAccept]="!occupied()"` на handle инспектора. При переносе начала ребра handle инспектора — неподвижный конец, `canAccept` у него не спрашивают, и исходная ошибка не возникает. Недостаток один: если вернуть конец-цель на тот же handle, он покажет отказ. В документации стоит показать оба способа.

## 7. Рекомендация

Принять вариант 1 в таком виде:

```ts
/** A connection the gesture would make, as the validator sees it. */
export interface ConnectionForValidation<N extends Node = Node, E extends Edge = Edge> {
  /** The end the edge would start from, after typed handles took their roles. */
  source: ConnectionEventEndpoint<N>;
  /** The end the edge would lead to. */
  target: ConnectionEventEndpoint<N>;
  /**
   * The edge whose end is being dragged, as it is before the gesture; absent while a new connection is drawn. The
   * connection would replace this edge, so a rule that counts the edges of a handle or a node leaves it out.
   */
  reconnectedEdge?: E;
}

export type ConnectionValidatorFn<N extends Node = Node, E extends Edge = Edge> = (connection: ConnectionForValidation<N, E>) => boolean;

export interface ConnectionSettings<N extends Node = Node, E extends Edge = Edge> {
  validator?: ConnectionValidatorFn<N, E>;
  // curve, markerEnd, allowSelfConnections, allowDuplicateConnections без изменений
}
```

Что остаётся как есть: `source` и `target` в ролях ребра (после `adjustDirection`), а не в направлении жеста; порядок «встроенные правила, затем валидатор приложения»; вызов при наведении и повторно при отпускании; `(connect)` и `ReconnectEvent.connection` с плоским `Connection`, потому что он разворачивается в ребро.

Три решения остаются за автором:

1. **Имя поля ребра.** `reconnectedEdge` или `edge`, как в `ReconnectEvent`. Я за `reconnectedEdge`: в событии имя события уже говорит «reconnect», а валидатор общий для двух жестов, и `edge` там читается как «создаваемое ребро».
2. **Имя типа конца.** `ConnectionEventEndpoint` начнёт использоваться вне событий; можно переименовать в `ConnectionEndpoint` (и `ConnectionEventHandle` в `ConnectionHandle`), пока 3.0 не вышла.
3. **Имя типа аргумента.** `ConnectionForValidation` перестаёт быть расширением `Connection`; имя можно оставить ради меньшего числа правок.

## 8. Файлы, которые придётся изменить

Ядро:

- `libs/ngx-vflow/src/lib/vflow/interfaces/connection-settings.interface.ts` — новый `ConnectionForValidation<N, E>`, параметры типа у `ConnectionValidatorFn` и `ConnectionSettings`.
- `libs/ngx-vflow/src/lib/vflow/services/connection.service.ts` — `toConnection` строит и плоский `Connection` для событий, и аргумент валидатора; `isValid` принимает оба.
- `libs/ngx-vflow/src/lib/vflow/models/connection.model.ts` — встроенные `notSelfValidator` и `notSameTypedHandlesValidator` читают структурные концы.
- `libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts` — `connection = input<ConnectionSettings<N, E>>()`.
- `libs/ngx-vflow/src/lib/vflow/services/flow-entities.service.ts` — тип `connectionSettings`.
- `libs/ngx-vflow/src/lib/vflow/interfaces/vflow-settings.interface.ts` — `connection: ConnectionSettings` остаётся с параметрами по умолчанию; проверить, что присваивание сходится.
- `libs/ngx-vflow/src/lib/vflow/interfaces/connection-events.interface.ts` и `libs/ngx-vflow/src/public-api.ts` — только при переименовании типов конца.

Тесты:

- `libs/ngx-vflow/src/lib/vflow/services/connection.service.spec.ts`
- `libs/ngx-vflow/src/lib/vflow/models/connection.model.spec.ts`
- `libs/ngx-vflow/src/lib/vflow/components/vflow/connection-outputs.spec.ts`
- `libs/ngx-vflow/src/lib/vflow/audit-regressions.spec.ts`

Документация:

- `apps/docs/src/app/categories/docs/handles/connections/demo/connection-validation-demo.component.ts`
- `apps/docs/src/app/categories/examples/applications/pipeline/pipeline-demo.component.ts`
- `apps/docs/src/app/categories/examples/applications/erd-schema-mapping/entities-demo.component.ts`
- `apps/docs/src/app/categories/examples/applications/relationships-map/relationships-demo.component.ts`
- `apps/docs/src/app/categories/examples/feature-overview/demo/all-features-demo.component.ts`
- `apps/docs/src/app/landing/hero-flow.component.ts`
- `apps/docs/src/app/categories/docs/handles/connections/index.md` — незакоммиченный абзац про `reconnectedEdge` с плоским примером переписать под новую форму.
- `apps/docs/src/app/categories/docs/getting-started/migration/index.md` — запись о смене аргумента валидатора.
- `apps/docs/src/app/categories/docs/reference/handle/index.md` и `apps/docs/src/app/categories/examples/applications/pipeline/index.md` — упоминают валидатор, проверить формулировки.

Трекер:

- `.scratch/handle-eligibility-2026-10-17/issues/01-handle-may-accept-state.md` — комментарий: аргумент валидатора несёт ноды, неподвижный конец создаётся один раз на жест.

## 9. Что не проверено и побочные находки

Не проверено:

- **Поведение чужих библиотек в работе.** Ничего не запускалось; утверждения вида «валидатор видит переносимое ребро в хранилище» выведены из чтения исходников.
- **GoJS.** Исключение исходного порта из `maxLinks` при переподключении видно только в минифицированном `go-debug.js`; в документации такой формулировки нет.
- **Документация reactflow.dev и svelteflow.dev.** Цитаты взяты с живых страниц; репозиторий сайта закрыт, ссылок на строки нет.
- **Поиск обращений в xyflow.** Запрос «передать старое ребро в `isValidConnection`» не найден, но поиск по комментариям и обсуждениям GitHub неполон.
- **Foblex.** Пометка целей в начале жеста для создания соединения подтверждена текстом руководства и кодом переподключения, обработчик создания построчно не читался.
- **Вывод типов в шаблоне Angular.** `VflowComponent<N, E>` получит `N` и из `[nodes]`, и из `[connection]`. Не проверено, что вывод сходится, когда приложение объявляет `ConnectionSettings` без параметров или с более узким типом ноды.
- **Сравнения по числу строк** сделаны по набросам кода в этом отчёте; наброски не компилировались.

Побочные находки, вне задачи:

- **Переподключение между handle типа `any` может развернуть ребро.** `ConnectionService.toConnection` передаёт в `adjustDirection` неподвижный handle как `source`. Для типизированных handle роли восстанавливаются, а для пары `any`–`any` направление жеста сохраняется, и при переносе конца-источника бывшая цель становится источником. Выведено из чтения `connection.service.ts` и `utils/adjust-direction.ts`, не запускалось. В демо карты отношений handle как раз `any`, но переподключение там выключено.
- **`source !== target` в валидаторе карты отношений** повторяет встроенное правило.
- **`(connect)` отдаёт плоский `Connection`,** и обработчики pipeline и ERD ищут ноду по id ещё раз, чтобы узнать тип порта. Это один поиск на жест, не на наведение; менять не предлагаю.

[xy-type]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/types/general.ts#L148
[xy-handle]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xyhandle/XYHandle.ts#L299-L316
[xy-anchors]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/EdgeWrapper/EdgeUpdateAnchors.tsx#L93
[xy-wrapper]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/EdgeWrapper/index.tsx#L65
[xy-handle-react]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/Handle/index.tsx#L168-L169
[xy-limit]: https://reactflow.dev/examples/nodes/connection-limit
[xy-cycles]: https://reactflow.dev/examples/interaction/prevent-cycles
[xy-vue-handle]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/vue/src/types/handle.ts#L5-L14
[xy-vue-changelog]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/vue/CHANGELOG.md#L161
[xy-svelte-anchor]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/components/EdgeReconnectAnchor/EdgeReconnectAnchor.svelte#L85-L88
[xy-2710]: https://github.com/xyflow/xyflow/discussions/2710
[xy-4123]: https://github.com/xyflow/xyflow/discussions/4123
[xy-5632]: https://github.com/xyflow/xyflow/issues/5632
[vf1-type]: https://github.com/bcakmakoglu/vue-flow/blob/8f609f99842cd97717dfb6e849fecce4a1b8c67f/packages/core/src/types/handle.ts#L30-L33
[joint-types]: https://github.com/clientIO/joint/blob/4c593a4d10828537f31f9dd497080ca067f6918b/packages/joint-core/types/dia.d.ts#L1811-L1816
[joint-linkview]: https://github.com/clientIO/joint/blob/4c593a4d10828537f31f9dd497080ca067f6918b/packages/joint-core/src/dia/LinkView.mjs#L1937-L1975
[joint-allowlink]: https://docs.jointjs.com/api/dia/Paper/#allowlink
[x6-options]: https://github.com/antvis/X6/blob/10ac74673a183143e842e42154e543532bfde0cf/src/graph/options.ts#L209-L243
[x6-edge]: https://github.com/antvis/X6/blob/10ac74673a183143e842e42154e543532bfde0cf/src/view/edge/index.ts#L2305-L2351
[gojs-lv]: https://gojs.net/latest/api/symbols/LinkingBaseTool.html#linkvalidation
[gojs-node-lv]: https://gojs.net/latest/api/symbols/Node.html#linkvalidation
[gojs-intro]: https://gojs.net/latest/learn/validation
[gojs-cycle]: https://gojs.net/latest/api/symbols/LinkingBaseTool.html#isvalidcycle
[mx-type]: https://github.com/maxGraph/maxGraph/blob/bd728a2afec38753b7de42c2b336edd00e3532fc/packages/core/src/view/mixin/ValidationMixin.type.ts#L39-L80
[mx-edgehandler]: https://github.com/maxGraph/maxGraph/blob/bd728a2afec38753b7de42c2b336edd00e3532fc/packages/core/src/view/handler/EdgeHandler.ts#L530-L540
[ngd-config]: https://github.com/synergycodes/ng-diagram/blob/613db59d54b3345ab84ff82693f2b65d232d1450/packages/ng-diagram/projects/ng-diagram/src/core/src/types/flow-config.interface.ts#L51-L76
[foblex-filter]: https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-flow/src/domain/f-connectors/calculate-target-connectors-to-connect/filter-connectable-targets.ts
[foblex-guide]: https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/apps/f-flow-portal/public/markdown/guides/connectors/connection-rules.md
[rete-guide]: https://retejs.org/docs/guides/validation/
[rete-classic]: https://github.com/retejs/connection-plugin/blob/343ee308f26694b5f48083ce81201e72b4ecb4f9/src/flow/builtin/classic/index.ts#L61-L123
[lg-connect]: https://github.com/jagenjo/litegraph.js/blob/0555a2f2a3df5d4657593c6d45eb192359888195/src/litegraph.js#L4393-L4403
[comfy-slots]: https://github.com/Comfy-Org/ComfyUI_frontend/blob/9bd2da371d01c0dae6a56f91090bb9bd2fdc0202/src/lib/litegraph/src/LGraphNode.ts#L4054-L4085
[comfy-move]: https://github.com/Comfy-Org/ComfyUI_frontend/blob/9bd2da371d01c0dae6a56f91090bb9bd2fdc0202/src/lib/litegraph/src/canvas/MovingInputLink.ts#L71-L92
[drawflow]: https://github.com/jerosoler/Drawflow/blob/ef8a88cdfbf2010cc0b641b94278be6db413938b/src/drawflow.js#L474-L476
[tldraw-canbind]: https://github.com/tldraw/tldraw/blob/e242d25a658942d32396cfaa2256f2352cffb937/packages/editor/src/lib/editor/shapes/ShapeUtil.ts#L307-L314
