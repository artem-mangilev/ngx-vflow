# 12. Выбор кликом: одинаковая модель для узла и ребра

Status: resolved
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

## Решение (2026-10-10)

1. **Узел выбирается кликом по обёртке по умолчанию, как ребро.** Слушатель клика живёт в `NodeComponent`. `[vSelectable]` / `VflowSelectableDirective` и спека удаляются; класс `v-selectable` на обёртке узла и проверка `.v-selectable` в `DefaultSelectionStrategy` уходят вместе с ними.
2. **Исключение по образцу `vNoDrag`: `[vNoSelect]`** (`data-v-no-select`). Клик, начатый внутри такого элемента, не выбирает ни узел, ни ребро. Проверка reconnect-ручки в `EdgeComponent.onClick` обобщается до этой же проверки.
3. **`Node.selectable` / `Edge.selectable` / `[nodesSelectable]` / `[edgesSelectable]`** остаются единственным значением слова — право на выбор. Клик по узлу с `selectable: false` не выбирает его и не снимает чужой выбор (как сейчас).
4. **`interactionWidth` остаётся полем данных и становится честным:** `EdgeComponent` рисует прозрачный штрих сам, по умолчанию, в своём хосте рядом с `v-focus-indicator`. `g[vEdgeInteraction]` / `hostDirectives: [VflowEdgeInteractionDirective]` переносит штрих внутрь презентации ради CSS `:hover`; хост тогда свой штрих не рисует. Без директивы ребро кликабельно.
5. **`elevate*OnSelect` поднимает при выборе**, а не при клике/`pointerdown`: эффект на переходе `selected()` в `true` в компоненте узла и ребра. Клавиатура и рамка тоже поднимают.
6. **`selectionMode: 'manual'` остаётся.** На странице selecting описывается отличие от `*Selectable=false`: manual — flow вообще не пишет `selected`; `selectable: false` — запрещает приобретение выбора, сброс остаётся.

Вне тикета: перетаскивание не выбирает узел (клик после сдвига глушится); отдельный вопрос.

Порядок: core → docs (selecting, migration) → зачистка `vSelectable` в apps/docs и apps/consumer. `vuiSelected` — тикет 19.

## Answer

Реализовано 2026-10-10 по решению выше (ветка 3.0, не закоммичено на момент записи).

- core: `VflowSelectableDirective` удалена; клик обрабатывают `NodeComponent.onClick` и `EdgeComponent.onClick` через общий `utils/no-select-target.ts`; `[vNoSelect]` в `gesture-exclusions.directive.ts`; подъём — эффект на `selected()` в обоих компонентах; хост ребра рисует `path.v-interactive-edge`, когда `EdgeModel.interactionAreasCount() === 0`; `DefaultSelectionStrategy` различает узел/ребро по `.v-node, .v-edge`.
- спеки: новая `components/vflow/click-selection.spec.ts`; `component-edge.spec`, `headless-warnings.spec`, `keyboard-navigation.spec`, `viewport-gestures.spec`, node-dom обновлены. `nx test ngx-vflow`, build, lint, docs-e2e (resizer, custom-edge-interactions, pointer-interactions, design-system, keyboard-shortcuts, accessibility) зелёные.
- docs: страницы selecting (в т.ч. раздел Manual selection), migration (раздел Selection by click, таблицы), unit-testing, custom-edges, default-edges, design-system overview, README ui; 36 `vSelectable` убраны из docs/consumer; демо selecting показывает `vNoSelect`.
- Тикет 19 разблокирован: `vuiSelected` может брать состояние из `NODE_REF`/`EDGE_REF`.
