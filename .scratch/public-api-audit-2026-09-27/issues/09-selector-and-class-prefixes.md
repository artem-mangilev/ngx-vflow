# 09. Единые префиксы селекторов и имён классов

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: 05, 08

Отчёт: 4.1, 4.2.

## Проблема

**Селекторы:**

- с префиксом: `vflow`, `[vflowHandle]`, `[vflowNoDrag|NoPan|NoWheel|NoKeyboard]`;
- без префикса: `[selectable]`, `[dragHandle]`, `g[edgeInteraction]`, `[resizable]`, `mini-map`, `node-toolbar`, `ng-template[node|edge|connection|marker|edgeLabel]`.

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

## Решения (2026-10-04)

- **Префикс селекторов core — `v`**, включая уже существующие: `[vHandle]` (exportAs `vHandle`), `[vNoDrag|vNoPan|vNoWheel|vNoKeyboard]`, `[vSelectable]`, `[vDragHandle]`, `g[vEdgeInteraction]`, `[vResizable]` (input `vResizable`). Элемент `<vflow>` не меняется.
- **Элементы:** `<v-minimap>`, `<v-node-toolbar>`.
- **Шаблоны:** `ng-template[vNode|vEdge|vConnection|vMarker]`, `*vEdgeLabel` (input `vEdgeLabelOrient`).
- **Классы core:** `Vflow*Directive`/`Vflow*Component` для всех публичных классов, включая template-директивы (`VflowNodeTemplateDirective`) и моки `ngx-vflow/testing` (`VflowSelectableMockDirective`).
- **Минимапа:** `Minimap` одним словом (`VflowMinimapComponent`, `MinimapPosition`).
- **`@vflow/ui` — префикс `vui`:** селекторы `[vuiNode]`, `<vui-controls>`, классы и типы `Vui*`. Data-атрибуты остаются тикету 19.
- **`[selectable]`** переименовывается сейчас, не дожидаясь тикета 12.
- Без алиасов старых селекторов: 3.0, всё уходит в migration guide.
- **CSS и DOM тоже по префиксу пакета** (дополнено 2026-10-04): core `.v-*`, `--v-*`, `data-v-*`; ui `.vui-*`, `--vui-*`, `data-vui-*` (`data-tone` → `data-vui-tone` и т. д.). Внутренние классы core тоже: `.v-resize-control--handle|line|top…`, `.v-selection-box`, `.v-reconnect-handle`, `.v-interactive-edge`, `.v-focus-indicator`, `.v-edge-label-wrapper`, `.v-selectable`, `.v-node-wrapper`, `.v-magnet`.

## Comments

- 2026-10-04: реализовано. Решение записано в ADR-0008 (заменяет часть ADR-0001 про сохранение имени `[resizable]`). Migration guide: раздел «Selector and class prefixes». Переименованы core, `ngx-vflow/testing`, `@vflow/ui` и `@vflow/ui/bpmn` (`VflowUi` → `Vui`, `VflowBpmn` → `VuiBpmn`), docs, consumer, e2e. Inputs, совпадающие с селектором, переименованы вместе с ним: `vResizable`, `vEdgeLabel`/`vEdgeLabelOrient`, `vMarker`. `apps/docs/src/assets/sitemap.xml` не трогал: он уже устарел и генерируется.
