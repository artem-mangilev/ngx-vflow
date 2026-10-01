# 06. Dev-предупреждения для тихих поломок headless-презентаций

Status: ready-for-agent
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
