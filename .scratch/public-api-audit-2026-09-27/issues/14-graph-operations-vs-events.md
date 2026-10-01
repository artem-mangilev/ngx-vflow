# 14. Graph operations стыкуются с событиями

Status: needs-triage
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

## Решить

- **Сигнатуры:** единая форма `(items, { nodes, edges })` → `{ nodes, edges }` для всех шести. Рекомендую: хелперы, затрагивающие обе коллекции, уже так устроены.
- **Payload событий напрямую:**
  - `reconnectEdges([event])` или `applyReconnect(event, graph)`;
  - `applyDeleteRequest(request, graph)`;
  - `addConnection(connection, graph, { id? })`.
- **`addEdges`:** warn на дубль или опция `allowDuplicates`.
- **Edge endpoints:** делать ли `source`/`target`/`sourceHandle`/`targetHandle` сигналами, чтобы reconnect сохранял view.
