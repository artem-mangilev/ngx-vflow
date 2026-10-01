# 03. Модель размера узла: намерение и измеренный прямоугольник

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.3. Пути — от `libs/ngx-vflow/src/lib/vflow/`. Меняет D1 и D4 спеки `.scratch/resizer-size-model-2026-09-13/spec.md` (см. там D6).

## Проблема

В 3.0 узел без `width`/`height` работает в режиме `auto`. Измеренный размер пишется во внутренний сигнал модели (`models/node.model.ts:101-103`, `directives/node-resize-controller.directive.ts:45-46`); в `Node` приложения его нет.

- `getNodesBounds()` читает `node.width?.() ?? 0` (`utils/graph.ts:83-84`). Проба: два узла 200×100 в `(0,0)` и `(400,0)` → `{x:0, y:0, width:400, height:0}`.
- Вне презентации измеренный размер не получить. `getNode()` отдаёт объект приложения, а `NodeRef.width`/`height` доступны только внутри шаблона или компонента узла. Остаётся собирать `(nodesChanges.size)`.
- Внутри библиотеки верная реализация уже есть: `getNodesFlowBounds` по моделям (`utils/nodes.ts`), ею пользуется `fitView`.
- Кто пишет размер, непредсказуемо. `NodeModel` подменяет свои `width`/`height` сигналами приложения (`models/node.model.ts:219-225`), поэтому замер перезаписывает сигнал приложения, если он задан, и пишет во внутренний, если нет.
- Задан только `width` или только `height` → режим остаётся `auto`, значение в DOM не попадает и перезаписывается замером.

Главные сценарии — layout (dagre/elk), выравнивание, «вписать выделенное».

## Исследование (2026-10-01)

Проверено по исходникам и документации: React Flow 12, Svelte Flow, Vue Flow, ng-diagram, Foblex Flow, X6, JointJS, @joint/react, GoJS, tldraw, Rete v2, maxGraph.

- **Строгий размер из данных** есть у всех: inline `width`/`height`, бокс не растёт под контент.
- **«Начальное значение, потом по вёрстке»** как режим не делает никто. `initialWidth`/`initialHeight` в React Flow — подсказка до первого замера для SSR, в `width` не превращается.
- **Замер в те же поля** — ng-diagram, @joint/react, maxGraph. У всех это требует отдельного флага (`autoSize`, `useModelGeometry`), заданное значение теряется; в @joint/react замер перетирает ресайз. React Flow ушёл от этой модели в v12.
- **Замер отдельно от намерения** — React Flow 12 / Svelte Flow (`measured`), Vue Flow (`dimensions`), Foblex (`measuredSize` через API), GoJS (`actualBounds`), tldraw (`growY`).
- **Первый ресайз авто-узла** делает его фиксированным в React Flow, Svelte Flow, Foblex, GoJS, ng-diagram, tldraw; одноосевой контрол в React Flow пишет только свою ось (`setAttributes: 'width' | 'height'`).
- Известные боли модели React Flow: программная смена высоты не работает после закрепления ресайзером (xyflow/xyflow#4739), узел нулевого размера не считается измеренным (xyflow/xyflow#5215).

## Решения (пользователь, 2026-10-01)

### R1. Два режима, по каждой оси отдельно

- `Node.width` / `Node.height` — **намерение приложения**. Ось с заданным сигналом — `explicit`: библиотека пишет значение inline, бокс по этой оси строго равен ему, контент больше размера вылезает или обрезается CSS приложения. Ось без сигнала — `auto`: размер следует вёрстке.
- Оси независимы: `width` без `height` даёт строгую ширину и высоту по контенту.
- Режимов «начальное значение» и «замер пишется в `width`/`height`» нет.

### R2. В сигналы приложения пишет только жест ресайзера

- Замер (`nodeResizeController`) в `rawNode.width`/`height` не пишет никогда.
- Ресайзер пишет в сигнал приложения по той оси, которую меняет контрол. Если сигнала в `Node` нет, значение хранится во внутреннем сигнале модели, и ось становится `explicit` (прежний `resizedExplicitly`, теперь по осям). Горизонтальный контрол не трогает высоту, вертикальный — ширину.
- Сверка после конца жеста (D4 спеки ресайзера) обновляет только измеренный размер. Если CSS `min/max` зажал бокс, намерение и замер расходятся; геометрия идёт по замеру.

### R3. Измеренный размер — отдельное read-only значение

- `NodeModel.width`/`height` всегда означают отрисованный бокс и больше не подменяются сигналами приложения. Ими пользуются рёбра, хендлы, minimap, `fitView`, контекст шаблона (`NodeRef.width`/`height`).
- В объекте `Node` измеренного размера нет.

### R4. Наружу — методы на `VflowComponent`

- `getNodeRect(id: string): Rect | undefined` — flow space, отрисованный размер; `undefined` для неизвестного id и для узла, который ещё не измерен.
- `getNodesBounds(ids?: string[]): Rect` через `getNodesFlowBounds`; без аргумента — все узлы. Неизмеренные узлы пропускаются.
- `getNodeRects()` не добавляем: layout обходит id через `getNodeRect`.
- Standalone `getNodesBounds(nodes, { nodeLookup })` (`utils/graph.ts:65-90`) удаляется: замер ему недоступен.

### R5. `nodesChanges.size`

`mode` становится по-осевым: `mode: { width: NodeSizeMode; height: NodeSizeMode }`. Сохранять имеет смысл только оси `explicit`.

## Сделать

- `models/node.model.ts`: убрать подмену `width`/`height`; `sizeMode` → `widthMode`/`heightMode`; внутренние сигналы размера от ресайзера по осям.
- `components/node/node.component.ts` + `.html`, `public-components/resizable/resizable.component.ts`: inline размер по каждой оси отдельно; `box-sizing: border-box`, если хотя бы одна ось `explicit`.
- `public-components/resizable/node-resize-control.component.ts`: запись по осям контрола в намерение и в отрисованный размер; сверка не пишет в намерение.
- `directives/node-resize-controller.directive.ts`: пишет только отрисованный размер. Программная смена сигнала приложения доходит до модели через inline-стиль и ResizeObserver.
- `services/node-changes.service.ts`, `types/node-change.type.ts`: по-осевой `mode`.
- `components/vflow/vflow.component.ts`, мок `VflowMockComponent`: `getNodeRect`, `getNodesBounds`.
- `utils/graph.ts`, публичный barrel: удалить standalone `getNodesBounds`.
- `interfaces/node.interface.ts`: JSDoc `width`/`height`.
- `CONTEXT.md`: термин Node size mode — по осям.
- Docs: `utilities/graph-utilities/index.md`, страница ресайзера, пример layout.
- spec:
  - `auto`-узел 200×100 → `getNodeRect` равен `{x, y, width: 200, height: 100}`, сигналов размера в `Node` не появилось;
  - вложенный узел — в flow space;
  - `width: 200` без `height` → inline только ширина, высота по контенту, `mode` равен `{width: 'explicit', height: 'auto'}`;
  - explicit-узел с контентом больше размера → `getNodeRect` равен заданному размеру, сигнал приложения не изменён;
  - explicit-узел, зажатый CSS `min-width` → сигнал приложения не изменён, `getNodeRect` отдаёт фактический бокс;
  - ресайз угловым контролом `auto`-узла → обе оси `explicit`; горизонтальным — только ширина;
  - ресайз узла с сигналами приложения → значение записано в них;
  - программное `node.width.set()` после ресайза меняет бокс;
  - `getNodesBounds()` двух `auto`-узлов 200×100 в `(0,0)` и `(400,0)` → `{x:0, y:0, width:600, height:100}`.
- `apps/docs-e2e/resizer.spec.ts` остаётся зелёным.

## Comments

- 2026-10-01: исследование библиотек и решения R1–R5 согласованы с пользователем: два режима, по-осевой берём в 3.0, наружу только методы на `VflowComponent`.
- 2026-10-01: реализовано (не закоммичено).
  - `NodeModel.width`/`height` — `linkedSignal` от `explicitWidth`/`explicitHeight`: отрисованный размер сбрасывается на заданный при его изменении и уточняется замером, так что программный `node.width.set()` сразу двигает рёбра, не дожидаясь ResizeObserver.
  - Ресайзер пишет через `NodeModel.setExplicitSize`. Ось записывается, если контрол её ведёт (угол — обе, сторона — одну, `resizeDirection` сужает) или если её значение изменилось (`keepAspectRatio`).
  - `getNodeRect` и `getNodesBounds` смотрят на `hasMeasurement` — признак первого замера, который не сбрасывается при remount и culling. `getNodesBounds` берёт все сущности, включая отсечённые culling'ом: они сохраняют геометрию.
  - Известная особенность: `box-sizing: border-box` ставится на элемент, если явная хотя бы одна ось. После этого CSS `min/max` `auto`-оси тоже считаются от border box. Отражено в документации ресайзера.
  - Проверка: unit 387/388 (единственный провал — `stacking-context.spec.ts`, он падает и на базовом коммите и проходит отдельно), docs e2e 48/48, lint чистый. `nx build ngx-vflow` падает на NG3001 `ViewportCullingDirective`, как и на `origin/3.0`.
