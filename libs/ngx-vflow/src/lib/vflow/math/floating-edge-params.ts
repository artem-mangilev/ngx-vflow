import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';
import { Position } from '../types/position.type';
import { insetPoint } from '../utils/marker-inset';

export interface FloatingEdgeParams {
  sourcePoint: Point;
  targetPoint: Point;
  sourcePosition: Position;
  targetPosition: Position;
}

export interface FloatingEdgeOptions {
  /** Distance by which each endpoint moves away from its rectangle, for example `markerInset` of the curve params. */
  inset?: { start?: number; end?: number };
}

/**
 * Endpoints and sides of an edge between two rectangles that does not use fixed handles: each endpoint is where the
 * segment between the centers crosses the border of its rectangle, and the side is the border it crosses. A
 * rectangle without size, such as the pointer of a connection in progress, yields its own position.
 */
export function getFloatingEdgeParams(
  source: Rect,
  target: Rect,
  options: FloatingEdgeOptions = {},
): FloatingEdgeParams {
  const sourceCenter = center(source);
  const targetCenter = center(target);
  const start = borderPoint(source, sourceCenter, targetCenter);
  const end = borderPoint(target, targetCenter, sourceCenter);

  return {
    sourcePoint: insetPoint(start.point, start.position, options.inset?.start ?? 0),
    targetPoint: insetPoint(end.point, end.position, options.inset?.end ?? 0),
    sourcePosition: start.position,
    targetPosition: end.position,
  };
}

function center(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/** Where the ray from `from` (the center of `rect`) towards `to` leaves `rect`, and the side it leaves through. */
function borderPoint(rect: Rect, from: Point, to: Point): { point: Point; position: Position } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  if (dx === 0 && dy === 0) {
    return { point: from, position: 'top' };
  }

  // Scale of the direction vector at which the ray reaches a vertical or a horizontal border.
  const toVertical = dx === 0 ? Infinity : halfWidth / Math.abs(dx);
  const toHorizontal = dy === 0 ? Infinity : halfHeight / Math.abs(dy);

  if (toVertical <= toHorizontal) {
    const position: Position = dx > 0 ? 'right' : 'left';
    return { point: { x: from.x + Math.sign(dx) * halfWidth, y: from.y + dy * toVertical }, position };
  }

  const position: Position = dy > 0 ? 'bottom' : 'top';
  return { point: { x: from.x + dx * toHorizontal, y: from.y + Math.sign(dy) * halfHeight }, position };
}
