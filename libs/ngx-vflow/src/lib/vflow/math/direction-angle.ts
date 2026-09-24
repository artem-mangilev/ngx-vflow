import { Point } from '../interfaces/point.interface';

/** Direction from `from` to `to` in degrees of flow space: `0` points right, `90` points down. */
export function directionAngle(from: Point, to: Point): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}
