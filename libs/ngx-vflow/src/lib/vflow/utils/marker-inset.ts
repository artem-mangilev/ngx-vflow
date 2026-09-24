import { Marker } from '../interfaces/marker.interface';
import { Point } from '../interfaces/point.interface';
import { Position } from '../types/position.type';

/** Side of the marker viewBox (`-10 -10 20 20`), in marker units. */
const MARKER_VIEWBOX_SIZE = 20;

/** Default `markerWidth` and `markerHeight` of the flow markers. */
export const MARKER_DEFAULT_SIZE = 16.5;

/** Marker type of a marker without `type`. */
export const MARKER_DEFAULT_TYPE: NonNullable<Marker['type']> = 'arrow-closed';

/**
 * Marker units between the path end (`refX`) and the arrow tip, per marker type. The path stops this far before
 * the connection point so that the square end of the line is hidden while the tip touches the handle.
 *
 * A closed arrow hides the line under its fill, so the path ends at the base of the arrowhead, where the fill is
 * widest: a line up to half the marker width stays covered. An open arrow has nothing to hide the line with, so the
 * path runs through it and ends just short of the tip.
 */
const MARKER_TIP_INSET: Record<NonNullable<Marker['type']>, number> = {
  'arrow-closed': 7,
  arrow: 2,
};

/** Marker units between the path end (`refX`) and the arrow tip of `marker`. */
export function markerTipInset(marker: Marker): number {
  return MARKER_TIP_INSET[marker.type ?? MARKER_DEFAULT_TYPE];
}

/** Distance in flow units by which a path ends short of the arrow tip of `marker`, assuming `userSpaceOnUse`. */
export function markerInset(marker: Marker | undefined): number {
  return marker ? (markerTipInset(marker) * (marker.width ?? MARKER_DEFAULT_SIZE)) / MARKER_VIEWBOX_SIZE : 0;
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
