# 01. Угол касательной в `labelPoints` встроенных кривых

Status: resolved
Type: task

D1 из `spec.md`. Добавить `EdgeLabelPoint = Point & { angle?: number }` в `edge-label.interface.ts`,
сменить тип `CurveLayout.labelPoints` на него. Straight: `atan2`. Bezier: касательная де Кастельжо на том
же `t`, что и точка (`getPointOnBezier` возвращает точку и угол). Smooth-step: направление сегмента из
`getPointAtRatio` для `start`/`end`; для `center` — сегмент, содержащий `(labelX, labelY)`; вырожденный
случай `n < 2` — без угла.

Спеки: `straigh-path`, `bezier-path` (горизонтальные концы дают 0 в `start`/`end`, симметричная S-кривая даёт
ненулевой угол в центре), `smooth-step-path` (углы кратны 90). Экспорт типа в `public-api.ts`.

## Answer

Сделано 2026-09-24. `EdgeLabelPoint` в `edge-label.interface.ts`, `directionAngle` в `math/direction-angle.ts`.
Straight — угол линии; bezier — касательная де Кастельжо в `getPointOnBezier`; smooth-step — сегмент из
`getPointAtRatio`, для центра `angleAt` ищет сегмент, содержащий точку. Спеки в `edge-path.spec.ts` и
`smooth-step-path.spec.ts`.
