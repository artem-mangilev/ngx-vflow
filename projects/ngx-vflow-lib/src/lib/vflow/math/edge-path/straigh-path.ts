import { CurveLayout, StraightPathParams } from '../../interfaces/curve-factory.interface';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';

/** Builds a straight SVG edge path and its label positions. */
export function getStraightPath({ sourcePoint, targetPoint }: StraightPathParams): CurveLayout {
  return {
    path: `M ${sourcePoint.x},${sourcePoint.y}L ${targetPoint.x},${targetPoint.y}`,
    labelPoints: {
      start: getPointOnLineByRatio(sourcePoint, targetPoint, 0.15),
      center: getPointOnLineByRatio(sourcePoint, targetPoint, 0.5),
      end: getPointOnLineByRatio(sourcePoint, targetPoint, 0.85),
    },
  };
}
