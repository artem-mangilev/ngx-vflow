# 05. Раздел «Custom markers» и демо фигур

Status: resolved
Type: task
Blocked by: 04

D5 из `spec.md`. `CustomMarkersDemoComponent` на странице markers: `circle`, `circle-closed`, `diamond`,
`diamond-closed`, `bar` в `ng-template defs` с классами `.vflow-marker`, edges со строковыми маркерами
(один с разными `start`/`end`), `connection.marker` строкой. Текст: где определять маркер, `refX` и конец
пути, `context-stroke`, что инсет для строки равен 0. Страница custom-edges перестаёт советовать `<marker>`
внутри шаблона edge и ссылается на раздел. docs-e2e: маркер из `defs` присутствует в DOM и edge ссылается
на него по `marker-end`.

## Answer

Сделано 2026-09-24. `CustomMarkersDemoComponent` на странице markers: `circle`, `circle-closed`, `diamond`,
`diamond-closed`, `bar` через `ng-template marker`; ребро `1 -> 4` со `start: 'bar'` и `end: { type: 'diamond',
width: 24 }`, соединение с `'circle-closed'`. Раздел «Custom markers» в `index.md` описывает контракт фигуры,
`inset` и наследование stroke. e2e `apps/docs-e2e/markers.spec.ts`.
