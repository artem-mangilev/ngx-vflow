# Содержимое на холсте, которое не нода и не ребро: как у React Flow и что нужно ngx-vflow

Дата: 2026-11-20. Исследование, кода в `libs/` не меняли. Повод: заметки со стрелками в демо «Feature overview» (`apps/docs/src/app/categories/examples/feature-overview/demo/`, коммит `a1bf66b9`) сделаны нодами и платят за это. Отчёт писался до решения; решение — в разделе ниже, в остальном тексте стоят предложенные тогда имена.

## Решение

2026-11-20 автор ответил на открытые вопросы раздела 6. Реализовано в рабочем дереве, не закоммичено:

- ядро: `VflowPortalDirective` (`ng-template[vPortal]`, входы `vPortal`, `vPortalLayer`), `PortalService`, внутренний `PortalHostComponent` (`div[portalHost]`), два слоя `.v-portal-layer[data-v-portal-layer]` в `.v-viewport` (`below` с z-index `-1000000` первым ребёнком, `above` с `999999` последним); тип `PortalLayer` экспортирован;
- тесты: `portal.spec.ts` (браузер, 8 тестов), портал в `node-dom/flow.spec.ts` и `server/flow.spec.ts`;
- документация: страница `docs/viewport/portal` («Content on the canvas») с демо, раздел «Portal» в `reference/viewport`;
- демо feature-overview: `annotation-node.component.ts` → `note.component.ts` (`app-note`, вход `note`), четыре заметки в компоненте демо через `*vPortal`, заметки 5 и 6 удалены, из `FlowStoreService` ушли `note()` и `AnnotationData`.

Проверено: `tsc` и три набора тестов библиотеки (508 + 64 + 7), `ngc` документации, eslint новых файлов, e2e `resizer.spec.ts` «overview», обе страницы в браузере на dev-сервере (заметка демо портала едет за перетаскиваемой нодой). Полный e2e документации не запускался.

1. Имя — **`*vPortal`** (входы `vPortal` и `vPortalLayer`); в тексте ниже везде `*vCanvas`.
2. Слой по умолчанию — `above`.
3. `fitView` — вариант (а): содержимое портала не участвует ни в `fitView`, ни в `getNodesBounds`, без опций. Так последовательнее: в границах только граф.
4. Якоря в API нет: портал размещает содержимое по точке во flow-координатах. Проверено по xyflow на `29ab9e00`: у `ViewportPortal` в React единственный проп — `children`, в Svelte — `target` и атрибуты `div`; хуков привязки к ноде нет. «Привязанным» бывает только то, что сама библиотека позиционирует от сущности: `NodeToolbar` (`nodeId`) и `EdgeToolbar` (`edgeId` плюс `x`, `y`). Совпадение слова «anchor» в исходниках — это точки переподключения рёбер, не относятся к делу. Следование за нодой, если понадобится, — `getNodeRect(id)` в приложении (раздел 5.5), как `NodeInspector` в их примере DevTools.
5. Заметки 5 и 6 из демо убрать совсем.
6. Клик по содержимому с включённым указателем снимает выделение, как клик по панели, — оставить.

## 1. Вывод

Ответ на вопрос автора: да, нодам такие заметки не нужны, и да, в ядре не хватает ровно одного примитива — того, что у React Flow называется `<ViewportPortal />`: слоя внутри трансформируемого viewport, в который приложение кладёт произвольный HTML в координатах flow. Всё остальное, что есть у React Flow для «не нод», у ngx-vflow уже есть в своём виде (таблица в разделе 4).

Рекомендую структурную директиву **`*vCanvas`** (имя — открытый вопрос 1):

```html
<figure *vCanvas="{ x: 0, y: 50 }">…</figure>
<div *vCanvas="lanePoint; layer: 'below'">…</div>
```

- Шаблон регистрируется во flow так же, как `*vEdgeLabel`, и flow рисует его в своём слое. Объявлять можно где угодно под `<vflow>`: прямо в его содержимом, в компоненте приложения внутри него, в компоненте ноды.
- Точка `{ x, y }` — во flow-координатах, левый верхний угол содержимого. Пока точки нет (`null`/`undefined`), содержимое не рисуется. Без значения — начало координат, и приложение позиционирует само, как в React Flow.
- Два слоя: `above` (по умолчанию) — над нодами, рёбрами и подписями, под направляющими выравнивания, рамкой выделения и линией соединения; `below` — под рёбрами и нодами, над фоном. Идея слоёв — из Svelte Flow (`target: 'front' | 'back'`).
- Указатель по умолчанию проходит насквозь (`pointer-events: none`), как у React Flow. Содержимое, которому нужен указатель, включает его CSS-ом; тогда нажатие ведёт себя как нажатие на панель (пан, клик снимает выделение), а `vNoPan`, `vNoDrag`, `vNoWheel` работают по существующей таблице `press-target.ts`. Код жестов не меняется.
- Не участвует ни в чём, что относится к графу: направляющие выравнивания, миникарта, `fitView` и `getNodesBounds`, пространственный индекс и отсечение, рамка выделения, клавиатурная навигация и список нод для доступности.
- Следовать за нодой — без отдельного API: точка — обычный вход, а `flow.getNodeRect(id)` уже читается как сигнал, поэтому `*vCanvas="noteAt(flow, 'stock')"` двигается вместе с нодой.

Что это **не** покрывает и почему это честно:

- Заметки, которые пользователь сам двигает, выделяет и удаляет, — это содержимое графа, и тогда нода с флагами правильнее. Примитив нужен для содержимого, которым управляет приложение, а не пользователь.
- `fitView` перестанет видеть заметки. Для демо это заметно: сейчас `fitView({ maxZoom: 1 })` на `initialized` захватывает и их. Варианты — в открытом вопросе 3.

## 2. React Flow / xyflow

Источник — `xyflow/xyflow` на `main`, коммит [`29ab9e00`][xy-commit] (React Flow 13.0.2, Svelte Flow 2.0.2, Vue Flow 2.0.2 — Vue Flow теперь в этом же репозитории как `@xyflow/vue`). Документация — reactflow.dev на 2026-11-20. Ничего не запускалось.

### 2.1. Как устроены слои

`GraphView` ([index.tsx#L155-L198][xy-graphview]) рисует внутри трансформируемого `<Viewport>` по порядку: `EdgeRenderer`, линию соединения, пустой `div.react-flow__edgelabel-renderer`, `NodeRenderer`, пустой `div.react-flow__viewport-portal`. Сам `Viewport` получает `translate() scale()` напрямую в DOM, без ререндера React ([Viewport/index.tsx][xy-viewport]).

CSS ([init.css][xy-css]): у `.xy-flow__viewport` стоит `z-index: 2; pointer-events: none`; у `.xy-flow__edgelabel-renderer` — `position: absolute`, во весь viewport, `pointer-events: none`; у `.xy-flow__viewport-portal` — то же, но без явного `pointer-events`, поэтому он наследует `none` от viewport. `.xy-flow__panel` — `z-index: 5`, вне viewport.

Все «не ноды» сделаны одной техникой: `createPortal` в один из этих пустых `div`, найденный через `domNode.querySelector(...)` ([ViewportPortal][xy-portal], [EdgeLabelRenderer][xy-label-renderer], [NodeToolbarPortal][xy-toolbar-portal]). Если `domNode` ещё нет (SSR, первый рендер), портал возвращает `null`.

### 2.2. Механизмы

| Механизм                              | Куда монтируется                                                    | Зум и пан                                                                                                                 | Кто даёт координаты                                                                                          | Указатель                                                                                                                                                                                                                                                                                      | fitView, bounds, миникарта, выделение, фокус                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<ViewportPortal>`                    | `div.react-flow__viewport-portal`, последний в viewport: над нодами | двигается и масштабируется с viewport                                                                                     | приложение: `transform: translate(x, y)` + `position: absolute` вручную (пример в [документации][rf-portal]) | наследует `pointer-events: none`; если приложение включит указатель, нажатие уходит в d3-zoom и панорамирует, если нет класса `nopan` ([filter.ts#L76-L81][xy-filter]); клик не снимает выделение, потому что обработчик панели срабатывает только при `target === pane` ([Pane#L61][xy-pane]) | не участвует ни в чём                                                                                                                                                 |
| `<EdgeLabelRenderer>`                 | `div.react-flow__edgelabel-renderer`: над рёбрами, под нодами       | с viewport                                                                                                                | приложение: `labelX/labelY` из `getBezierPath` и `translate(-50%,-50%)`                                      | `none` по умолчанию; [документация][rf-label-renderer] просит `pointerEvents: 'all'` и `nopan`                                                                                                                                                                                                 | не участвует                                                                                                                                                          |
| `<EdgeToolbar>`                       | через `EdgeLabelRenderer`                                           | с viewport                                                                                                                | приложение передаёт `x, y`; z-index — как у ребра ([EdgeToolbar.tsx][xy-edge-toolbar])                       | `pointerEvents: 'all'`                                                                                                                                                                                                                                                                         | показывается по выделению ребра или `isVisible`                                                                                                                       |
| `<NodeToolbar>`                       | `div.react-flow__renderer`, **вне** viewport                        | не масштабируется: позиция пересчитывается из `useViewport()` на каждый кадр ([NodeToolbar.tsx#L63-L99][xy-node-toolbar]) | библиотека: `getNodesBounds(nodes)` + `getNodeToolbarTransform`; `nodeId` может быть массивом                | обычные события DOM                                                                                                                                                                                                                                                                            | показывается по выделению ноды или `isVisible`                                                                                                                        |
| `<Panel position>`                    | обычный ребёнок `<ReactFlow>`, `z-index: 5`                         | закреплён на панели                                                                                                       | CSS по `position` ([Panel][xy-panel], [документация][rf-panel])                                              | свои события; во время рамки выделения `pointer-events: none`                                                                                                                                                                                                                                  | не участвует                                                                                                                                                          |
| Прочие дети `<ReactFlow>`             | после `GraphView` в обёртке ([ReactFlow#L315][xy-children])         | закреплены                                                                                                                | CSS приложения                                                                                               | свои                                                                                                                                                                                                                                                                                           | не участвуют                                                                                                                                                          |
| Нода-аннотация (`type: 'annotation'`) | слой нод                                                            | с viewport                                                                                                                | `position` ноды                                                                                              | как у ноды; `draggable: false, selectable: false` выключают перетаскивание и выделение                                                                                                                                                                                                         | участвует во всём: `fitView` берёт все видимые ноды ([getFitViewNodes][xy-fit]), миникарта рисует все не скрытые ([MiniMapNodes#L86][xy-minimap]), фокус — как у ноды |

Svelte Flow: тот же `ViewportPortal`, но с `target: 'front' | 'back'` ([ViewportPortal.svelte][sv-portal], [types.ts][sv-portal-types]). `viewport-back` — первый ребёнок viewport, до рёбер; `viewport-front` — последний, после нод и `NodeSelection` ([SvelteFlow.svelte#L176][sv-flow], [#L211][sv-flow-front]). Портал скрывается при SSR (`hideOnSSR`) и монтируется, когда появится `domNode` ([portal.svelte.ts][sv-portal-action]). В CHANGELOG это описано как «render something below or above the nodes & edges».

Vue Flow 2: не портал, а именованный слот `zoom-pane` ([VueFlow.vue][vue-flow], [ZoomPaneSlot.ts][vue-zoompane]) — рисуется внутри viewport после нод; содержимое по умолчанию `<slot />` закреплено на панели.

### 2.3. Как их собственный пример рисует аннотации

Пример «Feature Overview» ([reactflow.dev/examples/overview][rf-overview], исходник показан на странице): шесть аннотаций — ноды `type: 'annotation'` с `draggable: false, selectable: false` в общем массиве `nodes`. Компонент `AnnotationNode` рисует номер, текст и **символ** `⤹`, который поворачивают и сдвигают через `data.arrowStyle: { transform: 'translate(-30px,10px) rotate(-80deg)' }`. Стрелка — часть ноды, к цели не привязана. `fitView` на `<ReactFlow>` захватывает аннотации, миникарта получает `nodeClassName={(node) => node.type}` и рисует их как прямоугольники с классом `annotation`. Отдельного объяснения, почему не портал, в примере и документации нет.

Почему, судя по коду, выбрали ноды: у портала нет ничего, кроме места в DOM. Позицию, участие в `fitView` и SSR-разметку пришлось бы делать руками, а нода даёт всё это даром. Цена — та же, что у нас: аннотации в миникарте, в `fitView` и в обходе Tab — `focusable` в примере не задан, а фокусируемость ноды от `selectable` не зависит ([NodeWrapper#L58][xy-focusable]).

### 2.4. Следовать за нодой

Встроенного «якоря» нет. Есть инструменты чтения: `useInternalNode(id)` (абсолютная позиция и измеренный размер), `useNodes()`, `useNodesData`, `getNodesBounds`. Их собственный пример DevTools делает именно «портал, привязанный к нодам»: `NodeInspector` рендерит в `<ViewportPortal>` по блоку на каждую ноду и ставит его по `node.position` и `node.measured` ([NodeInspector.tsx][xy-inspector]). То есть рецепт React Flow: портал плюс подписка на ноды — тот же, что предлагается здесь для ngx-vflow с `getNodeRect`.

### 2.5. Что из этого следует

- Своего «механизма аннотаций» у React Flow нет. Есть один портал без позиционирования; для документации они сами выбрали ноды.
- Портал по умолчанию прозрачен для указателя, и это правильно для декора: стрелка, которая заходит на ноду, не перехватывает нажатие.
- Svelte добавил к порталу слой «под графом» — это единственное содержательное развитие идеи в семействе.

## 3. Как у других

Источники — документация и исходники на 2026-11-20 (ссылки под таблицей). Сравнение собирал субагент по официальной документации и коду; «не найдено» значит, что в прочитанном этого нет.

### Сводная таблица

| Инструмент       | Свободное содержимое — это                                                     | Слой и координаты                                                  | Следует за узлом                                            | Стрелка от заметки к узлу                     | fitView / миникарта / выделение                                        |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| React Flow 13    | портал `ViewportPortal`, без флагов                                            | в viewport над нодами; приложение ставит `transform` само          | нет; рецепт — портал + `useInternalNode`/`useNodes`         | нет; в примере — символ внутри ноды-аннотации | не участвует                                                           |
| Svelte Flow 2    | `ViewportPortal target="front" \| "back"`                                      | над или под рёбрами и нодами                                       | нет                                                         | нет                                           | не участвует                                                           |
| Vue Flow 1 и 2   | слот `#zoom-pane`; слот по умолчанию — закреплён                               | в viewport после нод                                               | только `NodeToolbar` (экранный масштаб)                     | нет                                           | не участвует                                                           |
| tldraw           | всё — фигуры; плюс `OnTheCanvas` (под фигурами) и `InFrontOfTheCanvas` (экран) | страница / экран                                                   | привязки (`BindingUtil`) — первоклассные записи             | стрелка с привязкой и нормированным якорем    | у фигур — методы `canSnap`, `canTabTo`, `canCull`…; слоты вне модели   |
| JointJS 4.2      | слои бумаги `back` / `front` / `tools` и `HighlighterView`                     | всё в координатах бумаги                                           | `HighlighterView` повторяет трансформацию своей ячейки      | конец связи может быть точкой                 | fit считает только слои графа, `back`/`front` вне границ автоматически |
| AntV X6          | нода (`Shape.HTML`) или инструменты в слое `decorator`                         | `stage` / `decorator` / `overlay`                                  | инструменты ячейки                                          | конец ребра может быть точкой                 | все ячейки в границах; исключения — глобальными фильтрами              |
| GoJS             | `Part` — не узел, со свойствами; политика на слое                              | слои Background, Foreground, ViewportForeground… со своими флагами | `Adornment.adornedPart`                                     | категория `Comment` + `BalloonLink`           | `isInDocumentBounds` у части и слоя, `selectable`, `isTemporary`       |
| Rete.js          | плагин комментариев                                                            | в трансформируемом контейнере                                      | inline-комментарий двигается с нодой; frame охватывает ноды | не найдено                                    | выделение — по расширению; миникарта — не найдено                      |
| Foblex Flow      | нет; заметка — `fNode` с флагами                                               | вне `f-canvas` — только закреплённое                               | `[fConnectionContent]` вдоль связи                          | нет                                           | исключения из fit не найдено                                           |
| Excalidraw, Miro | всё — элементы                                                                 | —                                                                  | `startBinding`/`endBinding` с `fixedPoint`; у Miro `snapTo` | коннектор с привязкой                         | —                                                                      |

### Что стоит знать по каждой

**Vue Flow.** Два слота вместо портала: `#zoom-pane` рисуется в трансформируемом слое после нод, слот по умолчанию — поверх, закреплён ([slots.md][vf-slots], для 2.0 — [VueFlow.vue][vue-flow]). Идея та же, что у React Flow; ничего нового.

**tldraw.** Две противоположные идеи сразу. Основная — «всё фигура», а поведение задаётся методами класса фигуры (`canSnap`, `canTabTo`, `canCull`, `canBind`) ([ShapeUtil.ts][tl-shapeutil]). Это и есть путь «нода с флагами», доведённый до конца: каждая подсистема спрашивает тип. Вторая — компоненты `OnTheCanvas` (в слое страницы под фигурами) и `InFrontOfTheCanvas` (экран) ([DefaultCanvas.tsx][tl-canvas]) для того, что фигурой не является. Стрелки привязываются к фигурам записью-привязкой с нормированной точкой ([bindings][tl-bindings]).

**JointJS 4.2.** Слои бумаги `grid`, `back`, `labels`, `front`, `tools`; приложение добавляет свои через `paper.addLayerView` ([release notes][jj-42], [Paper.mjs][jj-paper]). Важная деталь: `getContentArea`, на котором стоит fit, объединяет только слои графа, поэтому всё в `back`/`front` вне границ без всяких флагов. `HighlighterView` монтируется в выбранный слой и повторяет трансформацию ячейки — так содержимое следует за элементом ([highlighters][jj-highlighters]).

**AntV X6.** Свободного примитива нет: HTML-содержимое — нода, исключения — глобальные фильтры `interacting` и `selecting.filter`; в границы попадают все ячейки ([view.ts][x6-view], [transform.ts][x6-transform]). Повторяет нашу текущую ситуацию.

**GoJS.** Самая богатая модель: `Part` (не узел, к нему нельзя провести связь) со свойствами `layerName`, `isInDocumentBounds`, `isLayoutPositioned`, `selectable`; у слоя — `allowSelect`, `pickable`, `isInDocumentBounds`, `isTemporary`, `isViewportAligned` ([layers][gj-layers], [Part][gj-part], [Layer][gj-layer]). Политика задаётся на слое, а не на каждом объекте. `Adornment` следует за `adornedPart`. Комментарии — нода категории `Comment` и `BalloonLink` в фоновом слое ([comments sample][gj-comments]).

**Rete.js.** Комментарии — плагин в трансформируемом контейнере. Inline-комментарий привязан к одной ноде и сдвигается с ней; frame-комментарий охватывает набор нод и тащит их за собой ([comments guide][rete-comments]).

**Foblex Flow.** В `f-canvas` проецируются только группы, связи и ноды; всё остальное содержимое `f-flow` закреплено поверх ([f-canvas.component.html][fb-canvas]). Заметка возможна только нодой с `fDraggingDisabled`, `fSelectionDisabled`, `fMinimapClass`. Как у нас сейчас.

### Что из этого следует

- Нижняя планка у всех, кроме X6 и Foblex, — место в трансформируемом слое вне модели графа: React/Svelte/Vue Flow, tldraw (`OnTheCanvas`), JointJS (`back`/`front`), Rete. ngx-vflow сейчас в одной группе с X6 и Foblex — у нас этого места нет.
- Слой под графом есть у Svelte (`back`), tldraw (`OnTheCanvas`), JointJS (`back`), GoJS (Background). Это аргумент за два слоя, а не один.
- «Вне границ по умолчанию, в границах по желанию» — JointJS (по слою) и GoJS (`isInDocumentBounds`). Это вариант (б) открытого вопроса 3.
- Следование за узлом в ядре — у GoJS, JointJS, Rete и tldraw, но везде это часть большей модели (адорнменты, хайлайтеры, привязки). В семействе xyflow этого нет, и рецепт — чтение позиции ноды. Для ngx-vflow с сигнальным `getNodeRect` рецепт стоит одну строку.
- Стрелка как привязка (tldraw, Excalidraw, Miro, GoJS `BalloonLink`) — признак редакторов, где пользователь сам рисует заметки. Для заметок, которыми управляет приложение, она избыточна.

[vf-slots]: https://github.com/bcakmakoglu/vue-flow/blob/master/docs/src/guide/vue-flow/slots.md
[tl-shapeutil]: https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/editor/shapes/ShapeUtil.ts
[tl-canvas]: https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/components/default-components/DefaultCanvas.tsx
[tl-bindings]: https://tldraw.dev/sdk-features/bindings
[jj-42]: https://docs.jointjs.com/learn/release-notes/4.2.0/
[jj-paper]: https://github.com/clientIO/joint/blob/master/packages/joint-core/src/dia/Paper.mjs
[jj-highlighters]: https://docs.jointjs.com/learn/features/highlighters/
[x6-view]: https://github.com/antvis/X6/blob/master/src/graph/view.ts
[x6-transform]: https://github.com/antvis/X6/blob/master/src/graph/transform.ts
[gj-layers]: https://gojs.net/latest/intro/layers.html
[gj-part]: https://gojs.net/latest/api/symbols/Part.html
[gj-layer]: https://gojs.net/latest/api/symbols/Layer.html
[gj-comments]: https://gojs.net/latest/samples/comments
[rete-comments]: https://retejs.org/docs/guides/comments
[fb-canvas]: https://github.com/Foblex/f-flow/blob/main/libs/f-flow/src/f-canvas/f-canvas.component.html

## 4. ngx-vflow сегодня

Прочитано: [`vflow.component.html`][v-html], [`vflow.component.scss`][v-scss], [`edge-label.component.ts`][v-label], [`template.directive.ts`][v-templates] (`*vEdgeLabel`), [`node-toolbar.component.ts`][v-toolbar], [`minimap.component.ts`][v-minimap] и [`minimap-canvas.directive.ts`][v-minimap-canvas], [`viewport.service.ts`][v-viewport-service], [`alignment.service.ts`][v-alignment], [`viewport-culling.directive.ts`][v-culling], [`press-target.ts`][v-press], [`viewport-gestures.directive.ts`][v-gestures], [`gesture-exclusions.directive.ts`][v-exclusions], [`content-layer.spec.ts`][v-content-spec], демо `feature-overview`.

### 4.1. Слои

```
[data-v-root]                         isolation: isolate — один контекст наложения на flow
├─ svg.v-background-svg               фон
├─ div.v-pane            z 1          цель жестов
│  └─ div.v-viewport                  translate + scale, pointer-events: none, контекст наложения
│     ├─ svg.v-defs-svg               маркеры
│     ├─ svg.v-overlay-svg   z 1e6    направляющие выравнивания, рамка выделения
│     ├─ svg.v-connection-svg z 1e6+1 линия соединения
│     ├─ div.v-nodes-layer            без z-index: ноды соревнуются z-index-ом с рёбрами
│     ├─ div.v-edges-layer            без z-index
│     └─ div.v-edge-labels-layer      HTML-подписи *vEdgeLabel, z-index = renderOrder ребра
├─ <ng-content select="v-minimap">    z 2
└─ div.v-content-layer   z 2          всё прочее содержимое <vflow>: закреплено на панели
```

Порядок наложения внутри viewport задают z-index сущностей: `renderOrder` у нод и рёбер от 0 вверх, у групп при `[parentsBelowEdges]` — отрицательный (`groupIndex - groups.length`, [node.component.ts#L107-L114][v-node-z]). Это важно для слоя «под графом»: ему нужен z-index ниже самой нижней группы, а не просто `0`.

Пока не прошла первая раскладка, `:host(.v-initializing) .v-viewport { visibility: hidden }` ([scss#L149][v-scss-init]) — всё внутри viewport, включая будущий слой, скрыто без дополнительной работы.

### 4.2. Что из механизмов React Flow уже есть

| React Flow                             | ngx-vflow                                                                                                                                                                                                                             | Разница                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `<Panel>`, дети `<ReactFlow>`          | любое содержимое `<vflow>` попадает в `.v-content-layer` ([html#L78][v-html-content]); слой прозрачен, его прямые дети берут указатель; компонент внутри получает `VflowComponent` через DI ([content-layer.spec.ts][v-content-spec]) | позиции `top-left` и т. п. нет — CSS приложения (`vui-controls class="absolute bottom-2.5 left-2.5"`) |
| `<EdgeLabelRenderer>`, `<EdgeToolbar>` | `*vEdgeLabel` — шаблон регистрируется в модели ребра и рисуется в `.v-edge-labels-layer` в точке пути; позицию считает библиотека                                                                                                     | у нас позиционирует библиотека, у них приложение                                                      |
| `<NodeToolbar>`                        | `<v-node-toolbar>` внутри ноды, позиционируется CSS-ом относительно её рамки                                                                                                                                                          | наш масштабируется с зумом и не умеет группу нод; у них — в экранных пикселях, по массиву `nodeId`    |
| `<MiniMap>`                            | `<v-minimap>`, рисует `entities.nodes()` на canvas ([minimap-canvas.directive.ts#L98][v-minimap-canvas])                                                                                                                              | —                                                                                                     |
| `<ViewportPortal>`                     | **нет**                                                                                                                                                                                                                               | единственный отсутствующий                                                                            |

### 4.3. Где заметка-нода задевает подсистемы

| Подсистема                         | Откуда берёт ноды                                                                                        | Заметка-нода сегодня                                                                         | Содержимое в новом слое                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Направляющие выравнивания          | `nodeRenderingService.viewportNodes()` без фильтра ([alignment.service.ts#L55-L58][v-alignment-targets]) | цель выравнивания и шагов между нодами                                                       | не видит                                           |
| Миникарта                          | `entities.nodes()`                                                                                       | прямоугольник                                                                                | не видит                                           |
| `fitView`, `getNodesBounds`        | `entities.nodes()` ([viewport.service.ts#L279][v-bounds])                                                | в границах (демо на это опирается)                                                           | не видит (вопрос 3)                                |
| Пространственный индекс, отсечение | `entities.nodes()` ([viewport-culling.directive.ts#L51][v-culling-nodes])                                | индексируется и отсекается                                                                   | всегда отрисовано                                  |
| Рамка выделения, клик-выделение    | ноды и рёбра                                                                                             | нужен `selectable: false`                                                                    | не видит                                           |
| Клавиатура и доступность           | каждая нода получает `vflowA11y` и `vflowKeyboardEntity`                                                 | нужны `focusable: false` и `ariaLabel`                                                       | обычный DOM в регионе flow, порядок — порядок слоя |
| Жесты                              | таблица [press-target.ts][v-press]                                                                       | `draggable: false`; нажатие на неперетаскиваемую ноду панорамирует                           | то же без флагов, по той же таблице                |
| Данные приложения                  | —                                                                                                        | заметки в том же `nodes`, тип данных — объединение `StepData \| GroupData \| AnnotationData` | отдельный список приложения                        |

Пять подсистем, каждая потребовала бы свой флаг исключения, если идти путём «нода с флагом».

### 4.4. Клик по содержимому с указателем

`ViewportGesturesDirective.finish` снимает выделение по клику, если цель не внутри `[data-v-node]` или `[data-v-edge]` ([viewport-gestures.directive.ts#L424-L433][v-gestures-finish]). Содержимое нового слоя для неё — часть панели: клик по нему снимает выделение, нажатие с движением панорамирует. У React Flow клик по порталу выделение не снимает (обработчик панели требует `target === pane`). Я считаю наше поведение правильнее для декора — заметка выглядит как часть холста — и оно не требует кода. Для интерактивного содержимого (кнопка, ссылка, поле) действуют `vNoDrag`/`vNoPan`: нажатие не начинает жест панели, а без жеста нет и снятия выделения.

## 5. Рекомендация

### 5.1. API

```ts
/** Content of the application in flow space: it pans and zooms with the flow, and it is not part of the graph. */
@Directive({ selector: 'ng-template[vCanvas]' })
export class VflowCanvasDirective {
  /** Flow-space point of the content's top-left corner. Nothing renders while it is null or undefined. */
  readonly vCanvas = input<Point | null | undefined, Point | '' | null | undefined>(
    { x: 0, y: 0 },
    {
      transform: (point) => (point === '' ? { x: 0, y: 0 } : point),
    },
  );
  /** `above` the nodes and edges, or `below` them. */
  readonly vCanvasLayer = input<'above' | 'below'>('above');
}
```

```html
<!-- short form, the usual case -->
<figure *vCanvas="{ x: 0, y: 50 }">…</figure>
<div *vCanvas="lane.point; layer: 'below'" class="h-[320px] w-[600px] bg-zinc-50"></div>

<!-- long form, several root elements -->
<ng-template [vCanvas]="point" vCanvasLayer="below">…</ng-template>

<!-- no point: the layer's origin, the application places the content itself (React Flow style) -->
<svg *vCanvas class="overflow-visible">…</svg>
```

Шаблон без контекста, как у `*vEdgeLabel`: он замыкается на место объявления, поэтому видит и `ctx` ноды, если объявлен в её компоненте, и сигналы компонента приложения.

Регистрация — сервис потока (`FlowEntitiesService` или маленький `CanvasContentService`) со списком `{ template, point, layer }` в сигнале; директива добавляет запись в эффекте и убирает в `onCleanup`, ровно как `VflowEdgeLabelTemplateDirective` ([template.directive.ts#L84-L120][v-templates]). Так содержимое можно объявить и из компонента ноды (заметка, которую рисует сама нода за пределами своей рамки), и из компонента-обёртки внутри `<vflow>`. `contentChildren` в `VflowComponent` для этого не годится: он не видит шаблоны из вложенных компонентов.

### 5.2. Слои и порядок наложения

В `.v-viewport` два контейнера, оба `position: absolute; top: 0; left: 0; pointer-events: none`:

- `div.v-canvas-layer[data-v-layer=below]` — первым ребёнком, `z-index` ниже любой сущности (ниже отрицательных z-index групп, например `-1000000`, симметрично `1000000` у оверлеев);
- `div.v-canvas-layer[data-v-layer=above]` — `z-index: 999999`: над любыми нодами, рёбрами и подписями, под `v-overlay-svg` (`1e6`) и `v-connection-svg`, чтобы направляющие и линия соединения оставались видны поверх заметок.

Каждая запись — `div` с `position: absolute; transform: translate(x, y)`, позиция ставится эффектом, а не привязкой хоста (правило из `.scratch/pan-zoom-smoothness-2026-09-26`: никаких чтений сигналов в host-привязках). Порядок записей в слое — порядок регистрации.

### 5.3. Указатель

- Слой и обёртка записи — `pointer-events: none`. Содержимое наследует `none` и полностью прозрачно: нажатие доходит до ноды под стрелкой или до панели.
- Приложение включает указатель там, где он нужен: `class="pointer-events-auto"` / `style="pointer-events: auto"`. Тогда нажатие — нажатие на панель: пан по `press-target.ts`, колесо — зум, клик снимает выделение. Исключения — существующие `vNoPan`, `vNoDrag`, `vNoWheel`, `vNoKeyboard`.
- Новых атрибутов ролей в `press-target.ts` не нужно.

Отвергнуто: `pointer-events: auto` по умолчанию, как у `.v-content-layer`. Заметка со стрелкой, заходящей на ноду, тогда перекрывала бы её край, и это пришлось бы лечить в каждом приложении.

### 5.4. Во что не входит

Направляющие выравнивания, миникарта, `fitView`/`getNodesBounds`/`getIntersectingNodes`/`getNodesAtPoint`, пространственный индекс и CSS-отсечение (записи всегда в DOM — для сотен элементов это забота приложения или повод сделать их нодами), рамка выделения, клик-выделение, удаление, клавиатурная навигация по сущностям, `aria-roledescription` и список нод. Для доступности содержимое — обычный DOM внутри региона flow: декоративное приложение помечает `aria-hidden`, текст читается в порядке слоя (`below` — до нод, `above` — после рёбер).

Опций «включить в миникарту / в выравнивание» не предлагаю: это свойства графа. Единственное, где участие может понадобиться, — `fitView` (вопрос 3).

### 5.5. Следовать за нодой

Отдельного API не нужно: `getNodeRect(id)` уже читается как сигнал ([vflow.component.ts#L587][v-node-rect]), `undefined` до измерения ноды. Вход `vCanvas` принимает `null`/`undefined` и тогда ничего не рисует, так что заметка появляется только когда цель измерена, и сразу на месте.

```ts
protected noteAt(flow: VflowComponent, note: Note): Point | undefined {
  const rect = flow.getNodeRect(note.target);
  return rect && { x: rect.x + rect.width * note.anchor.x + note.offset.x, y: rect.y + rect.height * note.anchor.y + note.offset.y };
}
```

Стрелка остаётся частью заметки: раз заметка едет вместе с целью, геометрия стрелки не меняется. Стрелку, которая тянется между неподвижной заметкой и движущейся нодой, приложение посчитает из тех же двух прямоугольников; связующий «connector» в ядро не нужен.

Отвергнуто: якорь в API (`*vCanvas="anchor: 'stock'; side: 'left'; offset: …"`). Это одна строка приложения против нового набора входов, которые всё равно не покроют «середину группы плюс 12px» или «между двумя нодами». Вернуться можно, если появится второй потребитель (вопрос 4).

### 5.6. SSR и первая раскладка

- Ничего не измеряется: позиция — из входа, поэтому на сервере разметка готова с правильным `transform`. (Само ядро на сервере пока падает — исследование пререндера документации от 2026-11-19.)
- До `initialized` слой скрыт вместе с `.v-viewport`, мигания нет. Запись, чья точка зависит от `getNodeRect`, появляется в том же кадре, что и нода.
- Измерение понадобится, только если ответ на вопрос 3 — «участвует в `fitView` по своему размеру»; тогда запись должна ждать своего измерения и задерживать `initialized`, как ноды.

### 5.7. Отвергнутые варианты

| Вариант                                                                                 | Почему нет                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Нода с флагом (`decorative: true` или набор `inAlignment`, `inMinimap`, `inBounds`, …)  | пять подсистем (раздел 4.3) и каждая следующая должны помнить о флаге; данные приложения остаются в `nodes`; к цели всё равно не привязано. Правильно только для заметок, которыми управляет пользователь — и тогда это обычные ноды |
| `<ng-content select="[vCanvas]">` в слой                                                | проецируются только прямые дети `<vflow>`: из компонента ноды или обёртки не объявить; на два слоя нужно два селектора                                                                                                               |
| Портал как у React Flow, без точки                                                      | остаётся частным случаем (`*vCanvas` без значения), но позиционирование через `transform` руками — главный повод, по которому React Flow сам выбрал ноды                                                                             |
| Содержимое в экранных пикселях (не масштабируется, как `NodeToolbar` React Flow)        | другой примитив с пересчётом на каждый кадр пана — ровно то, от чего ушли в `.scratch/pan-zoom-smoothness-2026-09-26`. Не для этой задачи                                                                                            |
| Готовый компонент «заметка со стрелкой» в ядре (идея комментариев GoJS, стрелок tldraw) | частный случай для одного демо; если нужен — часть `@vflow/ui` поверх `*vCanvas`                                                                                                                                                     |

### 5.8. Заметки демо на новом примитиве

```ts
// flow-store.service.ts: notes leave the graph
export interface Note {
  number: number;
  text: string;
  /** The node the note points at, its point as a share of that node's box, and the note's offset from it. */
  target: string;
  anchor: Point;
  offset: Point;
  arrow?: NoteArrow;
}

readonly notes: readonly Note[] = [
  { number: 1, text: 'A selected node shows its toolbar…', target: 'order', anchor: { x: 0, y: 0 }, offset: { x: 0, y: -150 }, arrow: { … } },
  { number: 3, text: 'A group moves its children…', target: 'fulfilment', anchor: { x: 0, y: 0 }, offset: { x: 50, y: -100 }, arrow: { … } },
  // …
];
```

```html
<vflow #flow [nodes]="store.nodes()" … (initialized)="flow.fitView({ maxZoom: 1, padding: 0.2 })">
  … @for (note of store.notes; track note.number) {
  <app-note *vCanvas="noteAt(flow, note)" [note]="note" />
  }

  <v-minimap [pannable]="true" [zoomable]="true" />
  <vui-controls class="absolute bottom-2.5 left-2.5" />
</vflow>
```

`AnnotationNodeComponent` становится обычным компонентом `app-note` с входом `note` вместо `injectNode`; разметка `figure` + `svg` остаётся. Из `note()` уходят `draggable`, `selectable`, `focusable`, `ariaLabel`; тип `nodes` теряет `AnnotationData`. Направляющие перестают цепляться за заметки, миникарта показывает только граф, заметки едут за своими нодами.

Заметки 5 и 6 («Drag a node: guides…», «Hold Shift and drag…») ни на что не указывают; их естественное место — либо `*vCanvas` с фиксированной точкой, либо закреплённая подсказка в `.v-content-layer`, как `vui-controls` (вопрос 5).

## 6. Открытые вопросы

1. **Имя.** `*vCanvas` (коротко, «на холсте»), `*vViewportContent` (точно, но длинно), `*vPortal` (как у xyflow, но описывает реализацию). Слово «canvas» в документации пока не занято, но есть `<canvas>` миникарты.
2. **Слой по умолчанию.** `above`, как у React Flow и Svelte (`front`), или `below` — заметки и подложки никогда не закрывают граф, но рёбра могут проходить по тексту.
3. **`fitView`.** (а) Не участвует; демо берёт `padding` побольше и держит заметки рядом с нодами. (б) Опция записи `fit: true`: запись измеряется, её прямоугольник входит в `fitView` и в `initialized` ждёт измерения (идея `isInDocumentBounds` у GoJS). (в) `fitView({ include: Rect[] })` — приложение само передаёт прямоугольники. Рекомендую (а) в первой версии и (б), если появится второй потребитель; (в) заставляет приложение знать размер своего HTML.
4. **Якорь к ноде в API** — не нужен сейчас (раздел 5.5)? Или сразу `anchor`/`side`/`offset` по образцу `v-node-toolbar`?
5. **Заметки 5 и 6** — на холсте или закреплённой подсказкой поверх flow?
6. **Клик по содержимому с включённым указателем** снимает выделение, как клик по панели (раздел 4.4), — устраивает, или повторить React Flow, где не снимает?

## 7. Что не проверено

- Сайт reactflow.dev теперь собирается из закрытого репозитория; исходник примера «Feature Overview» взят из встроенного на странице просмотрщика кода, а не из git.
- Ничего не запускалось: поведение React Flow выведено из кода и CSS, не из браузера. В частности, что `ViewportPortal` прозрачен для указателя, следует из наследования `pointer-events: none` от `.xy-flow__viewport`; в документации это сказано только про `EdgeLabelRenderer`.
- Значения z-index слоёв (`±1000000`, `999999`) — предложение; при реализации проверить с `[parentsBelowEdges]`, поднятием выделенной ноды и тестом `stacking-context.spec.ts`.

[xy-focusable]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/NodeWrapper/index.tsx#L58
[xy-commit]: https://github.com/xyflow/xyflow/tree/29ab9e001c2ba320c9d84b00c729c745132d9145
[xy-graphview]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/container/GraphView/index.tsx#L155-L198
[xy-viewport]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/container/Viewport/index.tsx
[xy-css]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/styles/init.css
[xy-portal]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/ViewportPortal/index.tsx
[xy-label-renderer]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/EdgeLabelRenderer/index.tsx
[xy-toolbar-portal]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/NodeToolbar/NodeToolbarPortal.tsx
[xy-node-toolbar]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/NodeToolbar/NodeToolbar.tsx#L63-L99
[xy-edge-toolbar]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/EdgeToolbar/EdgeToolbar.tsx
[xy-panel]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/components/Panel/index.tsx
[xy-children]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/container/ReactFlow/index.tsx#L315
[xy-filter]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xypanzoom/filter.ts#L76-L81
[xy-pane]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/container/Pane/index.tsx#L56-L65
[xy-fit]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/utils/graph.ts#L345-L374
[xy-minimap]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMapNodes.tsx#L86
[xy-inspector]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/examples/react/src/examples/DevTools/DevTools/NodeInspector.tsx
[sv-portal]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/components/ViewportPortal/ViewportPortal.svelte
[sv-portal-types]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/components/ViewportPortal/types.ts
[sv-flow]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/container/SvelteFlow/SvelteFlow.svelte#L176
[sv-flow-front]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/container/SvelteFlow/SvelteFlow.svelte#L211
[sv-portal-action]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/actions/portal/portal.svelte.ts
[vue-flow]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/vue/src/container/VueFlow/VueFlow.vue
[vue-zoompane]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/vue/src/container/Viewport/ZoomPaneSlot.ts
[rf-portal]: https://reactflow.dev/api-reference/components/viewport-portal
[rf-panel]: https://reactflow.dev/api-reference/components/panel
[rf-label-renderer]: https://reactflow.dev/api-reference/components/edge-label-renderer
[rf-overview]: https://reactflow.dev/examples/overview
[v-html]: ../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.html
[v-html-content]: ../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.html#L78
[v-scss]: ../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.scss
[v-scss-init]: ../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.scss#L149
[v-label]: ../../libs/ngx-vflow/src/lib/vflow/components/edge-label/edge-label.component.ts
[v-templates]: ../../libs/ngx-vflow/src/lib/vflow/public-directives/template.directive.ts#L84-L120
[v-toolbar]: ../../libs/ngx-vflow/src/lib/vflow/public-components/node-toolbar/node-toolbar.component.ts
[v-minimap]: ../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap.component.ts
[v-minimap-canvas]: ../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L98
[v-viewport-service]: ../../libs/ngx-vflow/src/lib/vflow/services/viewport.service.ts
[v-bounds]: ../../libs/ngx-vflow/src/lib/vflow/services/viewport.service.ts#L279
[v-alignment]: ../../libs/ngx-vflow/src/lib/vflow/services/alignment.service.ts
[v-alignment-targets]: ../../libs/ngx-vflow/src/lib/vflow/services/alignment.service.ts#L55-L58
[v-culling]: ../../libs/ngx-vflow/src/lib/vflow/directives/viewport-culling.directive.ts
[v-culling-nodes]: ../../libs/ngx-vflow/src/lib/vflow/directives/viewport-culling.directive.ts#L51
[v-press]: ../../libs/ngx-vflow/src/lib/vflow/utils/press-target.ts
[v-gestures]: ../../libs/ngx-vflow/src/lib/vflow/directives/viewport-gestures.directive.ts
[v-gestures-finish]: ../../libs/ngx-vflow/src/lib/vflow/directives/viewport-gestures.directive.ts#L424-L433
[v-exclusions]: ../../libs/ngx-vflow/src/lib/vflow/public-directives/gesture-exclusions.directive.ts
[v-content-spec]: ../../libs/ngx-vflow/src/lib/vflow/components/vflow/content-layer.spec.ts
[v-node-z]: ../../libs/ngx-vflow/src/lib/vflow/components/node/node.component.ts#L107-L114
[v-node-rect]: ../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts#L587
