# 04. Старт жеста, защита клампа и сверка после конца

Status: resolved
Type: task
Blocked by: 03

Решение D4 из `spec.md`.

- `createResizer` `start`: клампить `prevValues.width/height` в `[minWidth, maxWidth]`/`[minHeight, maxHeight]` до формирования `startValues`.
- `NodeResizeControlComponent.onChange`: переключение режима до записи размера уже сделано в тикете 01; проверить порядок и покрыть спекой.
- `NodeResizeControllerDirective.measure`: не писать в модель, пока `model.resizing()`; на `end` (после `resizing.set(false)`) запустить принудительный замер ноды и `scheduleSync` хендлов.
- Спеки: регрессия «старт ниже min не уменьшает прирост» в `audit-regressions.spec.ts` рядом с существующим тестом `resizeEnd`; «измерения во время resizing не пишутся»; «после end модель равна фактическому offsetWidth при CSS min-width больше записанного».

Файлы: `public-components/resizable/resizer.ts`, `node-resize-control.component.ts`, `directives/node-resize-controller.directive.ts`.

## Comments

- Из проверки тикета 03: позиция хендлов после жеста в браузере не проверена, потому что замер хендлов идёт через `requestAnimationFrame`, а при скрытой панели браузера кадры не рисуются. Покрыть спекой в рамках сверки на `end` или проверить при видимой панели.

## Answer

- `createResizer` `start`: клампится только база расчёта (`startValues.width/height`, `aspectRatio`); `prevValues` остаются фактическими, чтобы первое движение гарантированно записало клампнутый размер. Отличие от исходного текста тикета, отражено в D4.
- `NodeResizeControllerDirective`: `measure` ничего не пишет при `model.resizing()`; `afterRenderEffect` читает `resizing()`, поэтому после окончания жеста замер повторяется и модель получает отрисованный размер.
- `NodeHandlesControllerDirective`: `afterRenderEffect` зависит от `width()/height()` модели. Сверка меняет размер модели без изменения DOM, ResizeObserver этого не видит, а точка правого и нижнего хендла считается от размера модели.
- Порядок в `NodeResizeControlComponent.onChange` (режим до размера) покрыт спекой.
- Фейк модели в `node-handles-controller.directive.spec.ts` дополнен `width/height`: без них новое чтение размера давало необработанную ошибку в логе при зелёных тестах.

Спеки: `audit-regressions.spec.ts` «grows a node that starts below its min size…» (без клампа ширина получалась 40 вместо 280); `resizable.component.spec.ts` «switches a content-sized node to explicit before…» (реальный drag +40/+30) и «ignores measurements during a gesture, then reconciles the size and moves the handles».

Проверки: библиотека 228/228 без ошибок в логе, lint, typecheck. Позиция хендла после сверки проверена спекой в Chrome, в браузере docs не проверялась из-за скрытой панели.
