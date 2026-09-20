# 03. Удаление `ConnectionSettings.type` и `Edge.floating`

Status: resolved
Type: task
Blocked by: 02

D3, D4 из `spec.md`. `ConnectionComponent` рендерит шаблон при его наличии. `EdgeModel.closestHandles` и
`floating` удаляются из модели, интерфейса, `createEdge`, docs (floating-edges → `position="auto"`), consumer.

## Answer

Сделано 2026-09-20 в одном проходе с остальными issue; проверки в отчёте сессии.
