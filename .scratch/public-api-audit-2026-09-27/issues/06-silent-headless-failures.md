# 06. Dev-предупреждения для тихих поломок headless-презентаций

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 2.1, 2.2. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

- Ребро без `component` и без `ng-template[edge]` не рендерится, и предупреждения нет (`components/edge/edge.component.html:3-15`).
- `[selectable]` в презентации ребра ничего не делает: директива ищет только `NodeComponent` (`directives/selectable.directive.ts:17,42-44`).
- `NodeComponent.selectNode()` нигде не вызывается (`components/node/node.component.ts:194-204`).
- Ровно этот случай в `apps/consumer/src/app/core-app.component.ts:35-58`:
  - два ребра без edge-шаблона и без `(connect)`;
  - рёбра невидимы, handles не работают.
  - Приложение нужно для проверки бандлов (`apps/consumer/scripts/check-bundles.mjs`), но это единственный «чистый» пример core без `@vflow/ui`.

## Сделать

- **Ребро без шаблона:** в dev-режиме один `console.warn` на flow, если есть рёбра без `component`, а `ng-template[edge]` не объявлен. Формат как у существующих предупреждений (`[ngx-vflow] …`, `directives/template.directive.ts:80-82`).
- **`[selectable]` вне узла:** dev-warning.
- **`selectNode()`:** удалить.
- **Consumer-приложение:**
  - в `core-app.component.ts` добавить `ng-template[edge]` с `g[edgeInteraction]` и обработчик `(connect)` с `addEdges`;
  - проверить, что `check-bundles.mjs` проходит.
- **Handle без connection controller:** если тикет 05 решён не через host directive, добавить warn при `pointerdown` на handle без контроллера.

## Проверки

- spec: flow с ребром без шаблона → ровно один warn; с шаблоном → warn нет; вне dev-режима → warn нет.
- spec: `[selectable]` в edge-шаблоне → warn.

## Answer

- **Ребро без шаблона:** `VflowComponent` в dev-режиме пишет `[ngx-vflow] Edge "<id>" has no component and the flow declares no <ng-template edge>, so edges without a component do not render.` Флага «уже предупреждали» нет: эффект читает `computed` с id первого такого ребра, поэтому warn один, пока это ребро на месте, и повторяется, только если первым стало другое ребро.
- **`[selectable]` вне узла:** `SelectableDirective` в dev-режиме пишет warn в конструкторе, без дедупликации — по одному на каждый экземпляр директивы вне презентации узла. В тексте: директива там не действует, ребро выбирается кликом по своей презентации (hit area — `g[edgeInteraction]`).
- **`NodeComponent.selectNode()`** удалён вместе с инжектом `SelectionService`.
- **Consumer:** в `core-app.component.ts` добавлены `ng-template[edge]` с `g[edgeInteraction]` и `(connect)` с `addEdges`. `nx run consumer:check` проходит; в браузере рёбра видны, жест от handle к handle создаёт ребро, предупреждений в консоли нет. Для проверки добавлена конфигурация `consumer-core-only` в `.claude/launch.json`.
- **Handle без connection controller:** не нужен — тикет 05 решён через host directive.
- spec: `components/vflow/headless-warnings.spec.ts` — один warn на flow при нескольких рёбрах без component, нет warn с шаблоном, с component-рёбрами и вне dev-режима; `[selectable]` в edge-шаблоне → warn на каждое ребро, в node-шаблоне → нет.
- Побочный эффект: существующие spec'и, где рёбра намеренно без презентации, теперь печатают этот warn в лог karma (106 строк на полный прогон).
- **Флаги «уже предупреждали» убраны и в старых предупреждениях:** curve без `labelPoints` (`directives/template.directive.ts`) и маркер без формы (`components/defs/defs.component.ts`) читают `computed`; label в SVG-namespace (`components/edge-label/edge-label.component.ts`) — эффект и так перезапускается только при смене шаблона; handle без layout box (`models/handle.model.ts`) пишет warn при переходе `hasBox` из `true` в `false`. Следствие: warn повторяется, если условие ушло и вернулось; у маркеров при изменении набора типов без формы перечисляются все такие типы.
