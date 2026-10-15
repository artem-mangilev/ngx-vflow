# 14. Graph operations стыкуются с событиями

Status: resolved
Type: task
Priority: P2 (ломающее — дешевле до 3.0)
Blocked by: —

Отчёт: 2.5 (`addEdges`), 3.8, 4.6, 4.7. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

Сигнатуры в `utils/graph-operations.ts`:

| Хелпер                                | Второй аргумент | Результат                                            |
| ------------------------------------- | --------------- | ---------------------------------------------------- |
| `addNodes(nodes, existing)`           | массив          | массив                                               |
| `removeNodes(ids, {nodes, edges})`    | объект          | `{nodes, edges, removedNodes, removedEdges}`         |
| `reparentNodes(ops, nodes)`           | массив          | массив; мутирует сигналы и может дописать `parentId` |
| `addEdges(edges, {nodes, edges})`     | объект          | массив                                               |
| `removeEdges(ids, edges)`             | массив          | массив                                               |
| `reconnectEdges(ops, {nodes, edges})` | объект          | массив; заменяет объект ребра                        |

События не совпадают с входами хелперов:

- `(reconnect)` отдаёт `{ connection, oldEdge }`, а `reconnectEdges` ждёт `{ id, connection }`.
- `(deleteRequest)` требует двух вызовов: `removeNodes(nodeIds, { nodes, edges: removeEdges(edgeIds, edges) })` — 4 копии в docs.
- `(connect)` отдаёт `Connection` без id: `addEdges([{ id: crypto.randomUUID(), ...connection }], …)` — 6 копий.

Прочее:

- `addEdges` молча отбрасывает дубль соединения (`utils/graph-operations.ts:200`), хотя остальные отказы предупреждают.
- Жест соединения по умолчанию отклоняет self-connection (`models/connection.model.ts:11-17`), а `addEdges` его принимает.
- Структурные поля `Edge` — не сигналы. Поэтому reconnect пересоздаёт модель и view (`remove`+`add` с тем же id), а reparent их сохраняет.

## Решения

### Сигнатуры не унифицировать

Правило уже есть: **второй аргумент — что хелпер читает, результат — что пишет.** Единый возврат `{ nodes, edges }` ломает идиому `edges.update((edges) => addEdges([edge], { nodes, edges }))` (`apps/docs/.../pipeline/pipeline-demo.component.ts:313`, `.../erd-schema-mapping/entities-demo.component.ts:277`).

- Записать правило в JSDoc модуля и на странице `apps/docs/src/app/categories/utilities/graph-operations/index.md`.
- `reparentNodes` остаётся мутирующим (структура узла живёт в сигналах).

### `removeNodes` → `removeElements`

```ts
removeElements(
  { nodeIds?, edgeIds? }: { nodeIds?: readonly string[]; edgeIds?: readonly string[] },
  { nodes, edges },
): { nodes; edges; removedNodes; removedEdges }
```

- Форма первого аргумента совпадает с `DeleteRequest`: `removeElements(request, graph)`.
- `removedEdges` = явно указанные + инцидентные удалённым узлам, без повторов. Неоднозначные/отсутствующие id — как сейчас у `removeNodes`/`removeEdges`.
- `removeNodes` и `RemoveNodesResult` удалить (переименовать в `RemoveElementsResult`). `removeEdges(ids, edges)` остаётся для `.update`.
- Заменить 4 копии `removeNodes(…, { edges: removeEdges(…) })` в docs; JSDoc `(deleteRequest)` (`components/vflow/vflow.component.ts:532`).

### Reconnect: событие подходит к операции

- `ReconnectEvent.oldEdge` → `edge`, как в `ReconnectStartEvent`/`ReconnectEndEvent`. Места: `directives/connection-controller.directive.ts`, `services/flow-status.service.ts`, `directives/root-svg-context.directive.ts`, specs, docs.
- `EdgeReconnectOperation` = `{ edge: { id: string }; connection: Connection }`. Вызов: `reconnectEdges([event], graph)`.
- Migration guide: оба переименования.

### Connect: без нового хелпера

`addConnection` не добавлять. id — политика приложения (серверные id, префиксы). id из кортежа соединения сталкивается со старым id после reconnect; `crypto.randomUUID` недоступен вне secure context. Строка `{ id: …, ...connection }` остаётся.

### Дубли и self-connection — политика жеста, не целостность

Хелперы предупреждают только о нарушениях целостности (нет id, неоднозначный id, плохие концы, циклы родителей). Дубль и петля — валидная модель.

- `addEdges`: убрать фильтр дублей (`sameConnection` в `addEdges`); self-connection принимать, как сейчас. `reconnectEdges` дубли тоже не проверяет (no-op на тот же кортеж остаётся).
- `ConnectionSettings.allowDuplicateConnections?: boolean`, по умолчанию `false`, рядом с `allowSelfConnections`. Встроенный валидатор в `models/connection.model.ts` отклоняет соединение, чей кортеж (с `?? ''` у handle) уже есть среди рёбер. Нужен доступ к текущим рёбрам: валидатор вызывается в `connection-controller.directive.ts:50,58,180`.
- При reconnect собственное переподключаемое ребро не считается дублем.
- Пользователь видит невалидность при наведении, а не после отпускания.
- Docs: `edges/connections/index.md` — описать обе настройки.

### Концы ребра — не сигналы

`source`/`target`/`sourceHandle`/`targetHandle` остаются полями: `Edge extends Connection`, фильтры `e.source === id` в приложениях, ui и bpmn. Reconnect пересоздаёт модель и view — это приемлемо: жест указателем, фокуса нет, сигналы ребра переносятся через spread. Записать в docs graph-operations: структура узла в сигналах (узел дорог), ребро неизменяемо (ребро дёшево).

Если сохранение view понадобится — `trackEdges` по `edge.id` (`components/vflow/vflow.component.ts:710`), без изменения API. Не в этом тикете.

## Проверки

- `graph-operations.spec.ts`: `removeElements` (только узлы, только рёбра, оба, повторы в `removedEdges`), `addEdges` принимает дубль без warn, `reconnectEdges([event])`.
- Spec жеста: дубль отклоняется по умолчанию, проходит с `allowDuplicateConnections: true`; reconnect на тот же кортеж валиден.
- `connection-outputs.spec.ts`: `(reconnect)` отдаёт `edge`.
- Typecheck docs, consumer, ui, bpmn; e2e connections.

## Answer

Реализовано 2026-10-15 по разделу «Решения».

- **`removeElements`** (`utils/graph-operations.ts`): заменяет `removeNodes`; рёбра из `edgeIds` удаляются через `removeEdges` (те же warn на неоднозначный id), `removedEdges` — явные и инцидентные, каждое один раз, в исходном порядке. `RemoveNodesResult` → `RemoveElementsResult`, новый тип `RemoveElementsRequest`.
- **Reconnect:** `ReconnectEvent = { edge, connection }`; `EdgeReconnectOperation = { edge: { id }, connection }`. Внутренние статусы жеста оставили поле `oldEdge` — оно не публичное.
- **Дубли:** `addEdges` больше не фильтрует кортежи. `ConnectionSettings.allowDuplicateConnections` (default `false`); проверка в `ConnectionControllerDirective.isValid` — при наведении и при отпускании, до валидаторов, так что `validator` приложения видит только недубли. Переподключаемое ребро не считается дублем самого себя. `sameConnection` вынесен в `utils/same-connection.ts`.
- **Концы ребра:** без изменений, объяснение на странице graph-operations.

Документация: graph-operations (правило «читает/пишет», `removeElements`, reconnect, почему ребро неизменяемо), connections (встроенные правила жеста, `allowSelfConnections`, `allowDuplicateConnections`, `reconnectEdges([event])`), accessibility, delete-selected, migration («Graph operations take the event payloads»). Демо: accessibility, keyboard-shortcuts, delete-selected, reconnection.

Тесты: `graph-operations.spec.ts` (removeElements с рёбрами, addEdges с дублем и петлёй без warn, `reconnectEdges([event])`), `connection-outputs.spec.ts` (дубль отклонён / разрешён, reconnect на свой handle). Две фикстуры уже содержали соединяемое ребро: `audit-regressions.spec.ts` включает `allowDuplicateConnections`, `node-dom/flow.spec.ts` очищает рёбра перед жестом.
