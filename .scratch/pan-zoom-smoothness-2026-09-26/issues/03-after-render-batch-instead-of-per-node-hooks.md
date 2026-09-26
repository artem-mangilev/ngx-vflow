# 03. Один after-render хук на flow вместо двух на узел

Status: resolved
Type: task
Blocked by: —

`AfterRenderImpl.execute` в Angular 20 обходит все зарегистрированные последовательности на каждом tick: `for (phase of 4) for (sequence of sequences)`. `nodeResizeController` и `nodeHandlesController` регистрировали по `afterRenderEffect` на узел — 9 800 последовательностей, ~40 000 итераций на tick. В CPU-профиле pan (dev, 49 кадров) это 116 мс self в `execute` + 47 мс в хуках ≈ 3 мс на кадр.

Решение: `services/after-render-batch.service.ts` — очередь чтений, одна регистрация `afterNextRender({ read })` на tick; `nodeResizeController` ставит измерение в очередь из обычного `effect`, `nodeHandlesController` планирует синхронизацию из `effect` (она и так шла через rAF). View-эффекты посещаются только в грязных view.

## Answer

Сделано. Фаза zoom Virtualization (много tick'ов): занятость главного потока 413 → 313 мс; pan 1 059 → 973 мс. Полный набор unit-тестов зелёный.
