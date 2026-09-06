import type { D3DragEvent, SubjectPosition } from 'd3-drag';

/**
 * Bounding box described by two corners: `[[minX, minY], [maxX, maxY]]`.
 */
export type CoordinateExtent = [[number, number], [number, number]];

/**
 * Relative origin of a node, `[0, 0]` = top-left, `[1, 1]` = bottom-right.
 */
export type NodeOrigin = [number, number];

export interface ResizeParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeParamsWithDirection extends ResizeParams {
  /**
   * Resize direction per axis: `0` = no change, `1` = increase, `-1` = decrease.
   */
  direction: number[];
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
export type ResizeControlDirection = 'horizontal' | 'vertical';

export const RESIZER_HANDLE_POSITIONS: ControlPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
export const RESIZER_LINE_POSITIONS: ControlLinePosition[] = ['top', 'right', 'bottom', 'left'];

export type ResizeDragEvent = D3DragEvent<HTMLElement, null, SubjectPosition>;

type ResizeHandler<Params = ResizeParams, Result = void> = (event: ResizeDragEvent, params: Params) => Result;

/**
 * Called before a resize is applied; return `false` to prevent it.
 */
export type ShouldResize = ResizeHandler<ResizeParamsWithDirection, boolean>;
export type OnResizeStart = ResizeHandler;
export type OnResize = ResizeHandler<ResizeParamsWithDirection>;
export type OnResizeEnd = ResizeHandler;
