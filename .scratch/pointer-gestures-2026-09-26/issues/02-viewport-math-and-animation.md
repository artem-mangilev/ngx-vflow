# 02. Математика viewport и анимация без d3

Status: resolved
Type: task
Blocked by: —

Создать `libs/ngx-vflow/src/lib/vflow/gestures/` по D1: `viewport-transform.ts`, `zoom-interpolation.ts`, `wheel.ts`, `pinch.ts`. Без Angular и DOM-зависимостей, кроме типа `WheelEvent`.

- `scaleAbout(state, k, point)`: точка pane под указателем остаётся на месте (d3 `translate(scale(t,k), p0, p1)`); `clampZoom` по `[minZoom, maxZoom]`.
- `interpolateZoom(a, b)` — порт из d3-interpolate с ρ = √2 и линейной веткой при `|w0 − w1| < ε`; `easeCubicInOut`; `animate({ from, to, duration, onFrame, onEnd })` на `requestAnimationFrame` (использовать `utils/animation-frames.ts`, если подходит), возвращает `interrupt()`.
- `wheelZoomFactor(event)` и `wheelPanDelta(event, paneHeight)` — формулы из D4.
- `pinchTransform(state, p0: [a, b], p1: [a', b'], { pan, zoom })` — d3 `touchmoved` с флагами.
- Goldens по D8: снять значения с установленного сейчас d3 (скрипт в scratchpad, не в репозитории) и положить в `*.spec.ts` константами. Спеки: `viewport-transform.spec.ts`, `zoom-interpolation.spec.ts`, `wheel.spec.ts`, `pinch.spec.ts`.

Файлы: новые под `gestures/`; ссылка на существующие `utils/coordinates.ts` (`clientToFlowPosition`) и `utils/viewport.ts` (`getViewportForBounds`) без дублирования.

## Answer

Сделано: `gestures/viewport-transform.ts`, `zoom-interpolation.ts` (порт `interpolateZoom` ρ = √2 и `easeCubicInOut`), `viewport-animation.ts` (rAF-аниматор, время от запроса, начало и цель читаются на первом кадре, `interrupt()` даёт `onEnd` только начатой анимации), `wheel.ts`, `pinch.ts`. Goldens сняты с d3-zoom 3.0 до удаления (`probe/gold.mjs` в scratchpad) и лежат в `zoom-interpolation.spec.ts`; спеки `pinch.spec.ts`, `viewport-animation.spec.ts`.
