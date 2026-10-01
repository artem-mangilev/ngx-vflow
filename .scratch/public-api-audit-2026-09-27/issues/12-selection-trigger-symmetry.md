# 12. Выбор кликом: одинаковая модель для узла и ребра

Status: needs-triage
Type: task
Priority: P2
Blocked by: —

Отчёт: 2.2, 2.3, 2.5 (`elevate*OnSelect`), 3.5. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

- **Триггеры разные.** Узел выбирается кликом, только если в презентации есть атрибут `selectable` (`directives/selectable.directive.ts`). Ребро — кликом по штриху `g[edgeInteraction]` или по хосту (`components/edge/edge.component.ts:38,90-97`).
- **`selectable` означает два понятия:** право на выбор (`Node.selectable`, `[nodesSelectable]`) и триггер клика.
- **`Edge.interactionWidth`** — свойство данных, но действует только при `edgeInteraction` в шаблоне (`interfaces/edge.interface.ts:34-40`, `utils/edge-interaction-area.ts:34`). Без директивы у ребра нет hit area.
- **`elevateNodesOnSelect`** поднимает узел на любой клик (`components/node/node.component.html:1`, `components/node/node.component.ts:188-192`), а ребро — на `pointerdown` (`components/edge/edge.component.ts:39`).
- **`[selectionMode]="'manual'"`** пересекается с `[nodesSelectable]`/`[edgesSelectable]="false"` (`services/selection.service.ts:69`, `strategies/manual-selection.strategy.ts`).
- **В `@vflow/ui`** каждый узел требует пару `selectable` + `[vflowSelected]="ctx.selected() || ctx.preselected()"` — 38 копий.

## Решить

- **Модель выбора кликом:**
  - узел выбирается кликом по обёртке по умолчанию, как ребро; исключения — атрибутом по образцу `vflowNoDrag`; `[selectable]` удалить;
  - или оставить opt-in, но назвать триггер отдельно от права (`vflowSelectOnClick`).
- **`interactionWidth`:** перенести в input `edgeInteraction` или честно описать зависимость от директивы.
- **`elevate*OnSelect`:** поднимать при выборе, как обещает имя, или переименовать в «on press». В любом случае одинаково для узла и ребра.
- **`selectionMode: 'manual'`:** оставить как «выбор полностью у приложения» и описать отличие от `*Selectable=false`, или удалить.

Связано: 09 (переименование `selectable`), 19 (`VflowSelected`).
