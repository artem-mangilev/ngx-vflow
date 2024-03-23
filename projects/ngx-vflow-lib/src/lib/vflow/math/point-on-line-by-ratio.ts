import { Point } from "../interfaces/point.interface";

/**
 * Get point on line
 *
 * https://math.stackexchange.com/questions/563566/how-do-i-find-the-middle1-2-1-3-1-4-etc-of-a-line
 */
export function getPointOnLineByRatio(start: Point, end: Point, ratio: number): Point {
  return {
    x: (1 - ratio) * start.x + ratio * end.x,
    y: (1 - ratio) * start.y + ratio * end.y,
  };
}
