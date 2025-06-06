import { CurveFactoryParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';

export function straightPath({ sourcePoint, targetPoint }: CurveFactoryParams): CurveLayout {
  return {
    path: `M ${sourcePoint.x},${sourcePoint.y}L ${targetPoint.x},${targetPoint.y}`,
    labelPoints: {
      start: getPointOnLineByRatio(sourcePoint, targetPoint, 0.15),
      center: getPointOnLineByRatio(sourcePoint, targetPoint, 0.5),
      end: getPointOnLineByRatio(sourcePoint, targetPoint, 0.85),
    },
  };
}
