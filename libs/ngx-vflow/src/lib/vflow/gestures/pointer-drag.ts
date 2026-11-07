import { Point } from '../interfaces/point.interface';

export interface PointerDragContext {
  /** The event being handled: the press, a move, the release or the cancellation. */
  readonly event: PointerEvent;
  /** The press that began the gesture. */
  readonly press: PointerEvent;
  /** Client position of the press. */
  readonly start: Point;
  /** Current client position. */
  readonly point: Point;
}

export interface PointerTrackerOptions {
  /** Client-space distance the pointer has to exceed before the drag starts; read when the press is accepted. */
  threshold?: () => number;
  /** Distance after which the click that follows the release is suppressed. Defaults to the threshold. */
  clickDistance?: () => number;
  /**
   * Captures the pointer on the element once it moves, so that the gesture survives iframes and pointer-events
   * changes. A press released without moving keeps its original click target. Needs an element.
   */
  capture?: boolean;
  /**
   * Keeps the compatibility `mousedown` and `touchstart` of an accepted press from bubbling past the element, so that
   * a press consumed by the gesture reaches no ancestor, whichever event type the ancestor listens to. Needs an element.
   */
  stopCompatibilityEvents?: boolean;
  /** Runs on the press with a zero threshold, otherwise on the move that exceeds it. */
  onStart?: (context: PointerDragContext) => void;
  onMove?: (context: PointerDragContext) => void;
  onEnd?: (context: PointerDragContext) => void;
  /** Runs instead of `onEnd` when the browser, a lost window focus or {@link PointerTracker.destroy} ends the drag. */
  onCancel?: (context: PointerDragContext) => void;
}

export interface PointerDragOptions extends PointerTrackerOptions {
  /** Decides whether a press begins a gesture. Runs before the press is handled in any other way. */
  filter?: (event: PointerEvent) => boolean;
}

/** Follows one pointer from a press that was received elsewhere. */
export interface PointerTracker {
  /** Whether a press is being tracked, before or after the drag started. */
  readonly pressed: boolean;
  /** Begins tracking the press; ignored while another press is being tracked. */
  press(event: PointerEvent): void;
  /** Stops tracking without reporting an end or a cancellation. */
  release(): void;
  /** Cancels a gesture in progress and removes every listener. */
  destroy(): void;
}

export interface PointerDrag {
  /** Whether a press is being tracked, before or after the drag started. */
  readonly pressed: boolean;
  /** Cancels a gesture in progress and removes every listener. */
  destroy(): void;
}

const CLICK_SUPPRESSION_OPTIONS = { capture: true } as const;

function clientPoint(event: PointerEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

function preventDefault(event: Event) {
  event.preventDefault();
}

function stopPropagation(event: Event) {
  event.stopPropagation();
}

/** Swallows the click that the browser dispatches after a mouse drag ends. */
function suppressNextClick(view: Window) {
  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  view.addEventListener('click', swallow, CLICK_SUPPRESSION_OPTIONS);
  setTimeout(() => view.removeEventListener('click', swallow, CLICK_SUPPRESSION_OPTIONS));
}

/**
 * Turns a press into a drag gesture of a single pointer.
 *
 * The press is never prevented, so that focus, compatibility mouse events and the library's other listeners keep
 * working. Moves and the release are read from the window in the capture phase and matched by pointer id. A mouse
 * move without pressed buttons ends the drag, because the release may have happened where the page could not see it.
 *
 * `element` is where the pointer is captured and the compatibility events are stopped; without it both options are
 * off, and the window of the document is used.
 */
/** An element whose pointer events are typed: every HTML and SVG element. */
export type GestureElement = Element & GlobalEventHandlers;

/** The press a tracker follows, from the press event to the release. */
interface TrackedPress {
  press: PointerEvent;
  start: Point;
  threshold: number;
  clickDistance: number;
  started: boolean;
  moved: boolean;
  captured: boolean;
}

export function createPointerTracker(options: PointerTrackerOptions, element?: Element): PointerTracker {
  const doc = element?.ownerDocument ?? document;
  const view = doc.defaultView ?? window;
  let gesture: TrackedPress | null = null;

  const context = (event: PointerEvent, current: TrackedPress): PointerDragContext => ({
    event,
    press: current.press,
    start: current.start,
    point: clientPoint(event),
  });

  const release = () => {
    if (!gesture) return;
    const { press, captured } = gesture;
    gesture = null;
    view.removeEventListener('pointermove', onPointerMove, true);
    view.removeEventListener('pointerup', onPointerUp, true);
    view.removeEventListener('pointercancel', onPointerCancel, true);
    view.removeEventListener('blur', onBlur);
    doc.removeEventListener('selectstart', preventDefault, true);
    doc.removeEventListener('dragstart', preventDefault, true);
    element?.removeEventListener('mousedown', stopPropagation);
    element?.removeEventListener('touchstart', stopPropagation);
    if (captured && element?.hasPointerCapture(press.pointerId)) {
      element.releasePointerCapture(press.pointerId);
    }
  };

  const track = (event: PointerEvent, current: TrackedPress) => {
    const point = clientPoint(event);
    const distance = Math.hypot(point.x - current.start.x, point.y - current.start.y);
    if (distance > current.clickDistance) current.moved = true;
    if (options.capture && element && !current.captured && distance > 0) {
      try {
        element.setPointerCapture(event.pointerId);
        current.captured = true;
      } catch {
        // Synthetic pointers cannot be captured; window listeners still follow the gesture.
      }
    }
    if (current.started) return true;
    // The event that crosses the threshold starts the drag and is delivered to onStart only.
    if (distance > current.threshold) {
      current.started = true;
      options.onStart?.(context(event, current));
    }
    return false;
  };

  const end = (event: PointerEvent, current: TrackedPress) => {
    const ctx = context(event, current);
    const suppressClick = current.started && current.moved && event.pointerType !== 'touch';
    release();
    if (current.started) {
      options.onEnd?.(ctx);
      if (suppressClick) suppressNextClick(view);
    }
  };

  const cancel = (event: PointerEvent, current: TrackedPress) => {
    const ctx = context(event, current);
    release();
    if (current.started) options.onCancel?.(ctx);
  };

  function onPointerMove(event: PointerEvent) {
    const current = gesture;
    if (!current || event.pointerId !== current.press.pointerId) return;
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      end(event, current);
      return;
    }
    if (track(event, current)) options.onMove?.(context(event, current));
  }

  function onPointerUp(event: PointerEvent) {
    if (!gesture || event.pointerId !== gesture.press.pointerId) return;
    end(event, gesture);
  }

  function onPointerCancel(event: PointerEvent) {
    if (!gesture || event.pointerId !== gesture.press.pointerId) return;
    cancel(event, gesture);
  }

  function onBlur() {
    if (gesture) cancel(gesture.press, gesture);
  }

  function press(event: PointerEvent) {
    if (gesture) return;

    const threshold = Math.max(0, options.threshold?.() ?? 0);
    gesture = {
      press: event,
      start: clientPoint(event),
      threshold,
      clickDistance: Math.max(0, options.clickDistance?.() ?? threshold),
      started: false,
      moved: false,
      captured: false,
    };

    view.addEventListener('pointermove', onPointerMove, true);
    view.addEventListener('pointerup', onPointerUp, true);
    view.addEventListener('pointercancel', onPointerCancel, true);
    view.addEventListener('blur', onBlur);
    doc.addEventListener('selectstart', preventDefault, true);
    doc.addEventListener('dragstart', preventDefault, true);
    if (options.stopCompatibilityEvents && element) {
      element.addEventListener('mousedown', stopPropagation);
      element.addEventListener('touchstart', stopPropagation);
    }

    if (threshold === 0) {
      gesture.started = true;
      options.onStart?.(context(event, gesture));
    }
  }

  return {
    get pressed() {
      return gesture !== null;
    },
    press,
    release,
    destroy() {
      if (gesture) cancel(gesture.press, gesture);
    },
  };
}

/**
 * Turns presses on an element into drag gestures of a single pointer; see {@link createPointerTracker}. An accepted
 * press stops propagating, so that the ancestors of the element do not start a gesture of their own on it.
 */
export function createPointerDrag(element: GestureElement, options: PointerDragOptions): PointerDrag {
  const tracker = createPointerTracker(options, element);

  function onPointerDown(event: PointerEvent) {
    if (tracker.pressed) return;
    if (options.filter && !options.filter(event)) return;

    event.stopPropagation();
    tracker.press(event);
  }

  element.addEventListener('pointerdown', onPointerDown);

  return {
    get pressed() {
      return tracker.pressed;
    },
    destroy() {
      tracker.destroy();
      element.removeEventListener('pointerdown', onPointerDown);
    },
  };
}
