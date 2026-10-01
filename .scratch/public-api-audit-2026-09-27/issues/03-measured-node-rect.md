# 03. Измеренный прямоугольник узла доступен приложению

Status: needs-triage
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.3. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

В 3.0 узел без `width`/`height` работает в режиме `auto`. Измеренный размер пишется во внутренний сигнал модели (`models/node.model.ts:101-103`, `directives/node-resize-controller.directive.ts:45-46`); в `Node` приложения его нет.

- `getNodesBounds()` читает `node.width?.() ?? 0` (`utils/graph.ts:83-84`). Проба: два узла 200×100 в `(0,0)` и `(400,0)` → `{x:0, y:0, width:400, height:0}`.
- Вне презентации измеренный размер не получить. `getNode()` отдаёт объект приложения, а `NodeRef.width`/`height` доступны только внутри шаблона или компонента узла. Остаётся собирать `(nodesChanges.size)`.
- Внутри библиотеки верная реализация уже есть: `getNodesFlowBounds` по моделям (`utils/nodes.ts`), ею пользуется `fitView`.

Главные сценарии — layout (dagre/elk), выравнивание, «вписать выделенное».

## Решить

- **Методы на `VflowComponent` (рекомендую):**
  - `getNodeRect(id): Rect | undefined` — flow space, измеренный или explicit-размер;
  - `getNodesBounds(ids?: string[]): Rect` через `getNodesFlowBounds`.
- **Standalone `getNodesBounds(nodes, { nodeLookup })` (`utils/graph.ts:65-90`):** удалить или оставить для данных приложения с dev-warning, когда у узла нет размера. Используется в `apps/docs/src/app/categories/utilities/graph-utilities/index.md`.
- **Массовая выдача:** нужен ли `getNodeRects()` для layout всех узлов.

## Сделать после решения

- `components/vflow/vflow.component.ts`, мок `VflowMockComponent`.
- Docs: `utilities/graph-utilities/index.md`, пример layout.
- spec:
  - `auto`-узел 200×100 → `getNodeRect` равен `{x, y, width: 200, height: 100}`;
  - вложенный узел — в flow space;
  - explicit-узел после resize — новый размер.
