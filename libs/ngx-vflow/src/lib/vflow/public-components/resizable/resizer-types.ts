import type { Node } from '../../interfaces/node.interface';

/** Direction of a resize on one axis: `1` = right or down, `-1` = left or up, `0` = no change. */
type ResizeDirectionSign = -1 | 0 | 1;

/**
 * Payload of `(resizeStart)`, `(resize)` and `(resizeEnd)`, and the argument of {@link ShouldResize}. The rect is the
 * node's position and size in flow units: at the start the size before the gesture, during it the size about to be
 * written (or just written, for `(resize)`), at the end the last size written.
 */
export interface ResizeEvent<N extends Node = Node> {
  /** The application node being resized. */
  node: N;
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * The direction the dragged side moved on each axis since the previous resize step: `x` is `1` right, `-1` left,
   * `y` is `1` down, `-1` up, `0` no change. Growing from a left or top control is `-1`. Always `{ x: 0, y: 0 }` in
   * `(resizeStart)` and `(resizeEnd)`, which report a state rather than a step.
   */
  direction: { x: ResizeDirectionSign; y: ResizeDirectionSign };
  /** The pointer event being handled: the press, a move or the release. */
  sourceEvent: PointerEvent;
}

/**
 * Restricts resizing to a single axis.
 */
export type ResizeAxis = 'horizontal' | 'vertical';

/**
 * Called before a resize step is applied; return `false` to skip it.
 */
export type ShouldResize = (event: ResizeEvent) => boolean;

/** Side or corner of the node that a resize control drags. */
export type ControlPosition =
  'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Bounding box described by two corners: `[[minX, minY], [maxX, maxY]]`. */
export type CoordinateExtent = [[number, number], [number, number]];
