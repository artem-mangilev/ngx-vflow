import type { Node } from '../../interfaces/node.interface';
import type { Rect } from '../../interfaces/rect';

/** Position and size of the node during a resize, in flow units. */
export type ResizeParams = Rect;

/** Sign of the size change on one axis: `1` = increase, `-1` = decrease, `0` = no change. */
export type ResizeSign = -1 | 0 | 1;

export interface ResizeChangeParams extends ResizeParams {
  /** Sign of the last size change per axis. */
  direction: { x: ResizeSign; y: ResizeSign };
}

/** Payload of `(resizeStart)` and `(resizeEnd)`. */
export interface ResizeEvent extends ResizeParams {
  /** The application node being resized. */
  node: Node;
}

/** Payload of `(resize)`. */
export interface ResizeChangeEvent extends ResizeChangeParams {
  /** The application node being resized. */
  node: Node;
}

/**
 * Restricts resizing to a single axis.
 */
export type ResizeAxis = 'horizontal' | 'vertical';

/**
 * Event passed to resize callbacks.
 */
export interface ResizeDragEvent {
  /** The pointer event being handled: the press, a move or the release. */
  sourceEvent: PointerEvent;
}

/**
 * Called before a resize is applied; return `false` to prevent it.
 */
export type ShouldResize = (event: ResizeDragEvent, params: ResizeChangeParams) => boolean;

/** Side or corner of the node that a resize control drags. */
export type ControlPosition =
  'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Bounding box described by two corners: `[[minX, minY], [maxX, maxY]]`. */
export type CoordinateExtent = [[number, number], [number, number]];
