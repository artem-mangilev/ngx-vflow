# Аудит публичного API ngx-vflow, 2026-09-27

Охват: четыре entry point — `ngx-vflow` ([public-api.ts](../../libs/ngx-vflow/src/public-api.ts)), `ngx-vflow/testing`, `@vflow/ui`, `@vflow/ui/bpmn`. Исходники не менялись.

Метод: чтение кода всех экспортов; 8 runtime-проб в Karma (временный spec в дереве библиотеки, удалён после прогона); три параллельных read-only прохода — UI-пакет, моки `testing`, расхождения документации с кодом. **(run)** — подтверждено запуском, остальное — чтением кода.

Категории из запроса: 1 — не работает, 2 — работает неочевидно, 3 — избыточно, 4 — неконсистентно. В конце — приоритеты.

---

## 1. Неработающий API

### 1.1 `viewportTo()` обходит `minZoom`/`maxZoom`, а `zoomTo()` — нет (run)

`maxZoom=2`: `viewportTo({x:0, y:0, zoom:10})` → zoom 10; `zoomTo(10)` → zoom 2. Ветка `x`+`y` в [viewport-gestures.directive.ts:160-162](../../libs/ngx-vflow/src/lib/vflow/directives/viewport-gestures.directive.ts) берёт zoom без `clamp`, ветка «только zoom» (строка 155-159) — с ним. В сервисе висит `TODO: add writableViewportWithConstraints` ([viewport.service.ts:44](../../libs/ngx-vflow/src/lib/vflow/services/viewport.service.ts)).

### 1.2 Два программных вызова viewport в одном тике — первый теряется (run)

`zoomTo(1.5); panTo({x:123, y:45})` → `{x:123, y:45, zoom:1}`. Все методы пишут в один сигнал `writableViewport`, а применяет его `effect` ([viewport-gestures.directive.ts:105-109](../../libs/ngx-vflow/src/lib/vflow/directives/viewport-gestures.directive.ts)) — видит только последнее значение. Так же пропадёт `fitView(); zoomTo(1)`. Рядом: у `viewportTo`/`zoomTo`/`panTo` нет `duration`, хотя конвейер анимацию поддерживает и `fitView({duration})` её использует ([vflow.component.ts:579-617](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)).

### 1.3 `getNodesBounds()` не знает размер content-sized узлов (run)

Два узла по 200×100 в `(0,0)` и `(400,0)` → `{x:0, y:0, width:400, height:0}`. Хелпер читает `node.width?.() ?? 0` ([graph.ts:83-84](../../libs/ngx-vflow/src/lib/vflow/utils/graph.ts)), а в 3.0 узел без `width`/`height` — режим `auto`, и измеренный размер живёт во внутренней модели. Публичного способа получить измеренный размер `auto`-узла вне презентации нет: `getNode()` отдаёт объект приложения без размера. Для layout (dagre/elk) это главный сценарий.

### 1.4 Измеренный/изменённый resizer'ом размер некуда записать (run)

Док резайзера велит «persist the size only when `mode` is `explicit`». Но `NodeModel` читает `rawNode.width`/`height` только в конструкторе ([node.model.ts:219-225](../../libs/ngx-vflow/src/lib/vflow/models/node.model.ts)): добавить `node.width = signal(300)` в существующий объект и отдать новый массив — узел остаётся 200×100. Работает только замена объекта узла, то есть новая модель, пересоздание view и пара `remove`+`add` в изменениях. JSDoc `NodeSizeChange` «already been written to the node's size signals» ([node-change.type.ts:17](../../libs/ngx-vflow/src/lib/vflow/types/node-change.type.ts)) для `auto`-узла без сигналов неверен.

### 1.5 `<mini-map>` нельзя убрать (run)

`@if (show) { <mini-map /> }` → `show=false` → canvas миникарты остаётся. `MiniMapComponent` регистрирует шаблон в `ngOnInit` и не снимает его ([minimap.component.ts:35-40](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap.component.ts)); ни `ngOnDestroy`, ни сброса `flowEntitiesService.minimap` нет.

### 1.6 Сигналы `nodesChange`/`edgesChange` теряют события (run)

Две позиции в одном тике: `nodesChange$` выдал две пачки (`a`, `b`), сигнал `nodesChange()` — только `b`. Позиции эмитятся по пачке на узел ([node-changes.service.ts:16-29](../../libs/ngx-vflow/src/lib/vflow/services/node-changes.service.ts)), а сигнал хранит последнюю. Поток событий как сигнал принципиально lossy: при перетаскивании нескольких узлов потребитель сигнала видит один.

### 1.7 `ngx-vflow/testing` частично сломан (run, агент)

- Specs из `libs/ngx-vflow/testing` не запускаются: `sourceRoot` проекта — `libs/ngx-vflow/src` ([project.json:3](../../libs/ngx-vflow/project.json)), karma их не видит. Если запустить, `all-mocks.spec.ts` падает: `provideZonelessChangeDetection()` стоит в `imports` ([all-mocks.spec.ts:156](../../libs/ngx-vflow/testing/src/all-mocks.spec.ts)).
- Документированный пример `provideCustomNodeMocks` с реальным `Vflow` и `<div resizable>` падает с NG0201 `RequestAnimationFrameBatchingService`: сервис даёт только `VflowComponent`, а `provide-custom-node-mocks.ts` его не провайдит.
- Component edges не тестируются вообще: нет `EDGE_REF`/`EdgeComponent` → `injectEdge()`, `hostDirectives: [EdgeInteractionDirective]` и `*edgeLabel` падают с NG0201.
- `VflowMockComponent` не рендерит component-узлы, рендерит component-рёбра через `ng-template[edge]`, не даёт `NODE_REF` содержимому шаблона. В edge-контексте нет `preselected`/`shouldLoad`.
- У мока нет host-directive outputs: `(nodesChanges*)`, `(edgesChanges*)`, `(nodeDrag*)` компилируются и молча становятся DOM-listener'ами. `AsInterface<VflowComponent>` этого не ловит — outputs host directives не члены класса.
- Нет моков для `NodeResizeControlComponent`, `ChangesControllerDirective`, `NodeDragControllerDirective`, `vflowNo*`. Сигнатуры `getNodesAtPoint()` (без `point`) и `startReconnection` разошлись с реальными; мок-`viewportChange$` эмитит начальное значение, реальный — нет.

### 1.8 `@vflow/ui` (агент)

- Peer `"ngx-vflow": "^2.7.0 || ^3.0.0"` ([libs/ui/package.json](../../libs/ui/package.json)), но `VflowPort` импортирует `VflowHandleDirective`/`HandleState`, которых в 2.x нет.
- Дефолты inputs, названных как селектор, не применяются к голому атрибуту: `<div vflowBpmnGateway>` → `data-gateway=""`, маркера ×/+ нет ([bpmn.directive.ts:25-30](../../libs/ui/bpmn/src/lib/bpmn.directive.ts)). Так же `vflowTheme` (не `light`, `--vflow-background` не задаётся) и `vflowStatus` (`data-tone=""`).

---

## 2. Неочевидный API

### 2.1 Соединения включаются подпиской на output

Селектор `ConnectionControllerDirective` — это имена outputs: `[connectStart], [connect], [connectEnd], [reconnectStart], [reconnect], [reconnectEnd]` ([connection-controller.directive.ts:31](../../libs/ngx-vflow/src/lib/vflow/directives/connection-controller.directive.ts)). `vflowHandle` инжектит его как optional и молча ничего не делает без него ([handle.directive.ts:47, 120](../../libs/ngx-vflow/src/lib/vflow/directives/handle.directive.ts)). Следствия:

- импортирован `VflowComponent` вместо массива `Vflow` → `(connect)` компилируется как DOM-событие, handles инертны, ошибки нет;
- не подписан ни один connection-output → соединения невозможны, хотя handles выглядят рабочими.

`ChangesControllerDirective` и `NodeDragControllerDirective` при этом — host directives `vflow` ([vflow.component.ts:97-117, 147](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)). Одинаковые по природе outputs подключены двумя механизмами.

Та же беззвучность у headless-рёбер: ребро без `ng-template[edge]` и без `component` не рендерится, dev-предупреждения нет ([edge.component.html:3-15](../../libs/ngx-vflow/src/lib/vflow/components/edge/edge.component.html)). Живой пример — [apps/consumer/src/app/core-app.component.ts:35-58](../../apps/consumer/src/app/core-app.component.ts): два ребра без edge-шаблона и без `(connect)` — рёбра невидимы, handles инертны.

### 2.2 Выбор кликом: узлу нужен `selectable`, ребру — `edgeInteraction`

- Узел выделяется по клику, только если в презентации есть атрибут `selectable` ([selectable.directive.ts](../../libs/ngx-vflow/src/lib/vflow/directives/selectable.directive.ts)); у `NodeComponent` есть неиспользуемый `selectNode()` ([node.component.ts:194](../../libs/ngx-vflow/src/lib/vflow/components/node/node.component.ts)).
- Ребро выделяется кликом по штриху, который рисует `g[edgeInteraction]`; `[selectable]` в edge-шаблоне ничего не делает — директива ищет только `NodeComponent` (строки 17, 42-44).
- Одно слово — две сущности: `Node.selectable` / `[nodesSelectable]` = право на выбор; `[selectable]` = триггер клика. В `@vflow/ui` каждая оболочка узла требует пару `selectable` + `[vflowSelected]="ctx.selected() || ctx.preselected()"` — 38 копий в docs и consumer.

### 2.3 `Edge.interactionWidth` зависит от шаблона

JSDoc: «the transparent stroke the flow draws» ([edge.interface.ts:34-40](../../libs/ngx-vflow/src/lib/vflow/interfaces/edge.interface.ts)). Рисует его не flow, а `g[edgeInteraction]` / `hostDirectives: [EdgeInteractionDirective]` ([edge-interaction-area.ts:34](../../libs/ngx-vflow/src/lib/vflow/utils/edge-interaction-area.ts)). Без директивы у ребра нет hit area, свойство данных ни на что не влияет.

### 2.4 Опциональные сигналы `Node` значат разное

- `width` + `height`: наличие переключает режим размера (`auto` ↔ `explicit`, [node.model.ts:124-128](../../libs/ngx-vflow/src/lib/vflow/models/node.model.ts)).
- `selected`, `draggable`, `extent`, `point`: наличие решает только, видит ли приложение состояние. Без `selected` выделение живёт во внутреннем сигнале, `getNode(id).selected` — `undefined`.

`createNode()` по умолчанию создаёт вторые, `{ useDefaults: false }` — нет. Какое состояние «application-owned», зависит от того, как создан объект.

### 2.5 Прочее

- `panTo(point)` — это translation, не точка графа; об этом предупреждает собственный JSDoc ([vflow.component.ts:600-613](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)). Метода «центрировать на точке графа» нет.
- `elevateNodesOnSelect` поднимает узел на любой клик (`(click)="pullNode()"`, [node.component.html:1](../../libs/ngx-vflow/src/lib/vflow/components/node/node.component.html)), ребро — на `pointerdown` ([edge.component.ts:39](../../libs/ngx-vflow/src/lib/vflow/components/edge/edge.component.ts)), а не на выбор.
- `[autoPan]` читается один раз в `ngOnInit` ([auto-pan.directive.ts:41](../../libs/ngx-vflow/src/lib/vflow/directives/auto-pan.directive.ts)) — единственный нереактивный input.
- `view` по умолчанию `[400, 400]` ([flow-settings.service.ts:25](../../libs/ngx-vflow/src/lib/vflow/services/flow-settings.service.ts)); почти всем нужен `'auto'`.
- `getNodesAtPoint()` возвращает копии `{...node, nodeSpacePoint}` (run: `=== node` → false), `getNode()`/`getIntersectingNodes()` — объекты приложения ([vflow.component.ts:646-657](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)).
- JSDoc `[selectionBox]` описывает опцию `color`, которой нет в `SelectionBoxSettings` ([vflow.component.ts:364-369](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)). `FitViewOptions.padding` — доля (0.1), JSDoc «Padding for viewport» этого не говорит.
- `lazyLoadTrigger: 'viewport'` не действует на eager-классы компонентов, а шаблоны должны сами гейтить себя через `@defer (when ctx.shouldLoad())` ([node.model.ts:171-190](../../libs/ngx-vflow/src/lib/vflow/models/node.model.ts)). Документировано, но несимметрично.
- `addEdges` молча (без warning) отбрасывает ребро с тем же `source/target/handles` ([graph-operations.ts:200](../../libs/ngx-vflow/src/lib/vflow/utils/graph-operations.ts)); все остальные отказы предупреждают. Параллельные рёбра через хелпер невозможны.
- Геттер `connection` возвращает внутренний `ConnectionModel`, а не `ConnectionSettings`, которые принимает сеттер ([vflow.component.ts:388-397](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)).
- Жест соединения по умолчанию отклоняет self-connection и пары одинаковых типов ([connection.model.ts:11-17](../../libs/ngx-vflow/src/lib/vflow/models/connection.model.ts)), а `addEdges` self-connection принимает. Docs говорят «by default, every connection is valid»; `allowSelfConnections` нигде не описан.
- `Node.extent` по умолчанию `'parent'`: дочерний узел нельзя вытащить за родителя ([node.interface.ts:13](../../libs/ngx-vflow/src/lib/vflow/interfaces/node.interface.ts)). Страница subflows этого не говорит.
- Императивный API доступен только через ссылку на `VflowComponent`, но страница testing просит не делать `viewChild(VflowComponent)` — мок подменяет класс; 13 демо делают именно так.

---

## 3. Избыточный API

### 3.1 Три канала изменений и 9 отфильтрованных outputs

Для узлов: output `(nodesChanges)` + 5 outputs `(nodesChanges.position|size|add|remove|select)` + сигнал `nodesChange` + observable `nodesChange$`. Для рёбер то же (5 outputs). Подканалы — это `filter(type)` ([changes-controller.directive.ts:76-88](../../libs/ngx-vflow/src/lib/vflow/directives/changes-controller.directive.ts)). Сигнал к тому же lossy (1.6).

Проще: оставить `(nodesChanges)`/`(edgesChanges)`, удалить сигналы, подканалы — под вопросом (фильтр по `type` — одна строка у потребителя).

### 3.2 Три метода записи viewport

`viewportTo(state)`, `zoomTo(zoom)`, `panTo(translation)` пишут в один `Partial<ViewportState>`. Проще: `setViewport(partial, { duration })` с clamp'ом, плюс `setCenter(flowPoint, { zoom, duration })` для частого случая из 2.5.

### 3.3 Внутренности в публичном барреле

- `ChangesControllerDirective` (селектор `[changesController]`, вне `vflow` падает по DI) и `NodeDragControllerDirective` (без селектора) — нужны только их типы событий.
- `NodeResizeControlComponent` — экспортирован, но не в `Vflow`, без мока; API на callback-inputs (`onResizeStart`/`onResize`/`onResizeEnd`).
- Из `resizer-types`: `CoordinateExtent`, `NodeOrigin` (всегда `[0,0]`), `RESIZER_HANDLE_POSITIONS`, `RESIZER_LINE_POSITIONS`, `ResizeControlVariant` (единственный `enum` в API), `OnResizeStart`/`OnResize`/`OnResizeEnd`.
- `NODE_DEFAULTS` со `width: 100, height: 50` — после 3.0 к данным не применяется (размер по умолчанию только у внутренней модели до замера); вводит в заблуждение. `EDGE_DEFAULTS`, `MARKER_DEFAULT_TYPE` — сомнительно.
- `isComponentNode()` — однострочник без пары для рёбер.
- Двойной `export * from connection.interface` ([public-api.ts:20-21](../../libs/ngx-vflow/src/public-api.ts)).
- Три одинаковых интерфейса `NodeDragStartEvent`/`NodeDragEvent`/`NodeDragEndEvent` = `{ node }` ([node-drag-controller.directive.ts:7-18](../../libs/ngx-vflow/src/lib/vflow/directives/node-drag-controller.directive.ts)).

### 3.4 Фабрики узлов и рёбер

`createNode`/`createNodes`/`createEdge`/`createEdges` × 3 overload'а `useDefaults` + `StaticNode`/`NodeWithDefaults`/`StaticEdge`/`EdgeWithDefaults`. `createNodes` = `nodes.map(createNode)`. `useDefaults` влияет не на поведение (модель подставит дефолты сама), а на то, какие сигналы получит приложение (2.4) — это стоит назвать прямо или убрать.

### 3.5 Два выключателя выбора

`[selectionMode]="'manual'"` и `[nodesSelectable]="false"` + `[edgesSelectable]="false"` (+ `Node.selectable`). Разница тонкая: `manual` также отключает выбор с клавиатуры и сброс кликом по pane ([selection.service.ts:69](../../libs/ngx-vflow/src/lib/vflow/services/selection.service.ts), [manual-selection.strategy.ts](../../libs/ngx-vflow/src/lib/vflow/strategies/manual-selection.strategy.ts)).

### 3.6 Координатные хелперы

- `getNodePositionInSpace(nodeId, spaceNodeId, nodes[])` перекрывается с `nodeSpaceToFlowPosition`/`flowToNodeSpacePosition(point, spaceNodeId, lookup)` ([coordinates.ts](../../libs/ngx-vflow/src/lib/vflow/utils/coordinates.ts)).
- Функция `clientToFlowPosition(point, { viewport, containerPosition })` и метод `vflow.clientToFlowPosition(point)` — одно имя, разные сигнатуры; позицию контейнера для функции приложение должно найти само.

### 3.7 `optimization.detachedGroupsLayer`

Это политика z-order для родительских узлов, а не оптимизация ([optimization.interface.ts:8-14](../../libs/ngx-vflow/src/lib/vflow/interfaces/optimization.interface.ts), [node.component.ts:114](../../libs/ngx-vflow/src/lib/vflow/components/node/node.component.ts)). Слово «group» противоречит глоссарию (`Parent node`, avoid «Group node»); там же `AriaLabelConfig.groupRole`.

### 3.8 Повторяющийся код у потребителя

Не избыточный API, а недостающий — код, который приложение пишет снова и снова:

- fit-on-load: `effect(() => { if (flow.initialized()) untracked(() => flow.fitView()); })` — 8 копий в демо; `untracked` обязателен, потому что `fitView` читает сигналы. Нет `(initialized)` output и нет опции «fit при старте».
- `(deleteRequest)`: `removeNodes(nodeIds, { nodes, edges: removeEdges(edgeIds, edges) })` — 4 копии.
- `(connect)`: `addEdges([{ id: crypto.randomUUID(), ...connection }], …)` — 6 копий.
- Демо reconnection ведёт флаг успеха через три события, хотя `ReconnectEndEvent.valid` его уже несёт.
- Демо accessibility читает объявления через `MutationObserver` на приватном `[aria-live]` — события объявлений нет.

### 3.9 `@vflow/ui` (агент)

- `VflowSelected` повторяет `selected`/`preselected` из `NODE_REF`/`EDGE_REF`; мог бы брать их по умолчанию.
- `vflowPortState` → `data-state` дублирует core `data-vflow-handle-state` и может с ним разойтись.
- `VflowControls` сам clamp'ит zoom (core `zoomTo` уже clamp'ит) и дублирует шаг 1.2 клавиатуры, но не объявляет zoom в live region, как клавиатура.
- `VflowBpmnFlow` ≈ `VflowEdge` + dash; `VflowBpmnTask` ≈ `VflowNode`; Pool/Lane ≈ `VflowContainer`.

---

## 4. Неконсистентность

### 4.1 Префиксы селекторов и классов

| С префиксом                                                                                      | Без префикса                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vflow`, `[vflowHandle]`, `[vflowNoDrag]`, `[vflowNoPan]`, `[vflowNoWheel]`, `[vflowNoKeyboard]` | `[selectable]`, `[dragHandle]`, `g[edgeInteraction]`, `[resizable]`, `[nodeResizeControl]`, `mini-map`, `node-toolbar`, `ng-template[node\|edge\|connection\|marker\|edgeLabel]` |
| `VflowComponent`, `VflowHandleDirective`                                                         | `SelectableDirective`, `DragHandleDirective`, `NoDragDirective` (селектор с префиксом, класс без), `MiniMapComponent`, `ResizableComponent`                                      |

В `@vflow/ui` всё `Vflow*`/`vflow*`, в т. ч. элемент `vflow-controls` при core-элементах `mini-map`/`node-toolbar`. Data-атрибуты: core `data-vflow-*`; ui — `data-vui-theme`/`data-vui-selected`, но `data-tone`, `data-state`, `data-gateway` без префикса.

### 4.2 MiniMap / Minimap

`MiniMapComponent`, `MiniMapPosition`, `<mini-map>` против `minimapLabel`, `MinimapCanvasDirective`, `.vflow-minimap`, страницы docs «minimap».

### 4.3 События жизненного цикла

| Жест                           | start / move / end                           | Механизм                                     | Payload                             |
| ------------------------------ | -------------------------------------------- | -------------------------------------------- | ----------------------------------- |
| Соединение                     | `connectStart` / `connect` / `connectEnd`    | outputs директивы, выбранной по имени output | `Connection` без id                 |
| Перетаскивание                 | `nodeDragStart` / `nodeDrag` / `nodeDragEnd` | host directive                               | `{ node }` (только схваченный узел) |
| Resize (`[resizable]`)         | `resizeStart` / `resizeChange` / `resizeEnd` | outputs                                      | `ResizeParams` без узла             |
| Resize (`[nodeResizeControl]`) | `onResizeStart` / `onResize` / `onResizeEnd` | callback-inputs                              | `(event, params)`                   |

Середина называется то глаголом (`connect`, `nodeDrag`), то `Change` (`resizeChange`); у одного и того же resize — два стиля.

### 4.4 Способы получить событие

| Что                                           | output             | signal        | observable                         |
| --------------------------------------------- | ------------------ | ------------- | ---------------------------------- |
| изменения узлов/рёбер                         | да (+5 подканалов) | да (lossy)    | да                                 |
| viewport                                      | —                  | `viewport`    | `viewportChange$` (без начального) |
| готовность                                    | —                  | `initialized` | `initialized$`                     |
| connect / drag / delete / события компонентов | да                 | —             | —                                  |

`componentNodeEvent`/`componentEdgeEvent` типизированы `any` ([vflow.component.ts:484-489](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)); `deleteRequest` — строго.

### 4.5 Семантика объектных настроек — четыре разных (run для `optimization`)

- `[optimization]`, `[selectionBox]`, `[keyboardShortcuts]` сливаются с **предыдущим** значением: `{virtualization:true}` → `{lazyLoadTrigger:'viewport'}` оставляет `virtualization: true` (run).
- `[ariaLabelConfig]` сливается с **дефолтами** (сброс при каждой записи).
- `[alignmentHelper]` заменяется целиком (и единственный signal `input()` среди `@Input` setter'ов, [vflow.component.ts:457](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts)).
- `[autoPan]` фиксируется при создании.
- `VflowControls.labels` в ui — только полный объект, в отличие от core `Partial`.

Внутри интерфейсов настроек то же: всё опционально, кроме `AlignmentHelperSettings.tolerance` и `IntersectingNodesOptions.partially`. Геттеры есть только у `minZoom`, `maxZoom`, `connection`.

### 4.6 Graph operations и события не стыкуются

| Хелпер                                | Второй аргумент | Результат                                    | Как меняет                                           |
| ------------------------------------- | --------------- | -------------------------------------------- | ---------------------------------------------------- |
| `addNodes(nodes, existing)`           | массив          | массив                                       | —                                                    |
| `removeNodes(ids, {nodes, edges})`    | объект          | `{nodes, edges, removedNodes, removedEdges}` | —                                                    |
| `reparentNodes(ops, nodes)`           | массив          | массив                                       | мутирует сигналы, может дописать свойство `parentId` |
| `addEdges(edges, {nodes, edges})`     | объект          | массив                                       | —                                                    |
| `removeEdges(ids, edges)`             | массив          | массив                                       | —                                                    |
| `reconnectEdges(ops, {nodes, edges})` | объект          | массив                                       | заменяет объект ребра                                |

- `(reconnect)` отдаёт `{ connection, oldEdge }`, а `reconnectEdges` ждёт `{ id, connection }` ([connection-events.interface.ts:44-47](../../libs/ngx-vflow/src/lib/vflow/interfaces/connection-events.interface.ts)).
- `(deleteRequest)` требует два вызова: `removeNodes` и `removeEdges`.
- `(connect)` отдаёт `Connection` без id — приложение собирает ребро само.

### 4.7 Структурные поля ребра — не сигналы

У `Edge` `source`/`target`/`sourceHandle`/`targetHandle` — простые поля, всё остальное — сигналы; у `Node` `parentId` — сигнал. Итог: reparent сохраняет модель и view, reconnect пересоздаёт их и выдаёт `remove`+`add` с тем же id ([reference-identity-checker.ts](../../libs/ngx-vflow/src/lib/vflow/utils/identity-checker/reference-identity-checker.ts), [edge-changes.service.ts](../../libs/ngx-vflow/src/lib/vflow/services/edge-changes.service.ts)).

### 4.8 Мелкие расхождения имён и типов

- Дефолты generic'ов: `Node<T = any>`, `NodeRef<T = any>`, `EdgeRef<T = any>`, но `Edge<T = unknown>`, `getNode<T = unknown>`, `getIntersectingNodes<T>` без дефолта.
- `NodeSelectedChange` vs `EdgeSelectChange`; `NodePositionChange.point` плоско vs `NodeSizeChange.size` вложенно.
- `Background`: у `dots` `size` — диаметр точки, `gap` — шаг; у `grid` `size` — шаг сетки ([background.type.ts](../../libs/ngx-vflow/src/lib/vflow/types/background.type.ts)).
- `vflowHandle`: `position="auto"` (сторона к другому концу) и `layout="auto"` (библиотека позиционирует элемент) — одно слово на двух осях.
- `[resizeDirection]` (`'horizontal'|'vertical'`) vs `ResizeParamsWithDirection.direction: number[]`.
- `getViewportForBounds(bounds, width, height, minZoom, maxZoom, padding)` — 6 позиционных аргументов; остальные хелперы берут объекты опций.
- `ConnectionSettings.marker` — только конец; `Edge.markers` — `{start, end}`; контекст шаблона `connection` — `marker`, ребра — `markerStart`/`markerEnd`.
- Не экспортированы типы, которые пользователь видит в своих сигнатурах: `ConnectionForValidation` (параметр validator'а), `EdgeContext`/`NodeContext`/`ConnectionContext`, `interface Handle` из событий соединения ([connection-events.interface.ts:67-71](../../libs/ngx-vflow/src/lib/vflow/interfaces/connection-events.interface.ts)). Зато экспортированы внутренние (3.3).
- `@vflow/ui`: `VflowPort` смешивает непрефиксные inputs (`handleType`) с префиксными (`vflowPortState`); `VflowControls` получает flow через `[flow]` и `@if (flow(); as flow)`, минимапа — через DI.

---

## 5. Документация расходится с API (агент, выборочно перепроверено)

Пути страниц — от `apps/docs/src/app/categories/`.

**Описано, но не так:**

- `SelectionBoxSettings.color` — есть в `interactions/pages/selection-box/index.md:13-22` и в демо, в интерфейсе нет (удалён, migration:98). Демо компилируется только потому, что литерал из стрелочной функции обходит excess-property check; значение молча игнорируется.
- `ReconnectionEvent` → на деле `ReconnectEvent` (`edges/connections/index.md:33`).
- «By default, every connection is valid» — неверно (см. 2.5).
- `EdgeContext` на `edges/custom-edges/index.md:12-21` устарел: реальный — `{ $implicit: EdgeRef }`. Фраза «tricky to infer type for `let-ctx`» устарела — guards есть.
- «Edges need `selectable`» (`interactions/pages/selecting/index.md:3`) — нет, см. 2.2.
- Size-контракт: `handling-changes/index.md:8` и `nodes/resizer/index.md:24` («`ctx.node.width` is not reactive») — см. 1.4; реальная проблема в том, что сигнала обычно нет.
- Таблицы атрибутов handle (`handles/pages/custom-handles/index.md:61-62`) без `any`, `auto`, `center`.
- Мелочи: `(nodesChanges.[EdgeChangeType])` вместо `edgesChanges` (`handling-changes/index.md:41`); модификаторы `pan`/`zoom` вместо `panActivation`/`zoomActivation` (migration:373, viewport-gestures:38); секция «Viewport virtualization» после v1.0 в migration; сниппет edge labels использует `vflowEdge` из `@vflow/ui` без пометки; маркер `'bar'` не объявлен.
- `component-mocks/index.md:6` — «mocks for every public component» неверно (1.7); пример `<vflow #vflow />` без обязательного `[nodes]`.
- Статический `apps/docs/src/assets/sitemap.xml` (lastmod 2026-04-04) содержит 26 удалённых страниц API; в репо лежит файл `grid-custom-background-demo.component copy.ts`.

**Публично, но не описано:** `(connectStart)`, `(connectEnd)`, `(nodeDragStart|nodeDrag|nodeDragEnd)`, `[elevateEdgesOnSelect]`, `optimization.detachedGroupsLayer`, `viewportChange$`, `initialized$`, `initialized` (основа fit-on-load в 8 демо), `getNode()`, `getDetachedEdges()`, `[resizable]` `gap` и `shouldResize`, `allowSelfConnections`, дефолт `extent: 'parent'`, зависимость соединений от подписки (2.1).

**`@vflow/ui` docs:** overview:116-117 утверждает, что кроме `vflow-controls` ничего не импортирует ngx-vflow — `VflowPort` импортирует; README называет inputs порта `type`/`id` вместо `handleType`/`handleId`; состояние `connecting` порта не упомянуто.

---

## 6. Приоритеты

**До релиза 3.0 (ломающие изменения дешевле сейчас):**

1. Viewport: один `setViewport(partial, {duration})` с clamp'ом и очередью/слиянием частичных изменений вместо «последний выиграл»; `setCenter(flowPoint)`. Закрывает 1.1, 1.2, 2.5, 3.2.
2. Размер `auto`-узлов: публичный read-доступ к измеренному прямоугольнику (например, `getNodeRect(id)` / `getNodesBounds` через flow) и реактивное подхватывание `width`/`height`, появившихся на объекте. Закрывает 1.3, 1.4.
3. Соединения: `ConnectionControllerDirective` в `hostDirectives` `vflow`, включение — явным флагом или через `canStart`, а не подпиской. Закрывает 2.1.
4. Удалить сигналы `nodesChange`/`edgesChange`; решить судьбу 9 подканалов (1.6, 3.1).
5. Почистить баррель (3.3) и выровнять префиксы (4.1) — это чисто ломающие правки, после 3.0 они станут дороже.
6. `<mini-map>`: `ngOnDestroy` (1.5).

7. Dev-warning для ребра без презентации и для handle без connection controller (2.1) — дёшево, снимает самую частую «тихую» поломку.
8. Документация (5): `color`, контракт размера, «every connection is valid», недокументированные outputs и `initialized`.

**Можно после:** симметрия выбора узла/ребра (2.2, 2.3), единая семантика объектных настроек (4.5), сигнатуры graph operations под события (4.6), `(initialized)` / fit-on-load (3.8), починка `testing` (1.7) — хотя бы включить его specs в CI, — и `@vflow/ui` peer/дефолты (1.8).

---

## Тикеты

Лежат в [issues/](issues/). `ready-for-agent` — можно делать без решений; `needs-triage` — сначала выбрать вариант в тикете.

| №   | Тикет                                                                                  | Приоритет | Status          | Blocked by |
| --- | -------------------------------------------------------------------------------------- | --------- | --------------- | ---------- |
| 01  | [Программные изменения viewport](issues/01-viewport-programmatic-pipeline.md)          | P1        | resolved        | —          |
| 02  | [Форма viewport API](issues/02-viewport-api-shape.md)                                  | P1        | resolved        | 01         |
| 03  | [Модель размера узла и измеренный прямоугольник](issues/03-measured-node-rect.md)      | P1        | resolved        | —          |
| 04  | [Контракт опциональных сигналов узла](issues/04-node-optional-signals-contract.md)     | P1        | resolved        | —          |
| 05  | [Соединения без подписки на output](issues/05-connection-controller-host-directive.md) | P1        | resolved        | —          |
| 06  | [Dev-предупреждения для тихих поломок](issues/06-silent-headless-failures.md)          | P1        | resolved        | —          |
| 07  | [Каналы уведомлений об изменениях](issues/07-change-channels.md)                       | P1        | resolved        | —          |
| 08  | [Публичный баррель](issues/08-public-barrel-cleanup.md)                                | P1        | resolved        | —          |
| 09  | [Префиксы селекторов и классов](issues/09-selector-and-class-prefixes.md)              | P1        | needs-triage    | 05, 08     |
| 10  | [`<mini-map>` снимает регистрацию](issues/10-minimap-unregister.md)                    | P1        | ready-for-agent | —          |
| 11  | [Документация: расхождения](issues/11-docs-drift.md)                                   | P1        | ready-for-agent | —          |
| 12  | [Выбор кликом для узла и ребра](issues/12-selection-trigger-symmetry.md)               | P2        | needs-triage    | —          |
| 13  | [Семантика объектных настроек](issues/13-object-settings-semantics.md)                 | P2        | needs-triage    | —          |
| 14  | [Graph operations и события](issues/14-graph-operations-vs-events.md)                  | P2        | needs-triage    | —          |
| 15  | [`(initialized)` и fit-on-load](issues/15-initialized-and-fit-on-load.md)              | P2        | needs-triage    | 01         |
| 16  | [testing: CI и поломки](issues/16-testing-ci-and-fixes.md)                             | P2        | ready-for-agent | —          |
| 17  | [testing: паритет моков и рёбра](issues/17-testing-mock-parity-and-edges.md)           | P2        | wontfix         | 16         |
| 18  | [@vflow/ui: баги](issues/18-ui-bugs.md)                                                | P2        | ready-for-agent | —          |
| 19  | [@vflow/ui: дублирование с core](issues/19-ui-core-duplication.md)                     | P2        | needs-triage    | 12         |
| 20  | [Мелкие расхождения имён и типов](issues/20-naming-and-type-nits.md)                   | P2        | needs-triage    | —          |

P2 с пометкой «ломающее» (13, 14, 20) дешевле сделать до 3.0.
