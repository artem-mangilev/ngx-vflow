import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';

/**
 * Viewport arithmetic. A viewport maps a flow point to a pane point as `pane = flow * zoom + (x, y)`;
 * pane points are relative to the pane's padding box.
 */

/** Converts a pane point to flow space. */
export function toFlowPoint(state: ViewportState, pane: Point): Point {
  return { x: (pane.x - state.x) / state.zoom, y: (pane.y - state.y) / state.zoom };
}

/** Converts a flow point to pane space. */
export function toPanePoint(state: ViewportState, flow: Point): Point {
  return { x: flow.x * state.zoom + state.x, y: flow.y * state.zoom + state.y };
}

export function clampZoom(zoom: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, zoom));
}

/** Keeps the state's zoom and translates it so that `flow` lies under the pane point `pane`. */
export function placeFlowPoint(zoom: number, pane: Point, flow: Point): ViewportState {
  return { zoom, x: pane.x - flow.x * zoom, y: pane.y - flow.y * zoom };
}

/** Changes the zoom while the flow point under the pane point `anchor` stays in place. */
export function zoomAround(state: ViewportState, zoom: number, anchor: Point): ViewportState {
  return zoom === state.zoom ? state : placeFlowPoint(zoom, anchor, toFlowPoint(state, anchor));
}

/** Moves the viewport by a pane-space distance. */
export function translateBy(state: ViewportState, dx: number, dy: number): ViewportState {
  return dx === 0 && dy === 0 ? state : { zoom: state.zoom, x: state.x + dx, y: state.y + dy };
}

/** Position of a client point relative to the element's padding box. */
export function panePointFromClient(element: Element, client: Point): Point {
  const rect = element.getBoundingClientRect();
  return { x: client.x - rect.left - element.clientLeft, y: client.y - rect.top - element.clientTop };
}
