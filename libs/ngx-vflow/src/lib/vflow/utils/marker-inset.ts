import { Marker } from '../interfaces/marker.interface';
import { Point } from '../interfaces/point.interface';
import { Position } from '../types/position.type';

/** Side of the marker viewBox (`-10 -10 20 20`), in marker units. */
const MARKER_VIEWBOX_SIZE = 20;

/** Default `markerWidth` and `markerHeight` of the flow markers. */
export const MARKER_DEFAULT_SIZE = 16.5;

/**
 * Marker units between the path end (`refX`) and the arrow tip. The path stops this far before the connection
 * point, so the square end of the line is hidden under the arrowhead while the tip touches the handle.
 */
export const MARKER_TIP_INSET = 2;

/** Distance in flow units by which a path ends short of the arrow tip of `marker`, assuming `userSpaceOnUse`. */
export function markerInset(marker: Marker | undefined): number {
  return marker ? (MARKER_TIP_INSET * (marker.width ?? MARKER_DEFAULT_SIZE)) / MARKER_VIEWBOX_SIZE : 0;
}

/** Moves a handle point away from its node by `distance` along the axis of `position`. */
export function insetPoint(point: Point, position: Position, distance: number): Point {
  switch (position) {
    case 'left':
      return { x: point.x - distance, y: point.y };
    case 'right':
      return { x: point.x + distance, y: point.y };
    case 'top':
      return { x: point.x, y: point.y - distance };
    case 'bottom':
      return { x: point.x, y: point.y + distance };
  }
}
