
import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { Path, path as d3Path } from 'd3-path'
import { UsingPoints } from "../../types/using-points.type";
import { Position } from "../../types/position.type";

    let operantSourceX = 0
    let operantSourceY = 0
    let operantTargetX = 0
    let operantTargetY = 0

export function bezierPath(
  source: Point,
  target: Point,
  sourcePosition: Position,
  targetPosition: Position,
  usingPoints: UsingPoints
): PathData {

    switch(sourcePosition) {
        case "top": operantSourceY = 1;
        break;
        case "bottom": operantSourceY = -1;
        break;
        case "right": operantSourceX = -1;
        break;
        case "left": operantSourceX = 1;
        break;
    }

        switch(targetPosition) {
        case "top": operantTargetY = -1;
        break;
        case "bottom": operantTargetY = 1;
        break;
        case "right": operantTargetX = 1;
        break;
        case "left": operantTargetX = -1;
        break;
    }

    return bezierPathTo(source, target, usingPoints)

  throw new Error('Unhandled combination of sourcePosition and targetPosition')
}

/**
 * Bezier curve construction function
 */

function bezierPathTo(source: Point, target: Point, usingPoints: UsingPoints): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  let firstControl: Point
  let secondControl: Point

    const distanceSource = (source.x - target.x) * Math.abs(operantSourceX) + (source.y - target.y) * Math.abs(operantSourceY)
    const distanceTarget = (source.x - target.x) * Math.abs(operantTargetX) + (source.y - target.y) * Math.abs(operantTargetY)

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(Math.abs(distanceSource))

    firstControl = { x: source.x - operantSourceX * controlOffset, y: source.y - operantSourceY * controlOffset }
    secondControl = { x: target.x + operantTargetX * controlOffset, y: target.y + operantTargetY * controlOffset }

  path.bezierCurveTo(
    firstControl.x, firstControl.y,
    secondControl.x, secondControl.y,
    target.x, target.y
  )

  return getPathData(path, source, target, firstControl, secondControl, usingPoints)
}

function getPathData(
  path: Path,
  source: Point,
  target: Point,
  firstControl: Point,
  secondControl: Point,
  usingPoints: UsingPoints
): PathData {
  const [start, center, end] = usingPoints

  const nullPoint = { x: 0, y: 0 }

  return {
    path: path.toString(),
    points: {
      start: start ? getPointOnBezier(source, target, firstControl, secondControl, .10) : nullPoint,
      center: center ? getPointOnBezier(source, target, firstControl, secondControl, .50) : nullPoint,
      end: end ? getPointOnBezier(source, target, firstControl, secondControl, .90) : nullPoint,
    }
  }
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
  const fromSourceToFirstControl: Point = getPointOnLine(sourcePoint, controlPoint1, ratio);
  const fromFirstControlToSecond: Point = getPointOnLine(controlPoint1, controlPoint2, ratio);
  const fromSecondControlToTarget: Point = getPointOnLine(controlPoint2, targetPoint, ratio);

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
    x: ((1 - ratio) * start.x) + ((ratio) * end.x),
    y: ((1 - ratio) * start.y) + (ratio * end.y),
  };
}
