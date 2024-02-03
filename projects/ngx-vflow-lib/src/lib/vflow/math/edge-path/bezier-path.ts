import { Position } from "../../enums/position.enum";
import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { Path, path as d3Path } from 'd3-path'
import { UsingPoints } from "../../types/using-points.type";

export function bezierPath(
  source: Point,
  target: Point,
  sourcePosition: Position,
  targetPosition: Position,
  usingPoints: UsingPoints
): PathData {
  if (sourcePosition === Position.left && targetPosition === Position.right) {
    return bezierPathRtl(source, target, usingPoints)
  }

  if (sourcePosition === Position.right && targetPosition === Position.left) {
    return bezierPathLtr(source, target, usingPoints)
  }

  if (sourcePosition === Position.bottom && targetPosition === Position.top) {
    return bezierPathTtb(source, target, usingPoints)
  }

  if (sourcePosition === Position.top && targetPosition === Position.bottom) {
    return bezierPathBtt(source, target, usingPoints)
  }

  throw new Error('Unhandled combination of sourcePosition and targetPosition')
}

/**
 * Left-to-right direction
 */
function bezierPathLtr(source: Point, target: Point, usingPoints: UsingPoints): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  let firstControl: Point
  let secondControl: Point

  if (source.x > target.x) {
    const distance = source.x - target.x

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    firstControl = { x: source.x + controlOffset, y: source.y }
    secondControl = { x: target.x - controlOffset, y: target.y }
  } else {
    const middleX = (source.x + target.x) / 2

    firstControl = { x: middleX, y: source.y }
    secondControl = { x: middleX, y: target.y }
  }

  path.bezierCurveTo(
    firstControl.x, firstControl.y,
    secondControl.x, secondControl.y,
    target.x, target.y
  )

  return getPathData(path, source, target, firstControl, secondControl, usingPoints)
}

/**
 * Right-to-left direction
 */
function bezierPathRtl(source: Point, target: Point, usingPoints: UsingPoints): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  let firstControl: Point
  let secondControl: Point

  if (source.x < target.x) {
    const distance = target.x - source.x

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    firstControl = { x: source.x - controlOffset, y: source.y }
    secondControl = { x: target.x + controlOffset, y: target.y }
  } else {
    const middleX = (source.x + target.x) / 2

    firstControl = { x: middleX, y: source.y }
    secondControl = { x: middleX, y: target.y }
  }

  path.bezierCurveTo(
    firstControl.x, firstControl.y,
    secondControl.x, secondControl.y,
    target.x, target.y
  )

  return getPathData(path, source, target, firstControl, secondControl, usingPoints)
}

/**
 * Bottom-to-top
 */
function bezierPathBtt(source: Point, target: Point, usingPoints: UsingPoints): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  let firstControl: Point
  let secondControl: Point

  if (source.y < target.y) {
    const distance = target.y - source.y

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    firstControl = { x: source.x, y: source.y - controlOffset }
    secondControl = { x: target.x, y: target.y + controlOffset }
  } else {
    const middleY = (source.y + target.y) / 2

    firstControl = { x: source.x, y: middleY }
    secondControl = { x: target.x, y: middleY }
  }

  path.bezierCurveTo(
    firstControl.x, firstControl.y,
    secondControl.x, secondControl.y,
    target.x, target.y
  )

  return getPathData(path, source, target, firstControl, secondControl, usingPoints)
}

/**
 * Top to bottom
 */
function bezierPathTtb(source: Point, target: Point, usingPoints: UsingPoints): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  let firstControl: Point
  let secondControl: Point

  if (source.y > target.y) {
    const distance = source.y - target.y

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    firstControl = { x: source.x, y: source.y + controlOffset }
    secondControl = { x: target.x, y: target.y - controlOffset }
  } else {
    const middleY = (source.y + target.y) / 2

    firstControl = { x: source.x, y: middleY }
    secondControl = { x: target.x, y: middleY }
  }

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
