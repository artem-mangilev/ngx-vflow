# 02. `position: 'auto' | 'center'`, разрешение концов в ядре

Status: resolved
Type: task
Blocked by: 01

D2 из `spec.md`. `HandlePosition`; `HandleModel.endpoint(towards)`; для `auto`/`center` точка — центр ноды,
измерение без чтения бокса, без стилей и магнита. `EdgeModel` и `ConnectionComponent` через `endpoint`.
Спеки: handle.model (endpoint, без замера), edge.model (смешанное ребро порт → нода), handle.directive
(нода как handle: старт с тела, drag за заголовок, кандидат, без магнита, путь через середину стороны и центр).

Файлы: `types/handle-type.type.ts`, `models/handle.model.ts`, `models/edge.model.ts`,
`components/connection/connection.component.ts`, `components/node/node.component.html`,
`directives/handle.directive.ts`, `math/floating-edge-params.ts`.

## Answer

Сделано 2026-09-20 в одном проходе с остальными issue; проверки в отчёте сессии.
