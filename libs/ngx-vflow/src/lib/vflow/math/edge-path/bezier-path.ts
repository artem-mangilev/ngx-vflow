import { BezierPathParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { Point } from '../../interfaces/point.interface';
import { Position } from '../../types/position.type';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';
import { getBoundsOfPoints } from '../../utils/rect';
import { EdgeLabelPoint } from '../../interfaces/edge-label.interface';
import { directionAngle } from '../direction-angle';

/** Builds a cubic bezier SVG edge path and its label positions. */
export function getBezierPath({
  sourcePoint,
  targetPoint,
  sourcePosition,
  targetPosition,
  curvature = 0.25,
}: BezierPathParams): CurveLayout {
  const distanceVector = { x: sourcePoint.x - targetPoint.x, y: sourcePoint.y - targetPoint.y };

  const sourceControl = calcControlPoint(sourcePoint, sourcePosition, distanceVector, curvature);
  const targetControl = calcControlPoint(targetPoint, targetPosition, distanceVector, curvature);

  const path = `M${sourcePoint.x},${sourcePoint.y} C${sourceControl.x},${sourceControl.y} ${targetControl.x},${targetControl.y} ${targetPoint.x},${targetPoint.y}`;

  return getPathData(path, sourcePoint, targetPoint, sourceControl, targetControl);
}

/**
 * Calculate control point based on provided point
 *
 * @param point relative this point control point is gonna be computed (the source or the target)
 * @param pointPosition position of {point} on block
 * @param distanceVector transmits the distance between the source and the target as x and y coordinates
 */

function calcControlPoint(point: Point, pointPosition: Position, distanceVector: Point, curvature: number) {
  const factorPoint = { x: 0, y: 0 };

  switch (pointPosition) {
    case 'top':
      factorPoint.y = 1;
      break;
    case 'bottom':
      factorPoint.y = -1;
      break;
    case 'right':
      factorPoint.x = 1;
      break;
    case 'left':
      factorPoint.x = -1;
      break;
  }

  // TODO: explain name
  const fullDistanceVector = {
    x: distanceVector.x * Math.abs(factorPoint.x),
    y: distanceVector.y * Math.abs(factorPoint.y),
  };

  const controlOffset = curvature * 25 * Math.sqrt(Math.abs(fullDistanceVector.x + fullDistanceVector.y));

  return {
    x: point.x + factorPoint.x * controlOffset,
    y: point.y - factorPoint.y * controlOffset,
  };
}

function getPathData(
  path: string,
  source: Point,
  target: Point,
  sourceControl: Point,
  targetControl: Point,
): CurveLayout {
  return {
    path,
    bounds: getBoundsOfPoints([source, sourceControl, targetControl, target]),
    labelPoints: {
      start: getPointOnBezier(source, target, sourceControl, targetControl, 0.1),
      center: getPointOnBezier(source, target, sourceControl, targetControl, 0.5),
      end: getPointOnBezier(source, target, sourceControl, targetControl, 0.9),
    },
  };
}

/**
 * Point on the bezier curve at `ratio` and the direction of the curve there, by de Casteljau: the last two
 * intermediate points span the tangent.
 */
function getPointOnBezier(
  sourcePoint: Point,
  targetPoint: Point,
  sourceControl: Point,
  targetControl: Point,
  ratio: number,
): EdgeLabelPoint {
  const fromSourceToFirstControl: Point = getPointOnLineByRatio(sourcePoint, sourceControl, ratio);
  const fromFirstControlToSecond: Point = getPointOnLineByRatio(sourceControl, targetControl, ratio);
  const fromSecondControlToTarget: Point = getPointOnLineByRatio(targetControl, targetPoint, ratio);
  const tangentStart = getPointOnLineByRatio(fromSourceToFirstControl, fromFirstControlToSecond, ratio);
  const tangentEnd = getPointOnLineByRatio(fromFirstControlToSecond, fromSecondControlToTarget, ratio);

  return {
    ...getPointOnLineByRatio(tangentStart, tangentEnd, ratio),
    angle: directionAngle(tangentStart, tangentEnd),
  };
}
