# Viewport culling и canvas LOD: исследование

**Реализовано после обсуждения:** virtualization сохраняет node/edge views и использует CSS `display:none`; canvas LOD удалён. Начальные измерения выполняются даже offscreen, скрытые DOM-замеры не затирают геометрию, при возврате она обновляется до показа. Focus и активные node gestures удерживают участников в layout. Старые canvas-поля deprecated и игнорируются. Актуальный контракт: [документация virtualization](../../projects/ngx-vflow-demo/src/app/categories/performance/pages/virtualization/index.md). Проверки реализации: 205/205 тестов библиотеки, 9/9 Playwright Chromium; lint, typecheck demo и production-сборка библиотеки успешны. Ниже сохранена история исследования; формулировки о прежней реализации относятся к указанному исходному HEAD. Сравнительный FPS benchmark не выполнялся.

Дата проверки: **2026-09-06**. Первичные источники: официальные документы и исходники; поведение исходников зафиксировано по HEAD репозиториев на дату проверки, оно не обязательно совпадает с последним опубликованным npm-релизом. Benchmark конкурентов не проводился; выводы о сравнительной скорости ниже отсутствуют.

## Что именно сравниваем

Viewport culling решает, какие объекты находятся в видимой области. LOD (level of detail) решает, насколько подробно рисовать видимые объекты. Это независимые оптимизации: если при zoom-out весь граф помещается во viewport, culling оставит весь граф; сокращать детализацию или менять renderer — отдельное решение. Пример совместного применения обоих подходов есть у [tldraw](https://tldraw.dev/sdk-features/performance).

| Библиотека  | Включение culling                               | Что происходит вне viewport                                                                                      | Что происходит при zoom-out                                                                   |
| ----------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| React Flow  | `onlyRenderVisibleElements`, default `false`    | Компоненты, исключённые из списка видимых ID, размонтируются; есть исключения для initial measurement и dragging | Culling сам по себе не снижает детализацию; есть отдельный официальный пример contextual zoom |
| Svelte Flow | Такой же opt-in, default `false`                | Компоненты исключаются из keyed each; дополнительно сохраняются оба endpoint nodes каждого видимого edge         | Та же геометрическая фильтрация; в проверенном пути нет переключения на raster renderer       |
| Vue Flow    | Такой же opt-in, default `false`                | Фильтр списка перед `v-for`; исключения для неизвестного размера и dragging                                      | Culling сам по себе не сокращает число элементов, если весь граф видим                        |
| tldraw      | Автоматически; `canCull()` позволяет отказаться | DOM остаётся; переключается `display: none`; selected/editing shapes сохраняют отображение                       | Дополнительный LOD встроенных shapes и изображений, отдельно от culling                       |

Таблица обобщает проверенные ниже источники. Размонтирование компонента и сохранение graph model — разные вещи: удаление view из списка не является удалением node из данных.

## React Flow

- Официальный API: `onlyRenderVisibleElements=false`; включение может помочь большим графам, но само добавляет overhead. Это не гарантия ускорения. [ReactFlow API](https://reactflow.dev/api-reference/react-flow).
- Селектор переводит viewport в flow coordinates и вызывает `getNodesInside(..., partially=true)`. Реализация перебирает nodes линейно, проверяет пересечение прямоугольников, исключает `hidden`, оставляет dragging nodes. Размер берётся из `measured`, затем `width/height`, затем `initialWidth/initialHeight`. Узел без `internals.handleBounds` принудительно попадает в первичный render даже вне viewport. Это устраняет цикл «чтобы измерить — нужно смонтировать; чтобы смонтировать — нужно знать границы». [Селектор](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useVisibleNodeIds.ts), [getNodesInside](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/graph.ts).
- `NodeRenderer` строит React-дерево только из выбранных ID, подписывается на список ID с shallow comparison и использует общий `ResizeObserver`. При исключении ID компонент размонтируется; observer cleanup прекращает наблюдение. **Следствие:** локальный state внутри custom node не следует считать долговечным хранилищем при включённом culling; данные, которые должны пережить remount, нужно держать вне view. [NodeRenderer](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/container/NodeRenderer/index.tsx), [useNodeObserver](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/useNodeObserver.ts).
- Edges фильтруются независимо от списка видимых nodes: `isEdgeVisible` пересекает viewport с **общим bounding box двух endpoint nodes**. Поэтому edge между двумя невидимыми nodes с разных сторон viewport может остаться видимым. Это приближение, а не вычисление границ SVG path: оно может оставить лишний edge; произвольный custom route, выходящий за endpoint box, этим критерием не описан. [useVisibleEdgeIds](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useVisibleEdgeIds.ts), [isEdgeVisible](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/edges/general.ts).
- В этих проверках нет overscan/padding вокруг viewport и нет spatial index: узлы и edges перебираются. Это описание конкретного пути, не утверждение об отсутствии любых иных оптимизаций в библиотеке. Источники — два селектора и геометрические функции выше.
- Для zoom-out официальный пример показывает изменение содержимого custom node в зависимости от zoom. Это **official recipe**, а не автоматическая замена всех nodes canvas-слоем. [Contextual Zoom](https://reactflow.dev/examples/interaction/contextual-zoom).

## Svelte Flow

- Публичная опция тоже выключена по умолчанию и сопровождается предупреждением об overhead. [SvelteFlow API](https://svelteflow.dev/api-reference/svelte-flow).
- Использует общие `getNodesInside` и `isEdgeVisible` из `@xyflow/system`, но есть важное отличие от React Flow: `getLayoutedEdges` добавляет **source и target каждого видимого edge** в `visibleNodes`. То есть «рендерить только viewport» здесь намеренно не означает «никаких offscreen node views». [visibleElements.ts](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/svelte/src/lib/store/visibleElements.ts).
- Store сначала рассчитывает видимые nodes, затем передаёт ту же Map в расчёт edges; результат используется keyed `{#each store.visible.nodes.values() ...}`. Узлы, не попавшие в итоговую Map, не представлены компонентами. Общий `ResizeObserver` обновляет node internals. **Следствие:** к локальному состоянию view при remount относится та же оговорка, что у React Flow. [Store](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/svelte/src/lib/store/initial-store.svelte.ts), [NodeRenderer](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/svelte/src/lib/container/NodeRenderer/NodeRenderer.svelte).

## Vue Flow

- `onlyRenderVisibleElements=false` подтверждён и документацией, и initial state. Документация отдельно предупреждает о spikes при pan из-за монтажа сложных компонентов. [Официальный текст в репозитории](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/docs/src/examples/hidden.md), [state.ts](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/store/state.ts).
- `getNodesInside` перебирает nodes, проверяет частичное пересечение в flow coordinates, оставляет dragging nodes и nodes с неизвестными размерами. Нулевая площадь также проходит условие `overlappingArea >= area`. В проверенной функции нет viewport padding. [graph.ts](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/utils/graph.ts).
- Getter возвращает отфильтрованный массив, который `NodeRenderer` передаёт в `v-for`; общий `ResizeObserver` вызывает `updateNodeDimensions`. Это монтаж/размонтаж views, а не сохранение всех views через `v-show`. **Следствие:** state custom component должен переживать remount через внешние данные, если это требуется продукту. [getters.ts](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/store/getters.ts), [NodeRenderer.vue](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/container/NodeRenderer/NodeRenderer.vue).
- Видимость edges определяется общим box endpoint nodes, отдельно от node-фильтра: crossing edge может остаться при обоих endpoints вне viewport. Ограничение относительно custom path такое же, как у xyflow. [edge.ts](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/utils/edge.ts).

## tldraw

- По умолчанию offscreen shapes скрываются через `display: none`, **DOM и компоненты остаются**. Selected shapes и редактируемый shape исключены из culled set. `ShapeUtil.canCull=false` позволяет оставить shape отображаемым; документированный пример — shapes, которым нужно измерять DOM для определения размера. Это полезная альтернатива unmount, когда дорого или нежелательно пересоздавать custom content. [Visibility](https://tldraw.dev/sdk-features/visibility), [ShapeUtil](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/editor/shapes/ShapeUtil.ts), [Editor.getCulledShapes](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/editor/Editor.ts).
- Геометрический запрос опирается на пространственный индекс R-tree и bounds shapes. В текущем `notVisibleShapes` используется `getViewportPageBounds()` без добавочного overscan, после spatial query вычисляется дополнение к visible set. При этом весь culling pipeline нельзя назвать гарантированно сублинейным: derivation проходит IDs страницы, а controller проходит зарегистрированные containers и меняет CSS только при изменении состояния. [Описание индекса](https://tldraw.dev/sdk-features/visibility), [notVisibleShapes.ts](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/editor/derivations/notVisibleShapes.ts), [useShapeCulling.tsx](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/hooks/useShapeCulling.tsx).
- Отдельно от culling применяется LOD: при малом zoom упрощаются shadows/fills/strokes, изображения могут получать меньшую resolution через asset store; предусмотрен `getEfficientZoomLevel` для более стабильных обновлений во время движения камеры. Документация предлагает custom shapes самостоятельно упрощать содержимое при маленьком размере на экране. Это пример culling + LOD без универсальной растровой подмены node views. [Performance](https://tldraw.dev/sdk-features/performance).
- **Следствие:** `display:none` экономит layout/paint для скрытого дерева, но не обещает освобождения DOM-памяти, остановки effects или прекращения обновлений данных; при выборе этого подхода нужно измерять именно свой workload. Утверждение «в DOM остаются только видимые shapes» для tldraw неверно. [Реализация CSS-переключения](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/hooks/useShapeCulling.tsx).

## Что переносится в обсуждение ngx-vflow

1. Сначала разделить два решения: **удалить canvas LOD** и **оставить viewport culling**. Culling — подтверждённый подход у всех рассмотренных библиотек, но он не ограничит количество views при обзорном zoom.
2. Геометрия должна жить дольше view: размеры, handle bounds и edge geometry нужны даже при отсутствующем DOM endpoint. Начальное измерение требует исключения из culling либо заранее предоставленных размеров/геометрии; xyflow и Vue Flow явно делают initial-render исключения.
3. Не фильтровать edges по правилу «оба endpoints видимы»: корректный crossing edge может проходить через viewport с обоими nodes вне его. Для поддерживаемых custom routes проверка фактических path bounds точнее endpoint-box эвристики конкурентов.
4. Отдельно определить lifetime: unmount уменьшает число компонентов, CSS hiding сохраняет их состояние. Положение, selection и durable user data должны оставаться в application-owned state независимо от выбранного rendering policy.
5. Проверять production build на двух разных сценах: небольшой видимый фрагмент большого графа и весь граф после fitView/zoom-out; сравнивать cold measurement, pan/remount, frame times и число live views. Исследованные источники не дают оснований заранее объявить canvas или DOM победителем для ngx-vflow.

Эти пункты — выводы из сопоставления, не изменения API и не принятый ADR. Локальную реализацию ngx-vflow и результаты её проверок следует читать отдельно от фактов о конкурентах.

## Текущая реализация ngx-vflow

Исследован HEAD `cdcdc82992636a322a667f235d1acbc276bca630`, 2026-09-06. Код библиотеки не менялся.

Сейчас под одним флагом объединены две оптимизации:

| Настройки / масштаб                                    | HTML-ноды             | SVG-рёбра                                                  | Canvas                                                                     |
| ------------------------------------------------------ | --------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `virtualization: false` (default)                      | Все                   | Все валидные, с отдельной проверкой готовности отображения | Отсутствует                                                                |
| `virtualization: true`, zoom ≥ 0.5 (default threshold) | Пересекающие viewport | С пересекающим viewport bounding box пути                  | Смонтирован; рисует превью viewport-нод, у которых `isVisible() === false` |
| `virtualization: true`, zoom < 0.5                     | Не монтируются        | Не монтируются                                             | Упрощённые превью viewport-нод                                             |

Источники: [NodeRenderingService](../../projects/ngx-vflow-lib/src/lib/vflow/services/node-rendering.service.ts), [EdgeRenderingService](../../projects/ngx-vflow-lib/src/lib/vflow/services/edge-rendering.service.ts), [Optimization](../../projects/ngx-vflow-lib/src/lib/vflow/interfaces/optimization.interface.ts), [шаблон Vflow](../../projects/ngx-vflow-lib/src/lib/vflow/components/vflow/vflow.component.html), [PreviewFlowComponent](../../projects/ngx-vflow-lib/src/lib/vflow/components/preview-flow/preview-flow.component.ts).

**Viewport culling уже реализован и не требует canvas.** Ноды отбираются через пересечение прямоугольника `globalPoint + width/height` с viewport в flow space. Вычисление использует `x = -panX/zoom`, `width = flowWidth/zoom` и аналогично для Y. Отдельного пространственного индекса, overscan и исключения для активной ноды в этом фильтре нет. Canvas перебирает этот же список, а не весь граф. Отбор делает линейный проход по нодам и валидным рёбрам; видимые результаты дополнительно сортируются. Это анализ кода, не замер стоимости кадра. [viewport.ts](../../projects/ngx-vflow-lib/src/lib/vflow/utils/viewport.ts), [node-rendering.service.ts](../../projects/ngx-vflow-lib/src/lib/vflow/services/node-rendering.service.ts), [edge-rendering.service.ts](../../projects/ngx-vflow-lib/src/lib/vflow/services/edge-rendering.service.ts).

Canvas — отдельный LOD renderer: default-ноды получают прямоугольник и текст, custom-ноды без preview style — полупрозрачный прямоугольник. Это не снимок Angular-компонента. Слой имеет `pointer-events: none` и `aria-hidden="true"`; рёбра на нём не рисуются. [draw-node.ts](../../projects/ngx-vflow-lib/src/lib/vflow/components/preview-flow/draw-node.ts), [SCSS](../../projects/ngx-vflow-lib/src/lib/vflow/components/vflow/vflow.component.scss), [template](../../projects/ngx-vflow-lib/src/lib/vflow/components/vflow/vflow.component.html).

### Что нужно сохранить или уточнить при отказе от canvas

1. **Геометрия до первого mount.** По умолчанию нода имеет размеры 100×50; content-driven размеры обновляет ResizeObserver только после появления DOM. Фильтр видимости не принуждает ещё не измеренные ноды к mount. Поэтому возможна неверная оценка пересечения для большой custom-ноды, чей исходный прямоугольник целиком снаружи. Это выведенный из кода риск, отдельно не воспроизводился в этом исследовании. Canvas использует те же размеры и эту проблему не решает. [defaults](../../projects/ngx-vflow-lib/src/lib/vflow/interfaces/node.interface.ts), [NodeModel](../../projects/ngx-vflow-lib/src/lib/vflow/models/node.model.ts), [resize controller](../../projects/ngx-vflow-lib/src/lib/vflow/directives/node-resize-controller.directive.ts).
2. **Пересекающие экран рёбра.** Текущие bounds относятся к пути, а не просто к двум endpoint-нодам; custom curve может предоставить bounds, иначе используется SVG `getBBox()`. Это стоит сохранить. После виртуального удаления ноды используется ранее известная геометрия handles. Если endpoint вообще никогда не монтировался, сохранённой геометрии нет: без handles путь пуст. [EdgeModel](../../projects/ngx-vflow-lib/src/lib/vflow/models/edge.model.ts), [SVG bounds](../../projects/ngx-vflow-lib/src/lib/vflow/utils/svg-path-bounds.ts).
3. **Жизненный цикл.** При выходе из viewport `@for` удаляет NodeComponent и его custom-view; NodeModel остаётся. Данные в application-owned state сохраняются, локальное состояние уничтоженного custom-компонента само по себе не сохраняется. При возврате custom-view измеряется заново. Это уже свойство текущей virtualization, а не последствие удаления canvas. [NodeComponent](../../projects/ngx-vflow-lib/src/lib/vflow/components/node/node.component.ts), [node template](../../projects/ngx-vflow-lib/src/lib/vflow/components/node/node.component.html).
4. **Активное взаимодействие и доступность.** До изменения публичного поведения следует определить удержание focused/editing/dragging/resizing ноды при выходе за экран и проверить drag auto-pan. Текущий фильтр таких исключений не имеет; документация явно откладывает совместимость keyboard accessibility с virtualization. Overscan может уменьшить частоту mount/unmount у границы, но не заменяет политику активных элементов. [node rendering](../../projects/ngx-vflow-lib/src/lib/vflow/services/node-rendering.service.ts), [accessibility docs](../../projects/ngx-vflow-demo/src/app/categories/interactions/pages/accessibility/index.md).

## Дополнительные сравнения

### Rete.js: culling и LOD — разные уровни оптимизации

Официальный пример LOD сочетает удаление невидимых нод с упрощением видимых при отдалении. Пример LOD GPU отдельно рисует упрощённые ноды и связи через Pixi.js на canvas. Это примеры интеграции, не доказательство наличия такого поведения по умолчанию в базовом renderer. По публичным страницам подтверждён подход; детали реализации примеров не проверялись. [LOD](https://retejs.org/examples/lod/), [LOD GPU](https://retejs.org/examples/lod-gpu/).

Rete прямо выделяет случай, когда все ноды помещаются во viewport и стоимость их отображения остаётся высокой; рекомендует уменьшать детализацию. Для рёбер без DOM-сокетов документация предлагает вычислять координаты через собственный `BaseSocketPosition`. [Performance](https://retejs.org/docs/best-practices/performance/), [Connections](https://retejs.org/docs/guides/connections/).

### Foblex Flow: progressive rendering под названием virtualization

В проверенном `fVirtualFor` элементы создаются порциями через `requestAnimationFrame` до конца массива. Директива не проверяет пересечение с viewport и в итоге монтирует все элементы. Это распределение начальной работы между кадрами, а не аналог viewport culling. Источник закреплён: [f-virtual-for.ts, b529623](https://github.com/Foblex/f-flow/blob/b529623626724575ec439f984c152619695cfea1/libs/f-flow/src/f-virtual/f-virtual-for.ts). Официальный [stress test](https://flow.foblex.com/examples/stress-test) также описывает функцию как progressive rendering.

## Первоначальное предложение для ngx-vflow (уточнено ниже после обсуждения display:none)

**Рекомендация, не принятое архитектурное решение:** оставить opt-in `virtualization` с понятной семантикой «монтировать видимые HTML-ноды и SVG-рёбра», отделив обязательное переключение в canvas LOD. Использовать существующие фильтры; отдельный renderer, новый индекс или IntersectionObserver ради этого не нужны. ADR-0001 этому направлению не противоречит: ноды остаются native HTML, рёбра — отдельными SVG. [ADR-0001](../../docs/adr/0001-native-html-node-rendering.md).

Есть дешёвый способ предварительно сравнить поведение без правок библиотеки:

```html
[optimization]="{ virtualization: true, virtualizationZoomThreshold: 0 }"
```

При положительном zoom эта настройка отключает переход в LOD и оставляет viewport culling на всех масштабах. **Canvas-компонент при этом всё ещё существует**, выполняет свой effect и может дать промежуточное превью ещё не смонтированных нод. Это проверка поведения без zoom cutoff, не полноценный benchmark удаления canvas. Следствие проверено чтением обеих threshold-веток, отдельно этот вариант в браузере не измерялся.

Решение об окончательном удалении LOD стоит принять после сравнения текущего режима и culling без cutoff на production demo:

- Маленькая видимая часть большого графа: pan через границы viewport, mount/unmount, время кадра.
- Весь граф во viewport после fitView: простой и тяжёлый custom template, отдельно с рёбрами и без.
- Холодный старт, первый замер, пересекающие экран связи с offscreen endpoints, возврат нод.
- Ввод в custom-компоненте, focus и drag/resize у границы viewport.

Имеющийся stress demo уже содержит 1024 custom-ноды и 1023 ребра; его можно использовать как исходную сцену. [demo](../../projects/ngx-vflow-demo/src/app/categories/performance/pages/stress-test/demo/stress-test-demo.component.ts).

При zoom-out площадь видимой области в flow space растёт как `1 / zoom²`. Например, zoom 0.25 охватывает в 16 раз большую площадь, чем zoom 1 при том же размере окна. Если весь граф виден, culling почти ничего не отсечёт. Поэтому отказ от canvas упрощает архитектуру и сохраняет полноценные ноды/рёбра на всех масштабах, но сам по себе не доказывает ускорение. LOD можно вернуть как независимую возможность при измеренной проблеме большого числа одновременно видимых сложных нод.

При изменении реализации нужно явно решить миграцию публичных `virtualizationZoomThreshold` и `NodePreview`; молча удалять их в совместимом релизе не следует. Overscan/удержание активных элементов и bootstrap измерений нужно рассматривать как отдельные требования корректности, а пространственный индекс — только после профилирования.

## Локальная проверка

В ходе исследования выполнены существующие регрессии:

```sh
npx ng test ngx-vflow-lib --watch=false --browsers=ChromeHeadless --progress=false --include='**/audit-regressions.spec.ts' --include='**/initial-handles.spec.ts'
```

Результат: **23/23 успешно**, Chrome Headless 152. В набор входят culling offscreen edge, crossing path после unmount, pan туда/обратно, zoom threshold и готовность геометрии. Это проверка текущего поведения, не сравнительный FPS benchmark и не доказательство отсутствия всех рисков выше.

## Проверка display:none и последствия для ngx-vflow

Предпочтение пользователя после первого исследования: сохранять экземпляры custom-компонентов через `display:none`; уточнить начальное измерение и минимальные исключения для взаимодействий. Это уточняет прежнюю рекомендацию про unmount: следующий рассматриваемый вариант — **CSS culling со стабильными node views**, а не удаление Angular views при pan. Реализация библиотеки пока не менялась.

В [display-none-check.cjs](./display-none-check.cjs) выполнена изолированная проверка Chromium 145.0.7632.6:

```sh
node .scratch/virtualization-2026-09-06/display-none-check.cjs
```

- `visibility:hidden`: вложенный блок по-прежнему имеет размеры 240×80.
- `display:none` на родителе: `scrollWidth/scrollHeight` вложенного блока становятся 0×0, ResizeObserver получает ширину 0, сфокусированный input теряет фокус.
- После показа: размер возвращается к 240×80. DOM-элемент и значение input сохраняются; фокус автоматически не возвращается.

Это проверка поведения браузера, не интеграционный тест Angular и не benchmark. Сохранение экземпляра Angular-компонента требует оставить его в том же view со стабильным track, не переключать `@if`/`@for` по видимости.

В текущем [node-resize-controller.directive.ts](../../projects/ngx-vflow-lib/src/lib/vflow/directives/node-resize-controller.directive.ts) callback безусловно записывает `target.scrollWidth/scrollHeight` в модель. Поэтому простая CSS-подмена без изменения измерения запишет нулевую геометрию. [NodeHandlesController](../../projects/ngx-vflow-lib/src/lib/vflow/directives/node-handles-controller.directive.ts) также запускает измерения по resize, а [HandleModel](../../projects/ngx-vflow-lib/src/lib/vflow/models/handle.model.ts) читает DOMRects custom handles без проверки CSS-culling. При переходе нужно пропускать измерения именно исключённых из layout views, сохраняя последние bounds и координаты handles; blanket-проверка «игнорировать любые нули» смешает culling с легитимной нулевой геометрией.

Предлагаемый порядок:

1. Нода без полной геометрии монтируется для измерения даже вне viewport. Пока измеряются размеры и handles, используется `visibility:hidden`, который уже применяется в NodeComponent.
2. Когда геометрия готова, viewport определяет `display:none` для неактивных offscreen-нод. View остаётся, model geometry не перезаписывается скрытыми замерами.
3. При возвращении layout восстанавливается; если содержимое изменилось в скрытом состоянии, геометрия обновляется перед показом ноды и зависимых рёбер. Кэш до этого может быть устаревшим: невозможно точно отслеживать произвольный content-driven размер постоянно исключённого из layout DOM без отдельного измерения. Ноды, которым необходимо такое измерение вне экрана, требуют отдельной политики (аналог `canCull=false` у tldraw).
4. Для взаимодействий предлагаются узкие исключения: активное перетаскивание/resize и нода, содержащая DOM-focus. Просто `selected` можно не исключать: массовый выбор не должен сам по себе выключать culling всего графа. Это предложение для ngx-vflow, не описание единой политики всех конкурентов.

Состояние drag и resize уже доступно через [FlowStatusService](../../projects/ngx-vflow-lib/src/lib/vflow/services/flow-status.service.ts) и `NodeModel.resizing`; [KeyboardNavigationDirective](../../projects/ngx-vflow-lib/src/lib/vflow/directives/keyboard-navigation.directive.ts) уже отслеживает focus внутри сущности. При реализации отдельно учитывать группу перетаскиваемых нод и источник активного соединения, а не только initiating node. Новая универсальная система interaction locks пока не требуется.

CSS hiding сохраняет память компонентов, подписки и effects; оно сокращает browser layout/paint скрытого содержимого, но не отменяет Angular/JS работу и первоначальный mount. Начальную геометрию всех произвольных custom-нод приходится либо измерить, либо получить от приложения; начальную стоимость нельзя устранить одним `display:none`. React Flow документирует второй путь через размеры ноды и `handles`: [официальный API для заранее известной геометрии](https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration).

## Уточнение: первый замер и активные элементы

Повторно проверены те же pinned commits; ниже уточнение поведения React Flow, Vue Flow и tldraw, а не benchmark или изменение библиотеки.

**React Flow платит за первоначальное измерение.** Пока нет `internals.handleBounds`, `getNodesInside` принудительно включает ноду даже вне viewport. `NodeWrapper` монтирует её с `visibility: hidden`, если размеры ещё неизвестны; это оставляет DOM измеряемым. Общий `ResizeObserver` вызывает `updateNodeInternals`, сохраняющий `measured` и координаты handles в node lookup. После этого нода может выйти из списка видимых компонентов, а геометрия остаётся в модели. У `useNodeObserver` при размонтировании выполняется `unobserve`, а не очистка геометрии. Следствие: culling не устраняет холодный mount всех изначально неизмеренных нод. [Первичный render](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/graph.ts), [NodeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx), [observer](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/useNodeObserver.ts), [общий ResizeObserver](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/container/NodeRenderer/useResizeObserver.ts).

В `updateNodeInternals` есть существенная защита: замер применяется только при ненулевых `width` **и** `height`; нулевой DOM-замер не затирает сохранённую геометрию. Это условие, а не специальное распознавание `display: none`. Альтернатива начальному DOM-замеру — передать размеры и геометрию handles заранее: React Flow документирует это для SSR. Одних размеров недостаточно, если нужны координаты произвольных handles. [Условие обновления](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/store.ts), [SSR: размеры и handles](https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration).

**Vue Flow действует сходно:** ноды без известного размера проходят viewport-фильтр; wrapper до инициализации имеет `visibility: hidden`; общий observer вызывает `updateNodeDimensions`. Размеры и handle bounds записываются в graph node только при двух ненулевых измерениях. Нулевая площадь также проходит геометрическую проверку, поэтому формулировка «исключение только для null-размера» была бы неполной. [Фильтр](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/utils/graph.ts), [wrapper](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/components/Nodes/NodeWrapper.ts), [observer](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/container/NodeRenderer/NodeRenderer.vue), [замер](https://github.com/bcakmakoglu/vue-flow/blob/17953c329db2d5dc5f5097370cbf5e1173bab520/packages/core/src/store/actions.ts).

**У tldraw иной контракт геометрии:** `ShapeUtil.getGeometry(shape)` предоставляет геометрию отдельно от `component(shape)`; viewport-проверка использует индекс bounds. Поэтому общий culling-путь не является схемой «смонтировать все и определить размеры каждого DOM». Offscreen containers остаются с `display: none`; `canCull(shape)=false` исключает shape из отсечения. Для custom shape, которому необходим измеряемый DOM, это доступная точка отключения culling; универсального автоматического первого DOM-замера в проверенном пути нет. [ShapeUtil](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/editor/shapes/ShapeUtil.ts), [canCull](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/editor/derivations/notVisibleShapes.ts), [CSS-контроллер](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/hooks/useShapeCulling.tsx).

**Исключения для взаимодействий различаются.** В проверенных viewport-фильтрах React Flow и Vue Flow явно сохраняется `node.dragging`; отдельных условий `selected`, `resizing`, DOM focus или editing там нет. React Flow дополнительно умеет перемещать viewport при keyboard focus, но это отдельный механизм, а не исключение focused-ноды из culling. tldraw исключает **все selected shapes** и **editing shape**; отдельных проверок dragging/resizing/focus в `getCulledShapes` нет. Не следует приписывать библиотекам более широкие гарантии, чем эти условия. [React/Vue фильтры выше](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/graph.ts), [React focus](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx), [tldraw exceptions](https://github.com/tldraw/tldraw/blob/e8f61acedcbf2dc69693ea1e1f612a7f635fb4b5/packages/editor/src/lib/editor/Editor.ts).
