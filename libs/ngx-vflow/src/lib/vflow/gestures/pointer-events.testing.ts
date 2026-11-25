/**
 * Synthetic pointer events for specs. Not part of the library bundle: only specs import this file.
 */

export interface PointerInit {
  x: number;
  y?: number;
  button?: number;
  pointerId?: number;
  pointerType?: 'mouse' | 'pen' | 'touch';
  ctrlKey?: boolean;
  shiftKey?: boolean;
}

const BUTTON_BITS: Record<number, number> = { 0: 1, 1: 4, 2: 2, 3: 8, 4: 16 };

export function pointerEvent(type: string, init: PointerInit): PointerEvent {
  const button = init.button ?? 0;
  const released = type === 'pointerup' || type === 'pointercancel';
  const pointerType = init.pointerType ?? 'mouse';
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: type !== 'pointercancel',
    composed: true,
    view: window,
    clientX: init.x,
    clientY: init.y ?? 100,
    button: type === 'pointermove' ? -1 : button,
    buttons: released ? 0 : (BUTTON_BITS[button] ?? 1),
    pointerId: init.pointerId ?? (pointerType === 'mouse' ? 1 : 10),
    pointerType,
    isPrimary: true,
    ctrlKey: init.ctrlKey ?? false,
    shiftKey: init.shiftKey ?? false,
  });
}

export function dispatchPointer(target: EventTarget, type: string, init: PointerInit): PointerEvent {
  const event = pointerEvent(type, init);
  target.dispatchEvent(event);
  return event;
}

/** Presses on `target`, moves through `path` and releases at the last point. Moves and the release go to the window. */
export function pointerDrag(
  target: EventTarget,
  from: { x: number; y?: number },
  path: { x: number; y?: number }[],
  init: Omit<PointerInit, 'x' | 'y'> = {},
) {
  dispatchPointer(target, 'pointerdown', { ...init, ...from });
  for (const point of path) dispatchPointer(window, 'pointermove', { ...init, ...point });
  const last = path.at(-1) ?? from;
  dispatchPointer(window, 'pointerup', { ...init, ...last });
}

/** Dispatches one pointer event per finger; finger `i` has pointer id `10 + i`. */
export function touchPointers(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  points: { x: number; y?: number }[],
): PointerEvent[] {
  return points.map((point, index) =>
    dispatchPointer(type === 'pointerdown' ? target : window, type, {
      ...point,
      pointerType: 'touch',
      pointerId: 10 + index,
    }),
  );
}

const COMPAT_POINTER_TYPE = { mousedown: 'pointerdown', mousemove: 'pointermove', mouseup: 'pointerup' } as const;

/**
 * Dispatches a mouse action the way a browser does: the pointer event first, then its compatibility mouse event,
 * which a prevented `pointerdown` suppresses.
 */
export function dispatchMouse(
  target: EventTarget,
  type: keyof typeof COMPAT_POINTER_TYPE,
  init: Omit<PointerInit, 'pointerType'>,
): PointerEvent {
  const pointer = dispatchPointer(target, COMPAT_POINTER_TYPE[type], { ...init, pointerType: 'mouse' });
  if (!(type === 'mousedown' && pointer.defaultPrevented)) {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: init.x,
        clientY: init.y ?? 100,
        button: init.button ?? 0,
        buttons: pointer.buttons,
        ctrlKey: init.ctrlKey ?? false,
        shiftKey: init.shiftKey ?? false,
      }),
    );
  }
  return pointer;
}

/** The pointer event of a mouse action, taking `MouseEventInit`; `mousedown` becomes `pointerdown` and so on. */
export function mouseAsPointer(type: string, init: MouseEventInit = {}): PointerEvent {
  const pointerType = COMPAT_POINTER_TYPE[type as keyof typeof COMPAT_POINTER_TYPE] ?? type;
  const released = pointerType === 'pointerup';
  return new PointerEvent(pointerType, {
    bubbles: true,
    cancelable: true,
    view: window,
    ...init,
    button: pointerType === 'pointermove' ? -1 : (init.button ?? 0),
    buttons: released ? 0 : (init.buttons ?? 1),
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
  });
}
