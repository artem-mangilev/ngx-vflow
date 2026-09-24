# 03. Строка-id в `Edge.markers` и `ConnectionSettings.marker`

Status: ready-for-agent
Type: task

D3 из `spec.md`. Тип `EdgeMarker = Marker | string` (имя уточнить, чтобы не конфликтовать с `Marker`) в
`marker.interface.ts`; `Edge.markers`, `EDGE_DEFAULTS`, `ConnectionSettings.marker` на него.
`EdgeModel.markerStartUrl/markerEndUrl` и `ConnectionComponent.markerUrl`: строка → `url(#id)`.
`FlowEntitiesService.markers` пропускает строки. `markerInset(string)` → 0 (сигнатура принимает объединение).

Спеки: `edge.model.spec` (url для строки, инсет 0, строка не попадает в карту defs), `marker-inset.spec`,
`flow-entities` при наличии. Docs markers: абзац о строке-id и `url(#id)`.
