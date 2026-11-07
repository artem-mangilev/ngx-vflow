# 06. `@vflow/layout`: адаптеры dagre, elk, d3-force

Status: resolved
Type: task
Blocked by: 05

Спецификация: [spec.md](../spec.md), «Адаптеры». Источники: `DagreLayoutDirective` (Studio), `layout-flow.ts` в mermaid-clone (dagre с `minlen`/`width` для лейблов), cookbook `force`.

## Что сделать

- Secondary entry points: `libs/layout/dagre/ng-package.json`, `libs/layout/elk/ng-package.json`, `libs/layout/d3-force/ng-package.json` (+ `src/public-api.ts` каждому). В `libs/layout/package.json`: `peerDependencies` `@dagrejs/dagre`, `elkjs`, `d3-force` с `peerDependenciesMeta.optional: true`; в корневой `package.json` — devDependencies для сборки и docs (`@dagrejs/dagre` ещё не установлен; `elkjs` и `d3-force` есть).
- `dagreLayout(options)`: `rankdir`, `nodesep`, `ranksep`, `align`, `ranker`, `marginx/y`; центр dagre → левый верх; `parentId` → `setParent` (compound graph); результат во flow space.
- `elkLayout(options)`: `layoutOptions` как есть; `LayoutGraph` → ELK graph с `children` по `parentId`; ELK считает в worker (`elkjs/lib/elk.bundled.js` в main thread как fallback; решить, как поставлять worker без настройки бандлера у потребителя — вероятно, bundled в main thread по умолчанию, `{ worker: true }` опция); абсолютные позиции из вложенных `x/y`.
- `forceLayout(options)`: Observable; `tick` → `LayoutResult`; `alphaDecay`/`distance`/`strength`; сим-ноды с `x/y` копиями, без прокси в `point` (это делает хост). Остановка по `unsubscribe`.
- Проверить, что `@vflow/layout` без импорта `/elk` не тянет `elkjs` в бандл docs (анализ `stats.json` или `source-map-explorer`).

## Docs (демо-компоненты здесь, страницы в 07)

- `Packages → Layout`: три демо (dagre, elk, force), переключатель направления, `animate`.
- Cookbook `expand-collapse` — рецепт поверх `@vflow/layout/dagre` с `getVisibleNodes()` в коде демо (не в пакете).
- Cookbook `force` и `vizdom-layout` — переписать на `VxLayout` (vizdom — инлайн-алгоритм, wasm как сейчас).

## Тесты

- Unit: каждый адаптер даёт позиции для простого графа; dagre `rankdir: 'LR'` располагает target правее source; ELK compound: ребёнок внутри родителя; force: несколько `tick`, `unsubscribe` останавливает симуляцию.

## Comments

2026-11-07, сделано:

- Secondary entry points `libs/layout/{dagre,elk,d3-force}` (по `ng-package.json` с `entryFile`); ng-packagr сам добавляет `exports` `./dagre`, `./elk`, `./d3-force` и резолвит `@vflow/layout` из вторичных entry в собранный primary — дополнительных `paths` не понадобилось. Алиасы для исходников в корневом tsconfig и для dist в hybrid. Peers `@dagrejs/dagre ^3`, `elkjs ^0.9`, `d3-force ^3` с `peerDependenciesMeta.optional`; devDependencies `@dagrejs/dagre@^3.1.3` и `elkjs@^0.9.3` добавлены в корень (elkjs был транзитивным). В fesm главного entry движков нет — импортируются только из своих entry.
- `LayoutResult.sizes?` добавлен к контракту: dagre (compound) и ELK сами задают размер родителям; хост пишет их в `width`/`height` нод с явными сигналами.
- `dagreLayout(options)`: `compound: true`, `setParent` по `parentId`, центры → левый верх, петли и рёбра на отсутствующие ноды пропускаются. `elkLayout({ layoutOptions })`: `elkjs/lib/elk.bundled.js` в главном потоке (ESM-импорт типизирован через `elk.bundled.d.ts`), дефолты `layered` + `INCLUDE_CHILDREN` + padding, дерево children по `parentId`, относительные координаты ELK складываются во flow space. `forceLayout(options)`: Observable над `forceSimulation` (link/charge/center/collide), центры нод, `tick` → значение, `end` → complete, unsubscribe → `stop()`; вложенность не учитывается.
- Spec `adapters.spec.ts` (3): dagre LR/TB и размеры родителей, ELK вложенность в абсолютных координатах, force тики/завершение. Итого в пакете 10 browser + 4 node-dom.
- Docs `Packages → Layout` (`/packages/layout`): dagre с переключением направления и анимацией, ELK с выбором алгоритма (layered/mrtree/stress), force со слайдером; раздел «свой алгоритм». Cookbook: `expand-collapse` переписан на `@vflow/layout/dagre` + `getVisibleNodes()` в демо, платный iframe удалён; `force` — на `@vflow/layout/d3-force`; `vizdom-layout` — `LayoutAlgorithm`, ждущий wasm, перестроение по смене набора нод.
- e2e `layout.spec.ts`: направления dagre и вложенность; позиции читаются из `transform` ноды (flow space), потому что `fitView` после лейаута меняет масштаб. Тот же приём применён к `auto-size.spec.ts` (ширины нормируются по ширине ноды-эталона): при трёх параллельных воркерах экранные координаты плавали.
- Release dry-run: пять пакетов, 3.0.0.

2026-11-07, по замечаниям пользователя: страницы Cookbook `expand-collapse` и `vizdom-layout` удалены целиком вместе с зависимостью `@vizdom/vizdom-ts-web` и копированием wasm в docs. `elkLayout` получил типизированный фасад (`algorithm`, `direction`, `nodeSpacing`, `layerSpacing`, `edgeNodeSpacing`, `padding`, `nodePlacement`, `edgeRouting`, `separateConnectedComponents`, `aspectRatio`), маппящийся на ключи ELK внутри; сырые `LayoutOptions` наружу не отдаются.

2026-11-07, drag в демо (замечание пользователя): в dagre/ELK демо ноды `draggable: false` — позиции принадлежат лейауту. Для force контракт получил второй аргумент `LayoutContext { drags: Observable<LayoutDragEvent> }` (хост шлёт start/move/end с текущими прямоугольниками нод); `forceLayout` фиксирует тянущуюся ноду через `fx/fy` и подогревает симуляцию `alphaTarget(0.3).restart()`, на `end` отпускает, как d3-drag. Force больше не завершает Observable (симуляция ждёт следующего drag), поэтому `vxLayoutEnd` для него не срабатывает — задокументировано. Демо force: ноды-шарики с `vHandle handleType="any" position="center"` на всей поверхности и `curve: 'straight'`, рёбра идут к центру.

2026-11-07: в layout-демо соединения отключены — нажатие на handle всегда классифицируется как соединение (`press-target.ts`), поэтому шарик force получил внутренний `vDragHandle` на всю поверхность и `[canStart]="false" [canAccept]="false"`; `docs-node` получил вход `connectable` (порты с `canStart`/`canAccept`), dagre/ELK демо передают `false`; порты cookbook force тоже закрыты.

2026-11-07, ядро вместо обходного пути: handle с `canStart` false больше не забирает нажатие — в `pressTarget` селектор handle исключает `[data-v-handle-can-start="false"]`, так что нажатие принадлежит ноде (drag) или панели (pan), как на теле ноды; `vDragHandle` из force-демо убран. Spec в `press-target.spec.ts`, строка в docs Custom handles.

2026-11-07, мерцание первого лейаута (замечание пользователя; ресерч: GoJS, Cytoscape, JointJS делают первый лейаут до первого кадра без анимации нод, ngx-graph прячет ноды opt-in флагом, React Flow оставляет приложению). В ядре появились ворота инициализации: `VFLOW_INITIALIZATION_GATE` (multi-токен, `VflowInitializationGate { ready: Signal<boolean> }`), который директива на элементе `vflow` предоставляет через `useExisting`; `FlowRenderingService` делит готовность на `measured` (размер и измерения, публичный `VflowComponent.measured`) и `flowInitialized` (`measured` и все ворота открыты). Ворота читаются лениво через `Injector.get(..., { self: true })` в `untracked`, чтобы не зациклить конструкторы. `vxLayout` — первые ворота: запуск по `measured`, `ready = trigger !== 'auto' || placed`, первый запуск без анимации, `placed` ставится и при ошибке алгоритма (`finally`). Spec ядра `initialization-gate.spec.ts`, spec пакета на порядок «позиции → initialized» и на manual.

2026-11-07: `measured` убран с `VflowComponent` (решение пользователя): контракт ворот — один колбэк (решение пользователя: `prepare`/сигналы неочевидны): `onMeasured(ready: () => void)`, флоу вызывает его один раз, когда измерен (effect в `FlowRenderingService`, ворота считаются по счётчику `pendingGates`), ворота зовут `ready()`, когда граф можно показывать; повторные вызовы игнорируются. Публичная поверхность компонента не растёт; `multi` оставлен.

2026-11-07: `multi` убран окончательно (решение пользователя: обработка в ядре с счётчиком усложнилась) — один гейт на флоу, `injector.get(token, null, { self: true })`, `gateOpen` вместо `pendingGates`.
