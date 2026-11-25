import { CurveLayout, StraightPathParams } from '../../interfaces/curve-factory.interface';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';
import { getBoundsOfPoints } from '../../utils/rect';
import { directionAngle } from '../direction-angle';

/** Builds a straight SVG edge path and its label positions. */
export function getStraightPath({ sourcePoint, targetPoint }: StraightPathParams): CurveLayout {
  const angle = directionAngle(sourcePoint, targetPoint);

  return {
    path: `M ${sourcePoint.x},${sourcePoint.y}L ${targetPoint.x},${targetPoint.y}`,
    bounds: getBoundsOfPoints([sourcePoint, targetPoint]),
    labelPoints: {
      start: { ...getPointOnLineByRatio(sourcePoint, targetPoint, 0.15), angle },
      center: { ...getPointOnLineByRatio(sourcePoint, targetPoint, 0.5), angle },
      end: { ...getPointOnLineByRatio(sourcePoint, targetPoint, 0.85), angle },
    },
  };
}
