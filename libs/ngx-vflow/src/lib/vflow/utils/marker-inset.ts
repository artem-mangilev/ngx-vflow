import { MARKER_DEFAULT_TYPE, Marker, MarkerRef } from '../interfaces/marker.interface';
import { MarkerShape } from '../interfaces/marker-shape.interface';
import { Point } from '../interfaces/point.interface';
import { Position } from '../types/position.type';

/** Side of the marker viewBox (`-10 -10 20 20`), in marker units. */
export const MARKER_VIEWBOX_SIZE = 20;

/** Default `markerWidth` and `markerHeight` of the flow markers. */
export const MARKER_DEFAULT_SIZE = 16.5;

/** Default stroke width of the marker shapes in flow units: the width of the default edge line. */
export const MARKER_DEFAULT_STROKE_WIDTH = 2;

/** Rendered size of a marker in flow units: one given side sets both, none gives the default square. */
export function markerSize(marker: Marker): { width: number; height: number } {
  return {
    width: marker.width ?? marker.height ?? MARKER_DEFAULT_SIZE,
    height: marker.height ?? marker.width ?? MARKER_DEFAULT_SIZE,
  };
}

/** Flow units per marker unit: the viewBox scales uniformly to the smaller side of the marker. */
export function markerScale(marker: Marker): number {
  const { width, height } = markerSize(marker);

  return Math.min(width, height) / MARKER_VIEWBOX_SIZE;
}

/** `stroke-width` of the shapes of `marker` in marker units, so that it renders as `strokeWidth` flow units. */
export function markerStrokeWidth(marker: Marker): number {
  return (marker.strokeWidth ?? MARKER_DEFAULT_STROKE_WIDTH) / markerScale(marker);
}

/**
 * Marker units between the path end (`refX`) and the arrow tip, per built-in shape. The path stops this far before
 * the connection point so that the square end of the line is hidden while the tip touches the handle.
 *
 * A closed arrow hides the line under its fill, so the path ends at the base of the arrowhead, where the fill is
 * widest: a line up to half the marker width stays covered. An open arrow has nothing to hide the line with, so the
 * path runs through it and ends just short of the tip.
 */
const BUILT_IN_TIP_INSET: Record<string, number> = {
  'arrow-closed': 7,
  arrow: 2,
};

/** Shapes the application declares, by type. */
export type MarkerShapes = ReadonlyMap<string, MarkerShape>;

/**
 * Marker units between the path end (`refX`) and the tip of the shape of `marker`: built in for the library
 * shapes, declared by the application for its own, `0` for a shape the flow does not know.
 */
export function markerTipInset(marker: Marker, shapes?: MarkerShapes): number {
  const type = marker.type ?? MARKER_DEFAULT_TYPE;

  return BUILT_IN_TIP_INSET[type] ?? shapes?.get(type)?.inset ?? 0;
}

/** Distance in flow units by which a path ends short of the tip of `marker`, assuming `userSpaceOnUse`. */
export function markerInset(ref: MarkerRef | undefined, shapes?: MarkerShapes): number {
  if (!ref) {
    return 0;
  }

  const marker = typeof ref === 'string' ? { type: ref } : ref;

  return markerTipInset(marker, shapes) * markerScale(marker);
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
