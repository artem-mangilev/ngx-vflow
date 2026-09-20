# 01. `handleType="any"`, удаление `ConnectionSettings.mode`

Status: resolved
Type: task

D1 из `spec.md`. `HandleType` получает `any`; `ConnectionModel` без `mode`, проверка типов только для
типизированной пары, `adjustDirection` только для `target` → `source`; `EdgeModel.findHandle` без loose-fallback:
handle роли — типизированный этой роли или `any`. Спеки: connection-controller, edge.model, connection.model.
Docs: connections (loose-режим → `any`), демо loose-connection.

Файлы: `types/handle-type.type.ts`, `models/connection.model.ts`, `interfaces/connection-settings.interface.ts`,
`utils/adjust-direction.ts`, `models/edge.model.ts`, `directives/connection-controller.directive.ts`.

## Answer

Сделано 2026-09-20 в одном проходе с остальными issue; проверки в отчёте сессии.
