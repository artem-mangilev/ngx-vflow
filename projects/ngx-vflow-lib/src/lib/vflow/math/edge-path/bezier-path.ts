import { PathData } from '../../interfaces/path-data.interface';
import { Point } from '../../interfaces/point.interface';
import { Position } from '../../types/position.type';
import { getPointOnLineByRatio } from '../point-on-line-by-ratio';

export function bezierPath(source: Point, target: Point, sourcePosition: Position, targetPosition: Position): PathData {
  const distanceVector = { x: source.x - target.x, y: source.y - target.y };

  const sourceControl = calcControlPoint(source, sourcePosition, distanceVector);
  const targetControl = calcControlPoint(target, targetPosition, distanceVector);

  const path = `M${source.x},${source.y} C${sourceControl.x},${sourceControl.y} ${targetControl.x},${targetControl.y} ${target.x},${target.y}`;

  return getPathData(path, source, target, sourceControl, targetControl);
}

/**
 * Calculate control point based on provided point
 *
 * @param point relative this point control point is gonna be computed (the source or the target)
 * @param pointPosition position of {point} on block
 * @param distanceVector transmits the distance between the source and the target as x and y coordinates
 */

function calcControlPoint(point: Point, pointPosition: Position, distanceVector: Point) {
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

  // TODO: probably need to make this configurable
  const curvature = 0.25;
  // thanks colleagues from react/svelte world
  // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
  const controlOffset = curvature * 25 * Math.sqrt(Math.abs(fullDistanceVector.x + fullDistanceVector.y));

  return {
    x: point.x + factorPoint.x * controlOffset,
    y: point.y - factorPoint.y * controlOffset,
  };
}

function getPathData(path: string, source: Point, target: Point, sourceControl: Point, targetControl: Point): PathData {
  return {
    path,
    points: {
      start: getPointOnBezier(source, target, sourceControl, targetControl, 0.1),
      center: getPointOnBezier(source, target, sourceControl, targetControl, 0.5),
      end: getPointOnBezier(source, target, sourceControl, targetControl, 0.9),
    },
  };
}

/**
 * Get point on bezier curve by ratio
 */
function getPointOnBezier(
  sourcePoint: Point,
  targetPoint: Point,
  sourceControl: Point,
  targetControl: Point,
  ratio: number,
): Point {
  const fromSourceToFirstControl: Point = getPointOnLineByRatio(sourcePoint, sourceControl, ratio);
  const fromFirstControlToSecond: Point = getPointOnLineByRatio(sourceControl, targetControl, ratio);
  const fromSecondControlToTarget: Point = getPointOnLineByRatio(targetControl, targetPoint, ratio);

  return getPointOnLineByRatio(
    getPointOnLineByRatio(fromSourceToFirstControl, fromFirstControlToSecond, ratio),
    getPointOnLineByRatio(fromFirstControlToSecond, fromSecondControlToTarget, ratio),
    ratio,
  );
}
