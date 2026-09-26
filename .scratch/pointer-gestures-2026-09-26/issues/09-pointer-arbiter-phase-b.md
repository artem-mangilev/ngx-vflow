# 09. Этап B: единый арбитр pointerdown и перевод остальных слушателей на Pointer Events

Status: resolved
Type: task
Blocked by: 08

По D9. Отдельный релизный шаг; может быть отложен.

- `RootPointerDirective`: `pointerStart$`, `pointerMovement$`, `pointerEnd$` из `pointerdown/pointermove/pointerup` (без `elementFromPoint`, кроме touch-hover для handles, где `pointerover` не приходит без capture-release; проверить `pointerover` при touch в Chrome/Safari).
- `PointerDirective`, `HandleDirective`, `EdgeComponent`: host listeners `pointerdown/pointerup/pointerenter/pointerleave`; `setInitialTouch` уходит.
- `ConnectionControllerDirective.afterDragThreshold` → примитив из тикета 03 с `capture: false`.
- Арбитр: capture-listener `pointerdown` на `.vflow-root` классифицирует цель (`[data-vflow-no-drag]` → resize control/контрол приложения; `.vflow-handle` → connection; `.vflow-drag-handle`/`.vflow-node` → node drag; иначе pane) и передаёт решение жестам через `FlowStatusService` или общий контекст; `stopPropagation` из D2.1 и `allowRootZoomForNodeTarget` сводятся к одной таблице.
- Удалить `utils/event.ts` (`isTouchEvent`, `eventClientPoint`) или оставить только `PointerEvent`-варианты.
- Селекшен-бокс получает touch-поддержку бесплатно (сегодня только mouse) — отдельно решить, нужна ли она.

## Answer

Сделано: `RootPointerDirective`, `PointerDirective`, `VflowHandleDirective` (`pointerdown/pointerup/pointerenter/pointerleave`), `EdgeComponent`, `RootSvgContextDirective`, selection box и порог соединения в `ConnectionControllerDirective` работают на Pointer Events; `utils/event.ts` удалён. Touch-жест соединения снимает неявный capture пальца, поэтому хендлы и магниты получают `pointerover/pointerup` так же, как от мыши; эмуляция через `elementFromPoint` и `setInitialTouch` удалена. Вместо отдельного capture-арбитра на root единая таблица классификации нажатий `utils/press-target.ts` (`pressTarget`, `isPanPress`, `isNodeDragPress`), которой пользуются pane, drag ноды и хендлы; «побеждает» самый глубокий элемент, принятое нажатие останавливает всплытие. Мост compat-событий оставлен как контракт: принятое нажатие не доходит до предков ни как `pointerdown`, ни как `mousedown`/`touchstart`. Этим же закрыта регрессия этапа A: ручка переподключения запускала бы pan pane на `pointerdown`. `preventDefault` на `pointerdown` в Chromium отменяет смену фокуса и расширение выделения так же, как на `mousedown` (`probe/proto09.cjs`).
