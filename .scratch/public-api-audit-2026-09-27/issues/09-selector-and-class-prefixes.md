# 09. Единые префиксы селекторов и имён классов

Status: needs-triage
Type: task
Priority: P1 (до 3.0)
Blocked by: 05, 08

Отчёт: 4.1, 4.2.

## Проблема

**Селекторы:**

- с префиксом: `vflow`, `[vflowHandle]`, `[vflowNoDrag|NoPan|NoWheel|NoKeyboard]`;
- без префикса: `[selectable]`, `[dragHandle]`, `g[edgeInteraction]`, `[resizable]`, `[nodeResizeControl]`, `mini-map`, `node-toolbar`, `ng-template[node|edge|connection|marker|edgeLabel]`.

**Классы:**

- `VflowComponent`, `VflowHandleDirective`;
- против `SelectableDirective`, `DragHandleDirective`, `NoDragDirective` (селектор с префиксом, класс без), `MiniMapComponent`, `ResizableComponent`.

**Написание минимапы:** `MiniMapComponent`, `MiniMapPosition`, `mini-map` против `minimapLabel`, `MinimapCanvasDirective`, `.vflow-minimap`.

Короткие общие имена (`selectable`, `resizable`) рискуют столкнуться с другими библиотеками.

## Решить

- **Селекторы:** `[vflowSelectable]`, `[vflowDragHandle]`, `g[vflowEdgeInteraction]`, `[vflowResizable]`, `vflow-minimap`, `vflow-node-toolbar`. Input `resizable` переименовывается вместе с селектором.
- **Шаблоны `ng-template[node|edge|connection|marker]` и `*edgeLabel`:**
  - оставить — они читаются как слоты;
  - или перевести на `vflow*`. `@vflow/ui` уже занимает `[vflowNode]`, `[vflowEdge]`, `[vflowEdgeLabel]` (тикет 19).
- **Классы:** единая схема — `Vflow*Directive`/`Vflow*Component` или без суффиксов, как в `@vflow/ui` (`VflowButton`).
- **Минимапа:** `Minimap` одним словом везде.
- **`[selectable]`:** судьба зависит от тикета 12 — там может смениться сама модель выбора кликом. Если 12 решается позже, переименовать сейчас и не менять второй раз.

## Масштаб

Вхождения вне spec:

| Имя               | Вхождений | Файлов |
| ----------------- | --------- | ------ |
| `selectable`      | 72        | 34     |
| `resizable`       | 60        | 18     |
| `dragHandle`      | 37        | 12     |
| `edgeInteraction` | 33        | 21     |
| `<mini-map`       | 14        | 6      |
| `<node-toolbar`   | 10        | 5      |

Плюс моки `ngx-vflow/testing`, `@vflow/ui`, docs, migration guide, e2e (`apps/docs-e2e`).
