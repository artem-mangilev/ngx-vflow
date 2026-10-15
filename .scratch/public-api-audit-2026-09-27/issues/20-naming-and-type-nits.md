# 20. Мелкие расхождения имён и типов

Status: resolved
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

## Решения

Согласовано 2026-10-15.

- **Generic'и:** везде `T = unknown` — `Node`, `NodeWithDefaults`, `StaticNode`, `NodeRef`, `injectNode`, `Edge`, `EdgeWithDefaults`, `StaticEdge`, `EdgeRef`, `injectEdge`, методы чтения `vflow`. `WritableSignal` бивариантен по методам, поэтому `Edge<Foo>[]` присваивается `Edge[]`; `any` для вариантности не нужен.
- **Change-типы:** `EdgeSelectChange` → `EdgeSelectedChange`. `point`/`size` — оба объекты, не расхождение.
- **Resize:** `[resizeDirection]` → `[resizeAxis]`, `ResizeControlDirection` → `ResizeAxis`. `direction: number[]` → `direction: { x: -1 | 0 | 1; y: -1 | 0 | 1 }`, `ResizeParamsWithDirection` → `ResizeChangeParams`. Output `resizeChange` → `resize`. В payload всех трёх событий — `node`.
- **Drag:** `NodeDragEvent` получает `nodes` (все перемещаемые узлы) и `sourceEvent`.
- **Маркеры:** `ConnectionContext.marker` → `markerEnd`; `ConnectionSettings.marker` → `markerEnd`.
- **`getViewportForBounds(bounds, { width, height }, { minZoom, maxZoom, padding })`.**
- **`getNodesAtPoint`** возвращает `{ node, nodeSpacePoint }[]`, `node` — объект приложения.
- **`GridBackground.size`** → `gap`.
- **`getNodePositionInSpace`** удалить; `clientToFlowPosition` функция/метод — оставить, описать в доках.
- **`componentNodeEvent`/`componentEdgeEvent`:** `any` намеренный — комментарий вместо TODO.
- **`vflowHandle` `auto`:** оставить.
- **`lazyLoadTrigger`:** JSDoc — класс компонента не ленивый, триггер действует на фабрики и шаблоны.

## Answer

Реализовано 2026-10-15 по разделу «Решения», с двумя уточнениями.

- **Generic'и:** `unknown` у `Node`, `NodeWithDefaults`, `StaticNode`, `create*`, `injectNode`, `injectEdge`, `getIntersectingNodes`. `NodeRef`/`EdgeRef` оставлены с `T = any`: это контекст `let-ctx` шаблона, которому нельзя передать аргумент типа — с `unknown` сборка docs падала на каждом `ctx.data().…`. Причина записана в JSDoc.
- **Resize:** payload'ы — `ResizeEvent` (`resizeStart`/`resizeEnd`) и `ResizeChangeEvent` (`resize`), оба `ResizeParams` + `node`; `ResizeChangeParams.direction: { x: ResizeSign; y: ResizeSign }`, `shouldResize` получает `ResizeChangeParams`. Output `resize` подавляет `@angular-eslint/no-output-native` с комментарием: нативный `resize` есть только у `window`.
- **Drag:** `NodeDragEvent = { node, nodes, sourceEvent }`; статус жеста несёт `nodes` и `event` (`services/flow-status.service.ts`, `services/draggable.service.ts`).
- **`getNodesAtPoint`** → `NodeAtPoint<T>[]` (`interfaces/node-at-point.interface.ts`, публичный).
- **`getViewportForBounds(bounds, { width, height }, { minZoom, maxZoom, padding? })`**, `ViewportForBoundsOptions` публичный, `padding` по умолчанию `0`.
- Остальное — как в решениях: `EdgeSelectedChange`, `markerEnd` у `ConnectionSettings` и `ConnectionContext`, `GridBackground.gap`, `getNodePositionInSpace` удалён, JSDoc у `componentNodeEvent`/`componentEdgeEvent` и `lazyLoadTrigger`.

Документация: migration («Renamed fields and types», строка `toNodeSpace()`), geometry-utilities, resizer, markers, lazy-loading, drag-and-drop cookbook. Демо: drag-and-drop (типизированные данные узлов, `NodeAtPoint`), easy-connect, markers.

Тесты: `vflow.component.spec.ts` (`getNodesAtPoint` возвращает объекты приложения; drag отдаёт `nodes` и `sourceEvent`, drag выделения — оба узла), `resizable.component.spec.ts` (node и знаки `direction` в событиях resize), `coordinates.spec.ts`, `viewport.spec.ts`. Сборка 4 проектов, lint и `nx test` зелёные; в браузере docs-демо не проверялись.
