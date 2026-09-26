# 03. Один проход измерения узлов и хэндлов вместо трёх

Status: needs-triage
Type: task
Blocked by: —

При загрузке узлы измеряются трижды: `afterRenderEffect` в `NodeResizeControllerDirective` (первый прогон), callback `ResizeObserver` для того же элемента, затем rAF-синк хэндлов (`NodeHandlesControllerDirective.scheduleSync`) с `getBoundingClientRect` узла, хэндлов и якорей. Итого на 4900 узлов: 19 760 `getBoundingClientRect`, 14 820 `getClientRects`, 19 767 `offset*`. Микробенчмарк (`tools/exp.mjs`) показывает, что сами чтения при чистом layout стоят 1–3 мс на 4900 элементов; дорого то, что первый после DOM-записей форсирует полный style recalc + layout (~0.4 с в профиле как self-time `getClientRects`), а между проходами лежат паузы rAF/RO (~0.5 с «idle» загрузки).

Направления:

- Брать размер узла из `ResizeObserverEntry.borderBoxSize` — ни одного DOM-чтения; `afterRenderEffect`-измерение оставить только для сверки после жеста ресайза.
- Измерять хэндлы в том же проходе, что и узлы (RO-callback уже после layout), а не в отдельном rAF; общий контекст измерения (`HandleMeasureContext`) уже есть.
- `flowInitialized` не ждать два кадра, а выставлять по завершении первого прохода измерений.

Проверка: `domReads` в `profile.mjs load` должны упасть кратно, `readyMs` — на ~0.5–0.8 с в prod. Учесть спецификацию виртуализации: узел, вернувшийся из `display: none`, должен переизмериться (RO это делает сам — размер меняется с 0).
