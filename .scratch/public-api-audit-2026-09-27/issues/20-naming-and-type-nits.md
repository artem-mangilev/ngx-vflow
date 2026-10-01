# 20. Мелкие расхождения имён и типов

Status: needs-triage
Type: task
Priority: P2 (ломающее — дешевле до 3.0)
Blocked by: —

Отчёт: 2.5, 3.6, 4.3, 4.8. Пути — от `libs/ngx-vflow/src/lib/vflow/`. По каждому пункту отдельно решить: переименовать или оставить.

- **Дефолты generic'ов:**
  - `Node<T = any>`, `NodeRef<T = any>`, `EdgeRef<T = any>`;
  - но `Edge<T = unknown>`, `getNode<T = unknown>`, `createNodes<T = unknown>`;
  - `getIntersectingNodes<T>` и `createEdges<T>` без дефолта.
- **Типы изменений:** `NodeSelectedChange`, но `EdgeSelectChange`; `NodePositionChange.point` плоско, `NodeSizeChange.size` вложенно (`types/node-change.type.ts`, `types/edge-change.type.ts`).
- **События жестов:**
  - середина названа то глаголом (`connect`, `nodeDrag`), то через `Change` (`resizeChange`);
  - payload resize без узла (`public-components/resizable/resizable.component.ts:73-76`);
  - drag сообщает только схваченный узел.
- **Нетипизированные события.** `componentNodeEvent`/`componentEdgeEvent` — `output<any>` с TODO (`components/vflow/vflow.component.ts:484-489`).
- **Идентичность результатов.** `getNodesAtPoint()` возвращает копии `{...node, nodeSpacePoint}`, а `getNode()` и `getIntersectingNodes()` — объекты приложения (`components/vflow/vflow.component.ts:646-669`). Проба: `=== node` → `false`.
- **`Background`.** У `dots` `size` — диаметр точки, `gap` — шаг; у `grid` `size` — шаг сетки (`types/background.type.ts`).
- **`vflowHandle`: два разных `auto`.** `position="auto"` — сторона, обращённая к другому концу; `layout="auto"` — библиотека позиционирует элемент (`types/handle-type.type.ts`).
- **Направление resize.** `[resizeDirection]` (`'horizontal' | 'vertical'`) против `ResizeParamsWithDirection.direction: number[]` (`public-components/resizable/resizer-types.ts`).
- **`getViewportForBounds`** принимает 6 позиционных аргументов: `bounds, width, height, minZoom, maxZoom, padding` (`utils/viewport.ts:9-16`).
- **Маркеры:**
  - `ConnectionSettings.marker` задаёт только конец, `Edge.markers` — `{start, end}`;
  - в контексте `connection` поле называется `marker`, у ребра — `markerStart`/`markerEnd`.
- **Координатные хелперы** (`utils/coordinates.ts`):
  - `getNodePositionInSpace(nodeId, spaceNodeId, nodes[])` перекрывается с `nodeSpaceToFlowPosition`/`flowToNodeSpacePosition(point, spaceNodeId, lookup)`;
  - standalone `clientToFlowPosition(point, { viewport, containerPosition })` и метод `vflow.clientToFlowPosition(point)` — одно имя, разные сигнатуры.
- **`lazyLoadTrigger: 'viewport'`** не действует на eager-классы компонентов, а шаблоны гейтят себя сами через `@defer (when ctx.shouldLoad())` (`models/node.model.ts:171-190`). Описать или выровнять.
