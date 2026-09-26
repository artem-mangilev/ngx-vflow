# 04. ViewportGesturesDirective вместо MapContextDirective

Status: resolved
Type: task
Blocked by: 01, 02, 03

Заменить `directives/map-context.directive.ts` на `directives/viewport-gestures.directive.ts` (селектор `div[viewportGestures]`, шаблон `vflow.component.html` строка 17) по D3 и D4.

- Pan мышью/пером через `createPointerDrag(pane, { capture: true, threshold: () => 0, filter: filterCondition })`; `start` запоминает состояние для selection, `end` → `zone.run` → `triggerViewportChangeEvent('end')` + `selectionService.setViewport({ start, end, target: pointerdownTarget })`.
- Touch: собственный учёт до двух указателей на pane (pointerType `touch`), один — pan, два — `pinchTransform`; двойной тап (< 500 ms, < 10 px) → ветка double click. Флаги `pan`/`zoom` из `dragPanning()`/`zoomOnPinch()` и исключений `[data-vflow-no-pan], [data-vflow-no-drag]`.
- `wheel` (`passive: false`): маршрутизация как сейчас (`data-vflow-no-wheel`, `scrollPanning()`, `zoomActivation`, `ctrlKey` → pinch); жест с idle 150 ms; первое событие без изменения `k` не потребляется.
- `dblclick`: `zoomOnDoubleClick()` + `filterCondition`; ×2 / ×0.5 при Shift; анимация 250 ms.
- Эффект `writableViewport`: `scaleTo` вокруг центра pane, `translate`, absolute; `duration > 0` → `animate` из тикета 02 с прерыванием при новом значении и при любом `pointerdown`/`wheel`/`dblclick`; конец анимации → `end`.
- Host binding `[style.touch-action]` по D3; никаких inline-стилей на pane больше нет.
- `allowRootZoomForNodeTarget`: проверять `event.type === 'pointerdown'`; обновить JSDoc и спеку.
- Удалить `declare module 'd3-selection'`, `isTouchEvent`-ветки в этой директиве.

Переписать `components/vflow/viewport-gestures.spec.ts` на `PointerEvent` (pointerId, pointerType, button, buttons, isPrimary), сохранив все существующие `it(...)`; добавить: wheel-жест даёт один `viewportChangeEnd$`; `zoomTo` — вокруг центра; `fitView({ duration })` доходит до цели (fake rAF) и прерывается `pointerdown`; `target` в `setViewport` — цель `pointerdown`; двойной тап.

## Answer

Сделано: `directives/viewport-gestures.directive.ts`, `map-context.directive.ts` удалён. Формулы и события сверены с d3 зондом `probe/probe.cjs`: итоговые состояния, число `viewportChangeEnd$`, подавление клика, снятие выделения, touch, wheel на границе зума и auto-pan совпадают; траектории анимаций (lazy-loading, fitView, zoomTo/panTo с duration, dblclick) совпадают в пределах кадра. Отклонение: pinch без pan зумирует вокруг середины пальцев на момент начала pinch (d3-версия дрейфовала за предыдущим событием); это соответствует комментарию существующего теста. `allowRootZoomForNodeTarget` проверяет `pointerdown`. Спека `viewport-gestures.spec.ts` переписана на Pointer Events и дополнена.
