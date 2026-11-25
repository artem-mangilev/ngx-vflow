import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';

/** Internal: the flow converts with `VflowComponent.clientToFlowPosition()` / `flowToClientPosition()`. */
export interface ClientTransformOptions {
  /** Current flow translation and zoom. */
  viewport: ViewportState;
  /** Top-left position of the flow container in client space. */
  containerPosition: Point;
}

/** Converts a DOM client-space position to flow space. */
export function clientToFlowPosition(point: Point, { viewport, containerPosition }: ClientTransformOptions): Point {
  validateZoom(viewport.zoom);

  return {
    x: (point.x - containerPosition.x - viewport.x) / viewport.zoom,
    y: (point.y - containerPosition.y - viewport.y) / viewport.zoom,
  };
}

/** Converts a flow-space position to DOM client space. */
export function flowToClientPosition(point: Point, { viewport, containerPosition }: ClientTransformOptions): Point {
  validateZoom(viewport.zoom);

  return {
    x: containerPosition.x + viewport.x + point.x * viewport.zoom,
    y: containerPosition.y + viewport.y + point.y * viewport.zoom,
  };
}

function validateZoom(zoom: number): void {
  if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('zoom must be a positive finite number');
}
