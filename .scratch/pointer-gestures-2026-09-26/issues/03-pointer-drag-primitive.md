# 03. Примитив перетаскивания на Pointer Events

Status: resolved
Type: task
Blocked by: —

`gestures/pointer-drag.ts`: `createPointerDrag(element, options): { destroy }` по D2.

Опции: `filter(event: PointerEvent): boolean`, `threshold: () => number` (читается на `pointerdown`), `capture: boolean`, `onStart(ctx)`, `onMove(ctx)`, `onEnd(ctx)`, `onCancel(ctx)`; `ctx = { sourceEvent, pointerId, pointerType, start: Point, current: Point, delta: Point }` в client px.

Поведение:

- `pointerdown` на элементе (bubble): `filter` → запомнить указатель, `stopPropagation()`, без `preventDefault`; при `threshold === 0` сразу `onStart`.
- `pointermove/pointerup/pointercancel` на `window`, capture, `passive: false`, фильтр по `pointerId`; второй указатель игнорируется (pinch — дело ViewportGestures, не примитива).
- `setPointerCapture` в `try/catch`, только при `capture`; `releasePointerCapture` на завершении, если `hasPointerCapture`.
- `selectstart`/`dragstart` на `document` с `preventDefault` от `pointerdown` до завершения; после `onStart` — подавление следующего `click` (capture на `window`, снять в `setTimeout(0)`).
- `pointermove` с `buttons === 0` при `pointerType === 'mouse'` → завершение как `pointerup`; `pointercancel` и `window blur` → `onCancel` (после `onStart`) или тихий сброс (до него).
- `destroy()` снимает всё, включая незавершённый жест (`onCancel`).

Спеки `pointer-drag.spec.ts`: порог; `end` без `start` не вызывается; клик подавлен только после сдвига; `pointercancel`; `blur`; `buttons === 0`; чужой `pointerId`; `destroy` во время жеста; `setPointerCapture` с синтетическим id не ломает жест (по итогу тикета 01).

## Answer

Сделано: `gestures/pointer-drag.ts`. Отличия от описания тикета: `setPointerCapture` берётся при первом реальном сдвиге, а не на `pointerdown`, иначе `click` без сдвига уходил бы на захватывающий элемент (клик по ребру перестал бы выделять ребро); событие, пересекающее порог, получает только `onStart` (как d3-drag, где на нём ставился только статус старта); `pointerup` не вызывает `onMove`. Опция `stopCompatibilityEvents` гасит всплытие compat `mousedown`/`touchstart` принятого нажатия. Спека `pointer-drag.spec.ts`; хелпер синтетических событий для спеков `gestures/pointer-events.testing.ts` (в бандл не попадает).
