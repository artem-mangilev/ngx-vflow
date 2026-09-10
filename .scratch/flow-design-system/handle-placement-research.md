# Расположение handles: React Flow, Foblex Flow и ngx-vflow

Дата проверки: 2026-09-10. Вопрос пользователя после исправления смещённых handles в Data and media pipeline: не возложили ли мы на handles лишнюю обязанность и как это устроено у других библиотек?

**Метод:** официальная документация и исходники, не статьи-сравнения. Исходники конкурентов зафиксированы по commit SHA; их приложения в браузере здесь не запускались. Это исследование контрактов и потока геометрии, **не сравнительный benchmark** и не доказательство универсальной поддержки любого CSS/scroll.

- React Flow: `@xyflow/react` **12.11.6** по package.json, snapshot [`0a1f9575b25679f2880175de8d3eae21aedde921`][rf-version].
- Foblex Flow: `@foblex/flow` **19.1.7** по package.json, snapshot [`fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b`][ff-version]. Это уже unified `fConnector`; старые `fNodeInput` / `fNodeOutput` сохранены как deprecated. [ff-api]
- ngx-vflow: локальный `HEAD 4db7936d` плюс незакоммиченный positioned-anchor fix. Ссылки ниже на рабочие файлы, не утверждение о выпущенной версии.

## Короткий вывод

**Да, есть конкретная возможность упростить наш контракт.** В основном DOM-пути обе изученные библиотеки получают геометрию соединения **из фактического прямоугольника handle/connector**. Расположение элемента уже определено HTML/CSS. [rf-dom] [rf-endpoint] [ff-rect] [ff-resolve]

Наш custom-handle путь делает дополнительную работу: измеряет **родителя** `<handle>`, берёт его центр вдоль одной оси, проецирует порт на сторону **всей ноды**, а затем записывает CSS-положение самого handle. Последний fix переводит эти CSS-координаты в реальный containing block. Он исправляет текущую модель, но не устраняет её дополнительную обязанность. [our-model] [our-component]

Практическое направление: **CSS располагает handle; core измеряет handle и привязывает связь к нему.** Это не означает «убрать измерения», «считать endpoint центром ноды» или «избавиться от batching». Это означает перестать одновременно выводить положение порта из родителя и управлять его DOM-положением через результаты того же измерения.

## 1. Сравнение ответственности

| Вопрос                              | React Flow                                                                                   | Foblex Flow                                                                                                                                          | ngx-vflow сейчас                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Что является connector-элементом?   | `<Handle>` рендерит `div`. [rf-handle]                                                       | Директива на пользовательском HTML/SVG-элементе; можно на самом node host. [ff-api] [ff-directive]                                                   | `<handle>` создаёт внутренний wrapper, внешний host имеет `display: contents`. [our-template] [our-css]                                  |
| Кто располагает видимый элемент?    | Базовые CSS-правила по `position`, переопределяемые приложением. [rf-css] [rf-doc]           | CSS приложения либо официальные SCSS mixins. Connector-директива не записывает координаты host. [ff-directive] [ff-css]                              | Для custom handles core вычисляет insets по родителю и размерам ноды; CSS добавляет translate/offset. [our-model] [our-template]         |
| Что измеряется для endpoint?        | Фактический handle относительно node DOM. [rf-dom]                                           | Фактический connector host, нормализованный в flow space. [ff-rect] [ff-resolve]                                                                     | Центр anchor-родителя и размер handle; поперечная координата берётся из границы ноды. [our-model]                                        |
| Что означает сторона?               | Дефолтное CSS-положение + сторона выхода связи из измеренного handle. [rf-css] [rf-endpoint] | Сторона docking; фиксированная либо вычисляемая, отдельно от CSS-позиции элемента. [ff-sides] [ff-fixed]                                             | Сторона всей ноды, куда core помещает wrapper; также направление связи. [our-model]                                                      |
| Перестановка портов без resize ноды | Документированный `useUpdateNodeInternals(id)`. [rf-update-doc] [rf-update]                  | Документированный `FNodeDirective.refresh()`; есть `FFlowComponent.redraw()`, optional cache нужно учитывать. [ff-node-doc] [ff-flow-doc] [ff-cache] | Observers на wrapper, anchor и handle плюс render/lifecycle scheduling; отдельного публичного row-scroll контракта нет. [our-controller] |

## 2. React Flow: CSS сначала, измерение потом

### 2.1. Default placement — обычный CSS

`HandleComponent` рендерит `div`, устанавливает `data-handleid`, `data-handlepos`, классы стороны и обработчики взаимодействия, передаёт пользовательские HTML props. Он **не вычисляет inline `top/left` из прямоугольника родителя**. [rf-handle]

В базовом CSS:

- `position: absolute`;
- left: `left: 0; top: 50%; transform: translate(-50%, -50%)`;
- right: `right: 0; top: 50%; transform: translate(50%, -50%)`;
- аналогично top/bottom. [rf-css]

Документация прямо говорит: для нескольких handles на одной стороне меняйте inline styles либо CSS-положение. Это **не алгоритм автоматического распределения портов по ряду**. [rf-doc]

Следствие для вложенной строки: если её CSS делает строку containing block, стандартные `top: 50%` и `right: 0` относятся к строке. Библиотека затем измерит получившийся handle. Если строка не занимает всю ширину карточки, порт будет на краю строки, а не автоматически на краю всей ноды. Это вывод из CSS и измерителя, не отдельная гарантия для любых трансформаций DOM. [rf-css] [rf-dom]

### 2.2. Источник истины — DOM box handle

`getHandleBounds()` выполняет примерно следующее:

```text
handleRect = handle.getBoundingClientRect()
nodeRect = node.getBoundingClientRect()

handleLocalX = (handleRect.left - nodeRect.left) / renderedZoom
handleLocalY = (handleRect.top  - nodeRect.top)  / renderedZoom
```

Ширина/высота берутся через `getDimensions(handle)`; bounds сохраняются в `node.internals.handleBounds`. Zoom измеритель берёт из реально отрисованной CSS transform viewport, а не безусловно из самого нового значения store. [rf-dom] [rf-store]

Затем `getHandlePosition()` прибавляет абсолютное положение ноды и выбирает сторону **прямоугольника handle**:

```text
right endpoint = (handle.x + handle.width, handle.y + handle.height / 2)
left endpoint  = (handle.x,                handle.y + handle.height / 2)
```

То есть это не обязательно центр видимой точки и не обязательная проекция на границу ноды. [rf-endpoint]

Измеренные bounds идут в вычисление связи; в проверенном пути нет обратной записи этих bounds в CSS-положение handle. Поэтому ему не требуется обратный пересчёт через `offsetParent`, borders и padding box, который появился у нас. [rf-handle] [rf-store]

### 2.3. Простое расположение не отменяет lifecycle

Есть общий `ResizeObserver`, наблюдающий ноды и вызывающий обновление internals. Для программного изменения числа/положения handles документация требует `useUpdateNodeInternals`; hook ставит forced update через `requestAnimationFrame`. Автообновление при изменении node type/sourcePosition/targetPosition также существует. [rf-observer] [rf-node-observer] [rf-update]

Нельзя выводить отсюда, что React Flow автоматически замечает любое изменение внутри ноды. Scroll, перемещение строки или изменение её положения без изменения размеров наблюдаемой ноды не тождественны resize. Для скрытых handles документация рекомендует `visibility: hidden` / `opacity: 0`, не `display: none`, чтобы не терять измеримые размеры. Политика переноса скрытого endpoint к заголовку/границе этим не задаётся. [rf-doc] [rf-update-doc]

Есть и декларативный `node.handles` fallback в расчёте endpoints, когда DOM-derived bounds отсутствуют. Следовательно, «CSS-first DOM-путь» не означает запрета на заранее известную геометрию для недомовых сценариев. [rf-endpoint]

## 3. Foblex Flow: элемент является connector

### 3.1. Директива не является движком CSS-layout порта

`fConnector` регистрирует элемент, ID, тип и принадлежность ноде; управляет connectability/state. В host bindings нет записи `top/left/right/bottom` по размерам родительской ноды. [ff-directive]

Официальный API допускает:

- отдельный элемент-порт внутри ноды;
- connector на самом `[fNode]` — тогда connectable-областью становится нода. [ff-api]

Официальные SCSS mixins действительно предоставляют готовые sockets: `position: absolute`, CSS-размер, классы `.left/.right/...` с CSS-положением. Поэтому утверждение «Foblex вообще не предоставляет placement» неверно. Точное отличие: **placement задаёт CSS, а runtime измеряет его результат**, а не строит CSS-insets из node-space координат порта. [ff-css]

Мы не обязаны копировать публичные CSS-классы Foblex/React Flow: это отдельный выбор styling-контракта, у нас уже принят ADR-0007 о CSS-переменных.

### 3.2. Rect connector отдельно от способа docking

`ResolveConnectionEndpointRect` передаёт именно `connector.hostElement` в `GetNormalizedConnectorRect`. Нормализатор получает rect элемента, переводит положение в flow space, убирает масштаб, учитывает offset size и скругления. Делегат `RectExtensions.fromElement()` также проверен в опубликованном `@foblex/2d@1.2.2` (`package/esm2015/rect/rect.extensions.js` в npm-архиве): он вызывает `element.getBoundingClientRect()`. [ff-2d] Это более развитая геометрия, чем «взять два числа из DOM», но она не переставляет сам connector. [ff-resolve] [ff-rect] [ff-coordinates]

Далее выбирается поведение соединения:

- **fixed:** середина выбранной стороны connector rect;
- **fixed_center:** центр connector rect;
- **floating:** пересечение направления между центрами с контурами connector rects, с учётом соответствующего rotation context. [ff-fixed] [ff-center] [ff-floating]

Важно: `sourceRect` здесь — rect connector, **не всегда rect ноды**. Если connector стоит на node host, rect естественно становится прямоугольником ноды; отдельной неявной проекции вложенного порта к границе всей ноды не требуется. [ff-api] [ff-resolve]

`AUTO` connectable side тоже не передвигает connector. Он выбирает сторону по расположению connector относительно ноды; в проверенном алгоритме есть memoization и hysteresis, чтобы сторона не дрожала. Это отдельная routing-обязанность. [ff-sides] [ff-auto]

### 3.3. Измерения, refresh и cache никуда не исчезают

Foblex наблюдает node host через `FResizeChannel` (`ResizeObserver`) и объединяет resize со `stateChanges`. Обновления включают invalidation, пересчёт сторон и scoped notification для связей ноды. Добавление/удаление connector вызывает node refresh. [ff-resize] [ff-channel] [ff-node-base]

Публичные docs отдельно описывают `FNodeDirective.refresh()` для изменений geometry/anchors и `FFlowComponent.redraw()` для запроса перерисовки связей. Optional geometry cache по умолчанию выключен; считать любой redraw безусловным полным DOM-измерением при включённом cache нельзя. [ff-node-doc] [ff-flow-doc] [ff-cache]

В рассмотренных connector/node-resize путях нет подписки на произвольный внутренний DOM-scroll. Это **не утверждение об отсутствии любого scroll-related кода во всей библиотеке**: canvas scrolling — другой сценарий. Универсальную автоматическую поддержку scroll/collapse портов строк этот материал не доказывает.

## 4. Где сложность появляется у нас

Текущий поток для custom handle:

```text
parent DOM rect + node DOM rect + handle size
  → центр parent в node space
  → проекция на выбранную сторону всей ноды
  → координата endpoint в node space
  → CSS insets wrapper
  → пересчёт insets в containing block (последний fix)
  → браузер размещает wrapper
```

Это видно в `HandleModel.measure()`, `computeHandleGeometry()` и bindings `layoutStyles` в шаблоне. `hostReference` берётся из родителя `<handle>`. [our-model] [our-component] [our-template]

В pipeline строка с `position: relative` стала CSS containing block. До исправления node-space `top` прибавлялся к смещению строки ещё раз. После исправления core дополнительно компенсирует её смещение и borders. Сам fix корректен в рамках существующей обязанности — это подтверждено нашим regression test, а не результатом запуска конкурентов. [our-test]

Но **эта обязанность не является обязательной для модели DOM-портов**. У изученных конкурентов основной поток короче:

```text
HTML/CSS размещает connector
  → чтение его реального DOM box
  → нормализация / cache
  → выбор точки на connector box
  → связь
```

Принципиальная развилка: нужен ли нам общий порт «в этом месте DOM», либо общий anchor «из этой строки спроецируй порт на край всей ноды»? Сегодня второе поведение неявно встроено в первое.

## 5. Рекомендация для ngx-vflow — предложение, не принятое решение

### Один основной контракт вместо двух неявно смешанных моделей

Предпочтительный кандидат:

1. **Handle — измеримый элемент с ID и стороной выхода связи.** Положение определяется обычным layout; core читает фактический rect.
2. Дефолтное положение по стороне предоставляется CSS. Прикладной layout и UI-композиции размещают порты строк, в том числе через positioned rows, grid/flex или отдельную колонку портов.
3. Endpoint рассчитывается из rect handle; node border не подставляется вместо его реальной поперечной координаты.
4. На измерениях остаются batching, нормализация относительно отрисованного viewport, cache/invalidation и барьер «не показывать связь до готовности endpoints».
5. Wrapper semantics, eligibility, IDs, connection interaction и независимый hit target остаются у core. Изменение placement **не требует** автоматически превращать компонент в директиву или отдавать ARIA приложению.

Это рекомендация по ответственности, не обещание ускорения и не предложение скопировать mediator/cache/registry архитектуру Foblex.

### Что потенциально можно удалить

При принятии этого контракта из основного DOM-пути исчезают:

- использование parent center как источника положения handle;
- автоматическая проекция на границу ноды;
- запись вычисленных `layoutStyles` в handle wrapper;
- обратный перевод node-space insets в `offsetParent` и компенсация его borders.

Останутся измерение реального handle, перевод client space → node/flow space, lifecycle и пересчёт связей. Упрощение имеет смысл только если мы действительно убираем прежнее правило, а не оставляем оба алгоритма навсегда за новыми флагами.

### Где станет сложнее приложению

Если поле находится глубоко внутри узкой body-области, а порт обязан всегда быть на внешней границе карточки, CSS-first сам это не выведет. UI-композиция должна явно обеспечить такой layout. Например, строка/слой портов может занимать ширину карточки; форма и текст внутри неё получают отдельный padding.

Если неявная проекция к внешней границе действительно является необходимым core feature, удалять её только ради меньшего числа строк нельзя: сложность просто разойдётся по потребителям. Тогда её стоит сначала назвать отдельной обязанностью и проверить на нескольких реальных композициях, а не прятать в общем `<handle>`.

### Что необходимо решить до изменения кода

- Поддерживаем ли мы порты **внутри** ноды в их фактической DOM-позиции, без проекции наружу? У DOM-first моделей это естественный случай.
- Как выглядит простой default handle и что измеряется: сам порт или расширенный hit target? Декоративный символ и магнитная область не должны случайно менять endpoint.
- Какая гарантия обновления после reflow/reorder без node resize? Явный refresh допустим у обоих конкурентов; автоматизация должна иметь понятную область действия.
- Что делают скрытые/скроллируемые endpoints? Это отдельная политика, не побочный эффект измерителя. Предыдущее [исследование скрытых endpoints](hidden-endpoints-research.md) остаётся актуальным.

**Конфликт с текущим ADR:** перенос расположения wrapper из runtime core в CSS потребует пересмотра фразы «library positions the handle wrapper» в [ADR-0001](../../docs/adr/0001-native-html-node-rendering.md). [ADR-0004](../../docs/adr/0004-library-owned-accessibility-wrappers.md) о library-owned semantics сохраняется. [ADR-0007](../../docs/adr/0007-css-custom-properties-for-appearance.md) о переменных тоже сохраняется: не нужно публиковать внутренние классы ради CSS-first layout.

## 6. Как проверить предложение, не начинать новый большой рефакторинг

Следующий разумный шаг — отдельный небольшой прототип DOM-first placement на **трёх** существующих композициях: простой node-side порт, pipeline с positioned rows, ERD с rename/reorder. Не добавлять сразу второй постоянный mode, общий anchor registry или hidden-port engine.

Проверить:

- все четыре стороны, несколько портов, разные размеры визуала;
- endpoint против фактического DOM box, а не только edge против model coordinate;
- borders/padding/positioned ancestors и zoom 0.5 / 1 / 1.5;
- первый видимый кадр, появление/удаление handles, resize содержимого;
- pan/zoom без повторного обхода неизменённых списков графа;
- изменение CSS-цвета без geometry measurement;
- отдельно зафиксированные ограничения scroll/collapse.

Сравнить не только размер `HandleModel`, но и сложность кода трёх потребителей. Только после этого принимать новый Interface. **В рамках этого исследования код библиотеки не менялся.**

## Первичные источники

### React Flow

[rf-version]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/package.json
[rf-doc]: https://reactflow.dev/learn/customization/handles
[rf-update-doc]: https://reactflow.dev/api-reference/hooks/use-update-node-internals
[rf-handle]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/Handle/index.tsx
[rf-css]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/styles/init.css#L233-L271
[rf-dom]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/dom.ts#L63-L96
[rf-endpoint]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/edges/positions.ts
[rf-store]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/store.ts#L401-L490
[rf-observer]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/container/NodeRenderer/useResizeObserver.ts
[rf-node-observer]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/useNodeObserver.ts
[rf-update]: https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useUpdateNodeInternals.ts

### Foblex Flow

Документация ниже — Markdown официального сайта из того же зафиксированного snapshot, не сторонний пересказ.

[ff-version]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/package.json
[ff-api]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/apps/f-flow-portal/public/markdown/guides/connectors/f-connector-directive.md
[ff-directive]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/f-connectors/f-connector/f-connector.directive.ts
[ff-css]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/styles/domains/_connector.scss
[ff-rect]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/domain/get-normalized-connector-rect/get-normalized-connector-rect.ts
[ff-resolve]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/domain/f-connection/redraw-connections/shared/resolve-connection-endpoint-rect/resolve-connection-endpoint-rect.ts
[ff-coordinates]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/utils/calculate-pointer-in-flow.ts
[ff-2d]: https://registry.npmjs.org/@foblex/2d/-/2d-1.2.2.tgz
[ff-fixed]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/f-connection-v2/utils/connection-behaviour/utils/fixed-outbound-behavior.ts
[ff-center]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/f-connection-v2/utils/connection-behaviour/utils/fixed-center-behavior.ts
[ff-floating]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/f-connection-v2/utils/connection-behaviour/utils/floating-behavior.ts
[ff-sides]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/domain/f-node/calculate-connectors-connectable-sides/calculate-connectors-connectable-sides.ts
[ff-auto]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/domain/f-node/calculate-connectors-connectable-sides/calculate-connectable-side-by-internal-position/calculate-connectable-side-by-internal-position.ts
[ff-resize]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/domain/f-node/update-node-when-state-or-size-changed/update-node-when-state-or-size-changed.ts
[ff-channel]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/reactivity/f-resize-channel.ts
[ff-node-base]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/f-node/f-node-base.ts
[ff-node-doc]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/apps/f-flow-portal/public/markdown/guides/nodes/f-node-directive.md
[ff-flow-doc]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/apps/f-flow-portal/public/markdown/guides/containers/f-flow-component.md
[ff-cache]: https://github.com/Foblex/f-flow/blob/fc9f6f0ce53650c58bc52e994d0ddee3179a7e0b/libs/f-flow/src/f-cache/config/f-cache-options.ts

### ngx-vflow, рабочее дерево

[our-model]: ../../libs/ngx-vflow/src/lib/vflow/models/handle.model.ts
[our-component]: ../../libs/ngx-vflow/src/lib/vflow/public-components/handle/handle.component.ts
[our-template]: ../../libs/ngx-vflow/src/lib/vflow/public-components/handle/handle.component.html
[our-css]: ../../libs/ngx-vflow/src/lib/vflow/public-components/handle/handle.component.scss
[our-controller]: ../../libs/ngx-vflow/src/lib/vflow/directives/node-handles-controller.directive.ts
[our-test]: ../../libs/ngx-vflow/src/lib/vflow/initial-handles.spec.ts
