import { CurveFactoryParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';
import { Point } from '../../interfaces/point.interface';

export function quadraticPath(pathParams: CurveFactoryParams): CurveLayout {
  const distance = (pathParams.mode === 'edge' && pathParams.edge.data?.().distance) || 15;
  const { sourcePoint, targetPoint } = pathParams;

  const controlPoint = calcControlPoint(sourcePoint, targetPoint, distance);

  return {
    path: `M ${sourcePoint.x},${sourcePoint.y}Q ${controlPoint.x},${controlPoint.y} ${targetPoint.x},${targetPoint.y}`,
    labelPoints: {
      start: getPointOnBezier(sourcePoint, targetPoint, controlPoint, 0.15),
      center: getPointOnBezier(sourcePoint, targetPoint, controlPoint, 0.5),
      end: getPointOnBezier(sourcePoint, targetPoint, controlPoint, 0.85),
    },
  };
}

function calcControlPoint(sourcePoint: Point, targetPoint: Point, distance = 15) {
  const edgeLenth = Math.sqrt(Math.pow(sourcePoint.x - targetPoint.x, 2) + Math.pow(sourcePoint.y - targetPoint.y, 2));

  return {
    x: (sourcePoint.x + targetPoint.x) / 2 + ((targetPoint.y - sourcePoint.y) / edgeLenth) * distance,
    y: (sourcePoint.y + targetPoint.y) / 2 - ((targetPoint.x - sourcePoint.x) / edgeLenth) * distance,
  };
}

function getPointOnBezier(sourcePoint: Point, targetPoint: Point, controlPoint: Point, ratio: number): Point {
  const fromSourceToControl: Point = getPointOnLineByRatio(sourcePoint, controlPoint, ratio);
  const fromControlToTarget: Point = getPointOnLineByRatio(controlPoint, targetPoint, ratio);
  return getPointOnLineByRatio(fromSourceToControl, fromControlToTarget, ratio);
}
