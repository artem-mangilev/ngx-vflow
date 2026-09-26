# 01. Прототип: touch-action, compat mouse events и pointer capture по браузерам

Status: resolved
Type: prototype
Blocked by: —

Снять фактическое поведение браузеров по трём вопросам из «Нерешённое» в `spec.md`, потому что от них зависят D2.1, D3 и способ тестирования.

Стенд: статическая страница в `/private/tmp/.../scratchpad` (не в репозитории), запускается через preview; iOS Safari — вручную или через Playwright WebKit с `hasTouch`.

1. `touch-action` в цепочке: pane `none` → нода `none` → `<textarea>`/`<div style="overflow:auto">` с `touch-action: auto`. Скроллится ли контрол пальцем? Скроллится ли страница из `<div touch-action:auto>` без собственного скролла? Матрица: Chrome, Firefox, Safari macOS, iOS Safari, Android Chrome.
2. `pointerdown` + `stopPropagation()` на ноде: приходит ли compat `mousedown` на ту же ноду (Angular host listener) и на `.vflow-root`? Ожидание по спецификации: приходит на ноду и всплывает до root, потому что это отдельное событие.
3. `element.setPointerCapture(pointerId)` для синтетического `new PointerEvent('pointerdown', { pointerId: 7 })` в Chrome: исключение (`NotFoundError`) или нет; то же в Playwright с реальной мышью.

## Answer

Проверено только в Chromium (Playwright headless, CDP `Input.dispatchTouchEvent`); WebKit и Firefox в окружении не установлены, iOS Safari и Android Chrome не проверялись. Стенды: `probe/proto01.cjs`, `probe/proto01b.cjs` в scratchpad сессии.

| Вопрос                                                                       | Chromium                                                    |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Скроллер `overflow:auto; touch-action:auto` внутри ноды `none` и pane `none` | скроллится, браузер шлёт `pointercancel`                    |
| Не-скроллер `touch-action:auto` внутри тех же предков                        | страница не скроллится, приходят `pointermove`/`pointerup`  |
| Элемент вне pane                                                             | страница скроллится, `pointercancel`                        |
| Два пальца на pane `pan-x pan-y`                                             | все `pointermove` приходят, скролла и page zoom нет         |
| Два пальца на pane `auto`                                                    | браузер делает page zoom, `pointercancel`                   |
| `stopPropagation()` на `pointerdown` (мышь)                                  | compat `mousedown` приходит на цель и всплывает             |
| Tap пальцем                                                                  | compat `mousedown/mouseup/click` приходят после `pointerup` |
| `setPointerCapture(7)` для несуществующего указателя                         | `NotFoundError`                                             |
| `setPointerCapture` в обработчике реального `pointerdown`                    | работает                                                    |

Выводы:

- D3 подтверждён: `none` на pane при включённом touch pan, `pan-x pan-y` при выключенном pan и включённом pinch, `auto` при выключенных обоих. Собственный скролл контролов внутри нод сохраняется. Прокрутка страницы пальцем из no-pan региона, который сам не скроллер, при включённом touch pan невозможна; это фиксируется в доке `viewport-gestures`.
- D2.1 подтверждён: `stopPropagation` на `pointerdown` не мешает compat mouse events. Для touch compat mouse events приходят только на tap и только после `pointerup`, поэтому mouse-слушатели выделения на touch срабатывают после жеста, как сейчас после `touchend`.
- `setPointerCapture` оборачивается в `try/catch`; юнит-тесты с синтетическими событиями работают без capture.
