import { PathData } from '../../interfaces/path-data.interface';
import { Point } from '../../interfaces/point.interface';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';

export function straightPath(source: Point, target: Point): PathData {
  return {
    path: `M ${source.x},${source.y}L ${target.x},${target.y}`,
    points: {
      start: getPointOnLineByRatio(source, target, 0.15),
      center: getPointOnLineByRatio(source, target, 0.5),
      end: getPointOnLineByRatio(source, target, 0.85),
    },
  };
}
