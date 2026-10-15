/**
 * Bounding box described by two corners: `[[minX, minY], [maxX, maxY]]`.
 */
export type CoordinateExtent = [[number, number], [number, number]];

/**
 * Relative origin of a node, `[0, 0]` = top-left, `[1, 1]` = bottom-right.
 */
export type NodeOrigin = [number, number];

import type { Node } from '../../interfaces/node.interface';

/** Position and size of the node during a resize, in flow units. */
export interface ResizeParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
 * Position of a resize control line.
 */
export type ControlLinePosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Position of a resize control (line or corner handle).
 */
export type ControlPosition = ControlLinePosition | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Visual variant of a resize control.
 */
export enum ResizeControlVariant {
  Line = 'line',
  Handle = 'handle',
}

/**
 * Restricts resizing to a single axis.
 */
export type ResizeAxis = 'horizontal' | 'vertical';

export const RESIZER_HANDLE_POSITIONS: ControlPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
export const RESIZER_LINE_POSITIONS: ControlLinePosition[] = ['top', 'right', 'bottom', 'left'];

/**
 * Event passed to resize callbacks.
 */
export interface ResizeDragEvent {
  /** The pointer event being handled: the press, a move or the release. */
  sourceEvent: PointerEvent;
}

type ResizeHandler<Params = ResizeParams, Result = void> = (event: ResizeDragEvent, params: Params) => Result;

/**
 * Called before a resize is applied; return `false` to prevent it.
 */
export type ShouldResize = ResizeHandler<ResizeChangeParams, boolean>;
export type OnResizeStart = ResizeHandler;
export type OnResize = ResizeHandler<ResizeChangeParams>;
export type OnResizeEnd = ResizeHandler;
