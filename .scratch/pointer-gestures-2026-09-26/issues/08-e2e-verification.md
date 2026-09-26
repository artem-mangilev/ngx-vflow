# 08. E2E-проверка жестов

Status: resolved
Type: task
Blocked by: 07

`apps/docs-e2e/viewport-gestures.spec.ts` (новый) и регресс существующих сьютов.

- Pan мышью: `viewport()` меняется на Δ курсора; клик без сдвига снимает выделение; сдвиг больше `paneClickDistance` — нет.
- Wheel zoom: точка под курсором остаётся на месте (сравнить flow-координату до/после через `documentToFlowCoordinates` или позицию ноды в DOM); `panOnScroll` — сдвиг без зума.
- Double click при `zoomOnDoubleClick`: ×2, анимация завершается.
- Drag ноды: `nodeDragThreshold` (демо `viewport-gestures` или `draggables`); `(click)` в шаблоне не срабатывает после drag.
- Ресайз: существующий `resizer.spec.ts` проходит без изменений.
- Touch (Chromium, `hasTouch: true`): один палец pan; pinch через CDP `Input.dispatchTouchEvent` с двумя точками; `vflowNoDrag` textarea внутри ноды скроллится (если тикет 01 подтвердил).
- `fitView({ duration })` в демо lazy-loading/vizdom: viewport приходит к цели; сборка docs без d3 в бандле (`stats` или `grep` по `dist`).
- Прогон всех `apps/docs-e2e`, юнитов `nx test ngx-vflow ui`, `nx build ngx-vflow`.

## Answer

Сделано: `apps/docs-e2e/viewport-gestures.spec.ts` (pan и подавление клика, wheel вокруг курсора и scroll-pan, dblclick и анимированный fitView, drag ноды без выделения, touch pan/pinch и `touch-action`, плавный переход lazy-loading с точной посадкой на ноду) и `apps/docs-e2e/pointer-interactions.spec.ts` (соединение мышью и пальцем, переподключение без pan, selection box по Shift). Весь набор docs-e2e: 46 из 46; юнит-тесты `ngx-vflow`: 332 из 332; `nx lint ngx-vflow` и `nx build ngx-vflow` чистые. Единственный нестабильный тест `stress-rendering` › virtualization падает под параллельной нагрузкой одинаково на d3 и на новой сборке (A/B 5 из 10 в обоих); с `--workers=1` проходит. Pan на 4900 нодах длится столько же (≈8,4 с на 12 шагов в dev-режиме); после отпускания добавляется один тик, когда hover уходит с захватывающего pane.
