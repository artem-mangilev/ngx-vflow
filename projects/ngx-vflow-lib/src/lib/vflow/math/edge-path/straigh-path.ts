import { PathData } from '../../interfaces/path-data.interface';
import { Point } from '../../interfaces/point.interface';
import { UsingPoints } from '../../types/using-points.type';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';

export function straightPath(source: Point, target: Point, usingPoints: UsingPoints = [false, false, false]): PathData {
  const [start, center, end] = usingPoints;
  const nullPoint = { x: 0, y: 0 };

  return {
    path: `M ${source.x},${source.y}L ${target.x},${target.y}`,
    points: {
      start: start ? getPointOnLineByRatio(source, target, 0.15) : nullPoint,
      center: center ? getPointOnLineByRatio(source, target, 0.5) : nullPoint,
      end: end ? getPointOnLineByRatio(source, target, 0.85) : nullPoint,
    },
  };
}
