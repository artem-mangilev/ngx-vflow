# 07. Каналы уведомлений об изменениях

Status: needs-triage
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.6, 3.1, 4.4. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

Изменения узлов доступны тремя путями (`components/vflow/vflow.component.ts:529-565`, `directives/changes-controller.directive.ts`):

- output `(nodesChanges)` и пять подканалов `(nodesChanges.position|size|add|remove|select)`;
- сигнал `nodesChange`;
- observable `nodesChange$`.

У рёбер так же, подканалы — `detached|add|remove|select`.

Детали:

- **Сигнал теряет события.** Позиции эмитятся по пачке на узел (`services/node-changes.service.ts:16-29`), а сигнал хранит только последнюю. Проба: две позиции в одном тике → observable дал 2 пачки, сигнал — 1. В `apps` и `libs` сигналы не используются.
- **Подканалы — это `filter(type)`** (`directives/changes-controller.directive.ts:76-88`); ими пользуются 9 файлов docs.
- **У viewport и готовности, наоборот, нет output:** есть только `viewport`/`viewportChange$` и `initialized`/`initialized$`.

## Решить

- **Сигналы `nodesChange`/`edgesChange`:** удалить (рекомендую безусловно).
- **Подканалы:**
  - оставить — они дёшевы и используются;
  - или удалить в пользу `(nodesChanges)` и фильтра у потребителя.
- **Observable `nodesChange$`/`edgesChange$`:**
  - оставить для программной подписки: через ссылку на `VflowComponent` outputs host directive недоступны;
  - или заменить на `outputToObservable`.
- **Output `(viewportChange)`:** нужен ли (связано с 15, `(initialized)`).

## Сделать после решения

- `components/vflow/vflow.component.ts`, `directives/changes-controller.directive.ts`; мок (host-directive outputs у мока отсутствуют — тикет 17).
- Docs: `apps/docs/src/app/categories/interactions/pages/handling-changes/index.md`, migration guide.
