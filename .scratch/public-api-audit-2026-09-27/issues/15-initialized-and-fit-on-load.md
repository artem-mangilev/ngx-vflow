# 15. `(initialized)` и fit-on-load без boilerplate

Status: needs-triage
Type: task
Priority: P2
Blocked by: 01

Отчёт: 3.8, 4.4.

## Проблема

Вписать граф при старте — 8 копий в демо:

```ts
effect(() => {
  if (flow.initialized()) untracked(() => flow.fitView());
});
```

- **`untracked` обязателен.** `fitView` читает сигналы узлов, размера flow и лимитов zoom (`libs/ngx-vflow/src/lib/vflow/services/viewport.service.ts:47-61`). Без `untracked` effect перезапускался бы на каждое изменение графа.
- **Нет output `(initialized)`;** сигнал `initialized` не документирован. `initialized$` и `viewportChange$` удаляет тикет 07.
- **Демо force-layout** ждёт `setTimeout` перед `fitView` (`apps/docs/src/app/categories/cookbook/force/demo/force-layout-demo.component.ts:130`).

Файлы с шаблоном fit-on-load (`apps/docs/src/app/categories/`):

- `introduction/pages/overview/demo/all-features-demo.component.ts`;
- `performance/pages/lazy-loading/demo/lazy-loading-demo.component.ts`;
- `design-system/`: `relationships-map`, `pipeline`, `erd-schema-mapping` (×2), `workflow`, `bpmn`.

## Решить

- **`untracked` внутри методов:** `fitView` и остальные императивные методы читают сигналы `untracked` сами, и вызов из effect становится безопасным. Рекомендую безусловно.
- **Output `(initialized)`** — одноразовый.
- **Output `(viewportChangeEnd)`** — конец жеста или анимации viewport, для сохранения viewport; сигнал `viewport` этого момента не выражает. Внутри уже есть `viewportChangeEnd$` (`libs/ngx-vflow/src/lib/vflow/services/viewport.service.ts:38`). `(viewportChange)` не вводится — решение тикета 07.
- **Декларативный `[fitViewOnInit]="true | FitViewOptions"`.**
- **Force-layout:** разобрать, зачем демо нужен `setTimeout`.
