import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';
import { placeFlowPoint } from './viewport-transform';

/** A touch of a viewport gesture: where it is on the pane and which flow point it holds. */
export interface TouchAnchor {
  pane: Point;
  flow: Point;
}

export interface TouchGestureOptions {
  /** Whether the touches may translate the viewport. */
  pan: boolean;
  /** Whether two touches may change the zoom. */
  zoom: boolean;
  minZoom: number;
  maxZoom: number;
}

function middle(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * The viewport after touches move. One touch keeps its flow point under the finger. Two touches set the zoom to the
 * ratio of their pane distance to their flow distance and keep the middle of their flow points under the middle of
 * the fingers.
 *
 * Without `zoom`, the middle still pans at the current zoom. Without `pan`, the zoom changes by the same ratio around
 * `pinchCenter`, the middle of the fingers when the pinch began, and the viewport does not follow the fingers.
 */
export function touchViewport(
  current: ViewportState,
  touches: readonly TouchAnchor[],
  pinchCenter: Point,
  options: TouchGestureOptions,
): ViewportState {
  const [first, second] = touches;
  let next: ViewportState;
  let center: Point;

  if (second) {
    const pane = Math.hypot(second.pane.x - first.pane.x, second.pane.y - first.pane.y);
    const flow = Math.hypot(second.flow.x - first.flow.x, second.flow.y - first.flow.y);
    const zoom = flow > 0 ? Math.max(options.minZoom, Math.min(options.maxZoom, pane / flow)) : current.zoom;
    center = middle(first.pane, second.pane);
    next = placeFlowPoint(zoom, center, middle(first.flow, second.flow));
  } else {
    center = first.pane;
    next = placeFlowPoint(current.zoom, first.pane, first.flow);
  }

  if (!options.zoom) {
    const ratio = current.zoom / next.zoom;
    next = {
      zoom: current.zoom,
      x: center.x - (center.x - next.x) * ratio,
      y: center.y - (center.y - next.y) * ratio,
    };
  }

  if (!options.pan) {
    const ratio = second ? next.zoom / current.zoom : 1;
    next = {
      zoom: current.zoom * ratio,
      x: pinchCenter.x - (pinchCenter.x - current.x) * ratio,
      y: pinchCenter.y - (pinchCenter.y - current.y) * ratio,
    };
  }

  return next;
}

/** Middle of the touches on the pane. */
export function touchCenter(touches: readonly TouchAnchor[]): Point {
  const sum = touches.reduce((acc, touch) => ({ x: acc.x + touch.pane.x, y: acc.y + touch.pane.y }), { x: 0, y: 0 });
  return { x: sum.x / touches.length, y: sum.y / touches.length };
}
