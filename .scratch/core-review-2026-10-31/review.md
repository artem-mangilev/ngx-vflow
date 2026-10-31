# Ревью core (`libs/ngx-vflow`), 2026-10-31

Ветка `3.0`. Прочитаны все компоненты, директивы, сервисы, модели и стили core; подсчитано использование классов `v-*` в core, `@vflow/ui`, docs и cli.

Коротко: в core есть семь архитектурных решений, которые тянут за собой большую часть «странного» кода. Если принять их иначе, уходит примерно четверть кода библиотеки (оценка ~1500 строк из ~13 500) и исчезает большинство пунктов из списка вопросов. Они собраны в разделе «Архитектурные решения», затем идут ответы по каждому вопросу.

## Архитектурные решения, которые стоит пересмотреть

### A. `FlowStatusService` как общий стейт-машина всего

`flow-status.service.ts` (324 строки) смешивает три разные вещи:

1. состояние connection-жеста: 10 статусов, по пять на `connection` и `reconnection`, которые отличаются только полем `oldEdge`;
2. события node drag (`node-drag-start/drag/end`), для которых сервис сам же заводит отдельный `Subject`, потому что сигнал теряет промежуточные значения;
3. флаг `selection-box-end` + `setTimeout(setIdleStatus)`, чтобы подавить click после рамки выделения.

Следствия: ветвления `isReconnection ? setReconnectionX(...) : setConnectionX(...)` во всём `connection-controller.directive.ts`; двухфазный релиз (`release` → подписка считает валидность → `release-validated` → `idle`) только ради того, чтобы прогнать валидацию через rxjs-подписку; эффект в конструкторе, который проецирует статус в `node.connectionActive`, `handle.state`, `edge.reconnecting`; `isSelectionBoxEndStatus` в `onClick` ноды и ребра.

Предложение: заменить на `ConnectionService` с одним сигналом состояния жеста

```ts
type ConnectionGesture = {
  source: NodeModel;
  sourceHandle: HandleModel;
  oldEdge?: EdgeModel; // reconnection = connection с oldEdge
  candidate?: { node: NodeModel; handle: HandleModel; valid: boolean };
} | null;
```

и четырьмя методами `start(handle, event, oldEdge?)`, `hover(handle)`, `leave(handle)`, `end()`. Позиция указателя держится отдельным сигналом, чтобы движение не инвалидировало все ноды. Валидация в `end()` синхронная. `node.connectionActive`, `handle.state`, `edge.reconnecting` становятся `computed` от сигнала жеста: переходов мало (start, hover, leave, end), стоимость O(n) тривиальных computed на переход. Drag-события уходят в `DraggableService.events$`, их потребляет `NodeDragControllerDirective` как сейчас. `selection-box-end` исчезает после решения B. `FlowStatusService` удаляется целиком, вместе с `RootSvgContextDirective` (document `pointerup` → drop, живёт в отдельном файле с чужим именем и TODO).

### B. Указательные жесты не везде на `createPointerDrag`

`gestures/pointer-drag.ts` уже умеет threshold, capture, cancel по blur и подавление click после drag. Но:

- рамка выделения (`selection-box-context.directive.ts`) слушает `RootPointerDirective.pointerStart$ / documentPointerMove$ / documentPointerEnd$` и гасит click через статус и `setTimeout`;
- connection-жест реализует threshold сам (`afterDragThreshold`, ~35 строк ручных слушателей document) и следит за указателем через `SpacePointContextDirective.svgCurrentSpacePoint`, то есть через глобальный `pointermove` на rAF, который живёт всё время жизни flow, хотя нужен только во время соединения;
- `PointerDirective` оборачивает четыре нативных события в outputs и ничего не добавляет.

Предложение: рамка и connection на `createPointerDrag`; указатель connection хранится в `ConnectionService.pointer`. Удаляются `RootPointerDirective`, `PointerDirective`, поток `pointerMovement$` и «хак» с чтением viewport в `SpacePointContextDirective` (остаются две функции преобразования координат), `afterDragThreshold`, статус `selection-box-end`.

### C. Измерение и вывод геометрии handle смешаны

`HandleModel.measure()` читает DOM и тут же считает `layoutStyles`/`localPoint` из `position`, `offsetX/Y`, `layout`, размера ноды. Поэтому `NodeHandlesControllerDirective` вынужден в эффекте «читать сигналы ради триггера» (блок `handle.position(); handle.offsetX(); …` и `hasSize`, который всегда true), чтобы перезапустить измерение при смене входов, которые DOM не меняют.

Предложение: `measure()` сохраняет только сырые прямоугольники (`handleBox`, `anchorBox`, `origin`, `hasBox`) в один сигнал `measured`; `layoutStyles` и `localPoint` становятся `computed(measured, position, offset, layout, node.width/height)`. Директива реагирует только на DOM (ResizeObserver + MutationObserver) и на список handles (эффект вместо `handles$`). Эффект-триггер удаляется. Заодно: `HandleModel.sync()`, `createMeasureContext()` и инъекция `ViewportService` в модель нужны только «для изолированного использования», в коде не используются, удалить.

### D. Два сервиса для доступа к модели ноды и два батчера

- `NodeAccessorService` (сигнал с моделью, «fix cyclic dependency») и `HandleService.node` хранят одну и ту же `NodeModel`. Цикла импортов больше нет: `NodeComponent` не импортирует resizable, резайзер регистрируется через `model.resizerTemplate`. `EdgeComponent` уже решает ту же задачу без сервиса: `{ provide: EDGE_REF, useFactory: () => inject(EdgeComponent).model()... }`. Сделать так же: токен `NODE_MODEL`, провайдер в `NodeComponent` с `useFactory: () => inject(NodeComponent).model()`. Потребители (`nodeHandlesController`, `nodeResizeController`, `[vResizable]`, `nodeResizeControl`, `vDragHandle`, `vHandle`) инжектят токен. `HandleService` не нужен: `vHandle` пишет в `node.handles` напрямую (две строки).
- `AfterRenderBatchService` (afterNextRender) и `RequestAnimationFrameBatchingService` (rAF) решают одну задачу «прочитать DOM после обновления». Оставить один, `AfterRenderBatchService`: rAF может сработать после paint и дать кадр со старыми позициями handles.

### E. Готовность и скрытие сущностей размазаны по пяти местам

`FlowRenderingService.hiddenUntil(ready) = hasLayout && !ready` вызывается в node, edge, edge-label, minimap, плюс `v-initializing` на корне. `hasLayout` нужен только для jsdom/happy-dom, где ничего не измеряется и без него всё навсегда `visibility: hidden`. При этом handle уже решает скрытие иначе: атрибут `data-v-handle-pending` и одно правило в `vflow.component.scss`.

Предложение:

1. В DOM без layout считать ноду измеренной: в `NodeResizeControllerDirective.measure()` пропускать только настоящий `display: none` (`!hasBox && domHasLayout`), иначе писать 0×0 и `isMeasured = true`; `flowInitialized = !hasLayout || (...)`. Тогда `initialized` срабатывает и в jsdom, и тесты могут его ждать.
2. Нода, ребро, label ставят `data-v-pending` пока не готовы; одно правило `[data-v-pending] { visibility: hidden }` рядом с правилом для handle. `hiddenUntil` удаляется, `hasLayout` остаётся в одном месте.
3. `ViewportVisibilityDirective` (один эффект `display: none` по `culled`) переносится по строке в уже существующие host-эффекты `NodeComponent`, `EdgeComponent`, `EdgeLabelComponent`; директива и три привязки в шаблоне flow удаляются.

### F. Резайзер: порт XYResizer с лишней общностью и 8 экземплярами на ноду

`public-components/resizable/` (~900 строк):

- `nodeOrigin` всегда `[0, 0]`, вся математика `originOffset*` в `resizer.ts` и `resizer-utils.ts` мёртвая;
- `getStoreItems`, `ResizerStoreItems`, `CoordinateExtent`, `ResizeControlVariant` (enum), callbacks через inputs (`[onResizeStart]="emitResizeStart"`) унаследованы от React Flow;
- каждый из 8 контролов создаёт свой `createResizer` + `createPointerDrag` + эффект `update(...)` с 13 inputs; шаблон `resizable.component.html` дублирует 13 привязок дважды;
- CSS min/max читаются один раз в rAF после `ngAfterViewInit` в 4 сигнала + 4 computed и устаревают при смене стилей.

Предложение: один резайзер на `[vResizable]`. Контролы это статичные `div.v-resize-control` с `data-position` из шаблона; компонент вешает один `createPointerDrag` на контейнер контролов, позицию берёт из `closest('.v-resize-control')` нажатого элемента, min/max читает `getComputedStyle` в `onStart`, outputs эмитит сам. Удаляются `NodeResizeControlComponent`, `ResizeControlVariant`, `nodeOrigin`, `getStoreItems`; `getDimensionsAfterResize` остаётся без origin-членов. Оценка: ~900 → ~450 строк. Отдельно: переименовать `NodeResizeControllerDirective` (это измерение размера ноды) в `NodeMeasureDirective`, чтобы не путать с контролами резайза.

### G. Жесты viewport и программные изменения в одной директиве

`viewport-gestures.directive.ts` (558 строк) содержит три роли: ввод (drag, wheel, touch, dblclick), очередь программных изменений с анимацией (`applyChange`, `animate`, `interruptAnimation`, `viewportService.connect`), и жизненный цикл жеста (`begin/finish` → `endChange` + `selectionService.setViewport`). Последнее тянет в `SelectionService` интерфейс `ViewportForSelection` и `Subject`, то есть сервис выделения знает о жестах viewport.

Предложение: очередь и анимацию перенести в `ViewportService` (панель регистрирует только `size/center`), `begin/endGesture()` там же; директива остаётся вводом (~400 строк), touch-блок можно вынести в `gestures/touch.ts` рядом с `pinch.ts`. Клик по панели определяет сама директива (расстояние меньше `paneClickDistance`, цель вне `.v-node, .v-edge`) и зовёт `selectionService.select(null)`; `setViewport`, `viewport$` и `ViewportForSelection` удаляются. `viewport-culling.directive.ts` менять не нужно: пространственный индекс и отложенное «покинул viewport» обоснованы замерами (см. память по pan/zoom smoothness).

## Ответы по пунктам

### Классы `v-*`

Правило, которое предлагаю: класс это хук для стилей, атрибут `data-v-*` это хук для поведения; JS никогда не ищет по классу. Сейчас оба смешаны, и ADR-0008 объявляет префикс `v-` даже для внутренних классов, из-за чего внутренние хуки выглядят как API. Таблица (использование вне core: `@vflow/ui`, docs, cli):

| Класс                                                                                                                                                                                                    | Зачем                                                                              | Вне core                 | Вердикт                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `v-root`                                                                                                                                                                                                 | стили корня; `closest('.v-root')` в minimap                                        | docs                     | публичный; JS-поиск убрать (minimap это content, он может инжектить `VflowComponent`)                                                                              |
| `v-pane`                                                                                                                                                                                                 | стили; `closest('.v-pane')` в `draggable.service`, `node-resize-control`           | нет                      | внутренний; элемент панели регистрировать в сервисе, closest убрать                                                                                                |
| `v-viewport`                                                                                                                                                                                             | стили; `closest('.v-viewport')` в `handle.model` для реального transform           | нет                      | внутренний; элемент передавать через сервис                                                                                                                        |
| `v-node`                                                                                                                                                                                                 | host-класс; `press-target`, `selection.service`, `.v-node:hover` в `vuiPort`, docs | ui, docs                 | публичный, оставить                                                                                                                                                |
| `v-edge`                                                                                                                                                                                                 | host-класс без стилей; `closest` в `selection.service`                             | docs (migration)         | оставить как публичный host-класс для симметрии с `v-node`                                                                                                         |
| `v-node--undraggable`, `v-node--drag-handles-only`                                                                                                                                                       | `touch-action: auto` + `isPanPress` читает классы                                  | нет                      | убрать: `touch-action` писать в том же эффекте, pan-фильтр читать модель (см. ниже)                                                                                |
| `v-handle`                                                                                                                                                                                               | публичный стиль-хук; `press-target`                                                | ui, docs                 | публичный; в `press-target` искать по `[data-v-handle-type]`, который директива уже ставит                                                                         |
| `v-drag-handle`, `v-reconnect-handle`                                                                                                                                                                    | только JS-хуки в `press-target` + `touch-action`/`cursor`                          | нет                      | заменить на `data-v-drag-handle`, `data-v-reconnect-handle` по образцу `data-v-no-drag`; `vDragHandle` сейчас ставит класс, а `vNoDrag` атрибут, непоследовательно |
| `v-marker`, `v-marker--<type>`                                                                                                                                                                           | задокументированный хук переопределения stroke маркера                             | docs                     | публичный, оставить                                                                                                                                                |
| `v-minimap`, `v-selection-box`, `v-alignment-guides`, `v-background-pattern`, `v-resize-control` (+ `--handle/--line/--top/...`)                                                                         | части, которые core рисует сам; тема и docs ссылаются                              | ui, cli, docs            | публичные, оставить                                                                                                                                                |
| `v-interactive-edge`                                                                                                                                                                                     | хит-зона; demo custom-edges исключает её из `path:hover`                           | docs                     | публичный, оставить                                                                                                                                                |
| `v-focus-indicator`, `v-node-wrapper`, `v-magnet`, `v-edge-label-wrapper`                                                                                                                                | только собственные инкапсулированные стили                                         | только migration-таблица | внутренние; вычеркнуть из migration-таблицы, чтобы не обещать                                                                                                      |
| `v-alignment-line`, `v-alignment-point`, `v-nodes-layer`, `v-edges-layer`, `v-edge-labels-layer`, `v-background-svg`, `v-defs-svg`, `v-overlay-svg`, `v-connection-svg`, `v-a11y-live`, `v-initializing` | только собственные стили                                                           | нет                      | внутренние; оставить, но ADR-0008 дополнить: внутренние классы не являются контрактом                                                                              |

Итог по классам: удаляются четыре (`v-node--undraggable`, `v-node--drag-handles-only`, `v-drag-handle`, `v-reconnect-handle`), пять исчезают из публичного контракта, шесть JS-поисков по классу заменяются инъекцией элемента или data-атрибутом.

### `FlowRenderingService.hiddenUntil`

См. решение E. Это костыль для тестового DOM, продублированный в пяти местах; после E остаётся одна проверка `hasLayout` внутри `flowInitialized`.

### `console.warn` с `[ngx-vflow]`

15 сайтов `console.warn` + 1 `console.error` и обвязка под них: пары `computed`+`effect` «чтобы предупредить один раз» в `vflow.component.ts`, `defs.component.ts`, `template.directive.ts`; `afterRenderEffect` в `edge-label.component.ts`; `reportedCollapse` в `flow-size-controller.directive.ts`; `warnWithoutBox` в `handle.model.ts`; `afterNextRender` + `closest('.v-root')` в `minimap.component.ts`; `nonNegativeSetting` в `auto-pan.directive.ts`; `MOVED_ENTRIES` + `reportMovedEntries` + параметр `report` в `keyboard.service.ts` (миграционный отчёт 2.x → 3.0); `warn` в `graph-operations.ts` и `node-position.ts`. Удалить всё, включая тесты на предупреждения (`headless-warnings.spec.ts`, части `edge-label.spec.ts`, `defs.component.spec.ts`, `coordinates.spec.ts`, `graph-operations.spec.ts`). Оставить только исключения на ошибки программирования: `vHandle` вне ноды и `RangeError` в `fitView`. Оценка: ~150 строк.

### `background.component.ts`

11 `computed`, каждый заново проверяет `background.type`; `patternSize` означает радиус для dots и шаг для grid. Один `computed` `pattern` с одним `switch` по типу, возвращающий discriminated union (`{ type: 'dots', x, y, gap, radius } | { type: 'grid', x, y, gap, strokeWidth } | { type: 'image', x, y, width, height, src, repeat } | null`), и `@switch` в шаблоне. Загрузка картинки: `toObservable`+`switchMap`+`Promise` без `onerror` зависает; заменить на `resource()` (Angular 20) по `src`. Разделение на три компонента тоже вариант, но даёт больше файлов при той же логике `x/y = viewport % gap` в двух из них. Оценка: 183 → ~100 строк.

### `node.component.ts`

- **Логика `culled`** (эффект `wasCulled`, сбрасывающий `isMeasured` ноды и handles при возврате в viewport): скорее всего лишняя. ResizeObserver и так срабатывает на `display: none` → показ (размер 0 → N) и для обёртки ноды, и для элементов handle, которые наблюдает `nodeHandlesController`; измерение произойдёт без сброса. Сброс добавляет только кадр `visibility: hidden` на каждой ноде, въезжающей в viewport, то есть мерцание при панорамировании. Удалить, проверить `css-virtualization.spec.ts` и e2e виртуализации.
- **`classes.toggle`**: эффект нужен из-за запрета на чтение сигналов в host-привязках (объяснено в комментарии компонента, причина настоящая). Но сами классы существуют только ради `touch-action: auto` и `isPanPress`. Писать `style.touchAction` в том же эффекте, а в pan-фильтре `ViewportGesturesDirective` брать модель по элементу (`WeakMap<Element, NodeModel>` в `FlowEntitiesService`, заполняется из `nodeElement`). Тогда эффект остаётся, но классы и DOM-как-состояние уходят.
- Магниты используют `PointerDirective`; заменить на нативные `(pointerup)`, `(pointerover)`, `(pointerout)`.
- Зависимость от `ConnectionControllerDirective` уходит с решением A.
- Комментарий `TODO: fix loading of these by @defer` устарел.
- `NodeModel`: `inject(DOCUMENT)` не используется; `pointTransform` (SVG-вариант) используется только в spec. Удалить.

### Лишняя связанность

1. `NodeComponent`, `EdgeComponent`, `VflowHandleDirective` → `ConnectionControllerDirective` (host-директива в роли сервиса; в `edge.component.ts` стоит TODO). Решение A: сервис + директива только с outputs, как `NodeDragControllerDirective` (40 строк).
2. `RootSvgContextDirective` это кусок connection-жеста в отдельном файле. Решение A.
3. `SelectionService.setViewport` / `ViewportForSelection`: сервис выделения знает о жестах viewport. Решение G.
4. `FlowStatusService` пишет в поля `NodeModel`, `HandleModel`, `EdgeModel` из эффекта. Решение A.
5. `SpacePointContextDirective` + `RootPointerDirective`: глобальный поток `pointermove` ради connection-линии. Решение B.
6. `NodeAccessorService` + `HandleService`. Решение D.
7. `RootSvgReferenceDirective`: только `AutoPanDirective` берёт из неё прямоугольник корня, а сама стоит на панели с тем же прямоугольником (`inset: 0`). Удалить, использовать свой `ElementRef`.
8. Два батчера. Решение D.
9. `EdgeRenderingService` (20 строк) можно слить с `NodeRenderingService` в `RenderOrderService`; необязательно.

### `connection-controller.directive.ts`

Да, слишком сложная, и по причинам из решения A: удвоенные статусы, двухфазный релиз, собственный threshold, дважды повторённый `adjustDirection` + сборка `ConnectionForValidation`. После A: `ConnectionService` ~150 строк вместо 321, интерфейсы статусов 10 → 1.

### `public directives` и ревизия `public-components`

В `directives/` 26 файлов, из них публичны 5: `handle`, `drag-handle`, `edge-interaction`, `gesture-exclusions`, `template`. Вынести их в `public-directives/` по образцу `public-components/`; `public-api.ts` экспортирует только из `public-*`, `interfaces`, `types`, `utils`, `math`. После A `ɵConnectionControllerDirective` остаётся только с outputs. `public-components/` в порядке: `minimap` (внутренняя `minimap-canvas.directive` рядом уместна), `node-toolbar`, `resizable` (внутренние `node-resize-control`, `resizer*.ts` рядом уместны; после F часть исчезнет). `VflowComponent` лежит в `components/` при том что публичен; либо перенести в `public-components/vflow`, либо принять как исключение для корневого компонента.

### `node-handles-controller.directive.ts`

Не оптимально, и ровно по той причине, что заметили: чтение сигналов ради триггера. Решение C убирает эффект-триггер; остаются ResizeObserver + MutationObserver + один батчер.

### `PointerDirective`

Удалить. Используется в двух шаблонах, заменяется нативными событиями.

### `RootPointerDirective`

Не нужна после решения B. Единственные потребители: `SpacePointContextDirective` (поток движения) и `SelectionBoxContextDirective` (три потока). Оба уходят на `createPointerDrag` / свой слушатель.

### `ViewportVisibilityDirective`

Не нужна: один эффект, который три компонента могут выполнить сами в уже существующих host-эффектах. Решение E.3. Заодно `vflowA11y` и `vflowKeyboardEntity` на тех же хостах можно сделать `hostDirectives` компонентов ноды и ребра, и шаблон flow станет проще; это необязательно.

### `viewport-culling` и `viewport-gestures`

Culling: нужен и обоснован замерами; оставить как есть. Gestures: см. решение G; сама обработка ввода оптимальна (один слушатель на событие, wheel-easing на rAF, touch без захвата), лишнее там только программные изменения и жизненный цикл.

### `resizable`

Не оптимально. Решение F.

### `flow-status.service.ts`

Конструктор сложен, потому что проецирует статус в чужие модели вручную ради O(участников) вместо O(нод). Решение A: `computed` в моделях от сигнала жеста, сервис удаляется.

### `node-accessor.service.ts`

Избавиться можно. Решение D.

## Что не трогать

- `viewport-culling.directive.ts`, `spatial-index.ts`: обоснованы профилированием.
- `pointer-drag.ts`, `wheel.ts`, `pinch.ts`, `viewport-animation.ts`: чистые примитивы, на них же переезжает остальное.
- `bind-vflow-inputs.ts`, `bindableSignal`, `entitySnapshot`, `forwardSignal`: это решения из тикета 22 (signal inputs), работают.
- `node-changes.service.ts` / `edge-changes.service.ts`: rxjs-композиция читается, менять незачем.
- `keyboard.service.ts` после удаления миграционных предупреждений: остаток уместен.

## Порядок работ

Независимые друг от друга шаги, каждый с зелёными unit и docs-e2e:

1. Предупреждения: удалить `console.*` и обвязку. Самый дешёвый и безопасный.
2. Токен `NODE_MODEL` вместо `NodeAccessorService` + `HandleService`; `PointerDirective` → нативные события; `RootSvgReferenceDirective` удалить; мёртвый код в `NodeModel`.
3. Готовность через `data-v-pending`, `hasLayout` только в `flowInitialized`, `ViewportVisibilityDirective` в компоненты, сброс `isMeasured` при un-cull убрать.
4. `ConnectionService` вместо `FlowStatusService` (+ `RootSvgContextDirective`), connection и рамка на `createPointerDrag`, `RootPointerDirective` удалить, клик по панели в директиве жестов. Самый большой шаг; покрыт `connection-outputs.spec`, `click-selection.spec`, e2e соединений.
5. Handles: разделить measure/derive, один батчер.
6. Один резайзер на ноду; переименование `NodeMeasureDirective`.
7. Классы: data-атрибуты для ролей в `press-target`, регистрация элементов панели/viewport, модификаторы ноды из модели; поправить migration-таблицу и ADR-0008.
8. `public-directives/`, при желании `ViewportService` забирает анимацию.
9. `background.component.ts`.

Риски: шаг 4 меняет порядок событий connection/reconnection outputs; сверяться с `connection-events.interface.ts` и docs-e2e. Шаг 6 меняет DOM контролов резайза (`node-resize-control` исчезает), классы `v-resize-control*` сохранить, они в теме `@vflow/ui`.
