# 05. Раздел «Custom markers» и демо фигур

Status: ready-for-agent
Type: task
Blocked by: 04

D5 из `spec.md`. `CustomMarkersDemoComponent` на странице markers: `circle`, `circle-closed`, `diamond`,
`diamond-closed`, `bar` в `ng-template defs` с классами `.vflow-marker`, edges со строковыми маркерами
(один с разными `start`/`end`), `connection.marker` строкой. Текст: где определять маркер, `refX` и конец
пути, `context-stroke`, что инсет для строки равен 0. Страница custom-edges перестаёт советовать `<marker>`
внутри шаблона edge и ссылается на раздел. docs-e2e: маркер из `defs` присутствует в DOM и edge ссылается
на него по `marker-end`.
