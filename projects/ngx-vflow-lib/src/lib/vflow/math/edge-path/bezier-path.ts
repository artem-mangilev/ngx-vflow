import { PathData } from '../../interfaces/path-data.interface';
import { Point } from '../../interfaces/point.interface';
import { Path, path as d3Path } from 'd3-path';
import { UsingPoints } from '../../types/using-points.type';
import { Position } from '../../types/position.type';

export function bezierPath(
  source: Point,
  target: Point,
  sourcePosition: Position,
  targetPosition: Position,
  usingPoints: UsingPoints = [false, false, false]
): PathData {
  const path = d3Path();

  path.moveTo(source.x, source.y);

  let distance = { x: source.x - target.x, y: source.y - target.y };

  const firstControl = calcControlPoint(source, sourcePosition, distance);
  const secondControl = calcControlPoint(target, targetPosition, distance);

  path.bezierCurveTo(
    firstControl.x,
    firstControl.y,
    secondControl.x,
    secondControl.y,
    target.x,
    target.y
  );
  return getPathData(
    path,
    source,
    target,
    firstControl,
    secondControl,
    usingPoints
  );
}

/**
 * Calculate control point based on provided point
 *
 * @param point relative this point control point is gonna be computed (the source or the target)
 * @param pointPosition position of {point} on block
 * @param distance Transmits the distance between the source and the target as x and y coordinates
 * @returns
 */

function calcControlPoint(
  point: Point,
  pointPosition: Position,
  distance: Point
) {
  let factorPoint = { x: 0, y: 0 };

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

  distance = {
    x: distance.x * Math.abs(factorPoint.x),
    y: distance.y * Math.abs(factorPoint.y),
  };
  // TODO: probably need to make this configurable
  const curvature = 0.25;
  // thanks colleagues from react/svelte world
  // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
  const controlOffset =
    curvature * 25 * Math.sqrt(Math.abs(distance.x + distance.y));

  return {
    x: point.x + factorPoint.x * controlOffset,
    y: point.y - factorPoint.y * controlOffset,
  };
}

function getPathData(
  path: Path,
  source: Point,
  target: Point,
  firstControl: Point,
  secondControl: Point,
  usingPoints: UsingPoints
): PathData {
  const [start, center, end] = usingPoints;

  const nullPoint = { x: 0, y: 0 };

  return {
    path: path.toString(),
    points: {
      start: start
        ? getPointOnBezier(source, target, firstControl, secondControl, 0.1)
        : nullPoint,
      center: center
        ? getPointOnBezier(source, target, firstControl, secondControl, 0.5)
        : nullPoint,
      end: end
        ? getPointOnBezier(source, target, firstControl, secondControl, 0.9)
        : nullPoint,
    },
  };
}

/**
 * Get point on bezier curve by ratio
 */
function getPointOnBezier(
  sourcePoint: Point,
  targetPoint: Point,
  controlPoint1: Point,
  controlPoint2: Point,
  ratio: number
): Point {
  const fromSourceToFirstControl: Point = getPointOnLine(
    sourcePoint,
    controlPoint1,
    ratio
  );
  const fromFirstControlToSecond: Point = getPointOnLine(
    controlPoint1,
    controlPoint2,
    ratio
  );
  const fromSecondControlToTarget: Point = getPointOnLine(
    controlPoint2,
    targetPoint,
    ratio
  );

  return getPointOnLine(
    getPointOnLine(fromSourceToFirstControl, fromFirstControlToSecond, ratio),
    getPointOnLine(fromFirstControlToSecond, fromSecondControlToTarget, ratio),
    ratio
  );
}

/**
 * Get point on line
 *
 * https://math.stackexchange.com/questions/563566/how-do-i-find-the-middle1-2-1-3-1-4-etc-of-a-line
 */
function getPointOnLine(start: Point, end: Point, ratio: number): Point {
  return {
    x: (1 - ratio) * start.x + ratio * end.x,
    y: (1 - ratio) * start.y + ratio * end.y,
  };
}
