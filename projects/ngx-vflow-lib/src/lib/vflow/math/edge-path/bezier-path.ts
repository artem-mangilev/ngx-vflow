import { Position } from "../../enums/position.enum";
import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'

export function bezierPath(
  source: Point,
  target: Point,
  sourcePosition: Position,
  targetPosition: Position
): PathData {
  if (sourcePosition === Position.left && targetPosition === Position.right) {
    return bezierPathRtl(source, target)
  }

  if (sourcePosition === Position.right && targetPosition === Position.left) {
    return bezierPathLtr(source, target)
  }

  if (sourcePosition === Position.bottom && targetPosition === Position.top) {
    return bezierPathTtb(source, target)
  }

  if (sourcePosition === Position.top && targetPosition === Position.bottom) {
    return bezierPathBtt(source, target)
  }

  throw new Error('Unhandled combination of sourcePosition and targetPosition')
}

/**
 * Left-to-right direction
 */
function bezierPathLtr(source: Point, target: Point): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  if (source.x > target.x) {
    const distance = source.x - target.x

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    const firstControlX = source.x + controlOffset
    const firstControlY = source.y

    const secondControlX = target.x - controlOffset
    const secondControlY = target.y

    path.bezierCurveTo(
      firstControlX, firstControlY,
      secondControlX, secondControlY,
      target.x, target.y
    )

    return {
      path: path.toString(),
      startPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .10
      ),
      centerPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .50
      ),
      endPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .90
      ),
    }
  }

  const middleX = (source.x + target.x) / 2

  const firstControlX = middleX
  const firstControlY = source.y

  const secondControlX = middleX
  const secondControlY = target.y

  path.bezierCurveTo(
    firstControlX, firstControlY,
    secondControlX, secondControlY,
    target.x, target.y
  )

  return {
    path: path.toString(),
    startPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .10
    ),
    centerPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .50
    ),
    endPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .90
    ),
  }
}

/**
 * Right-to-left direction
 */
function bezierPathRtl(source: Point, target: Point): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  if (source.x < target.x) {
    const distance = target.x - source.x

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    const firstControlX = source.x - controlOffset
    const firstControlY = source.y

    const secondControlX = target.x + controlOffset
    const secondControlY = target.y

    path.bezierCurveTo(
      firstControlX, firstControlY,
      secondControlX, secondControlY,
      target.x, target.y
    )

    return {
      path: path.toString(),
      startPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .10
      ),
      centerPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .50
      ),
      endPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .90
      ),
    }
  }

  const middleX = (source.x + target.x) / 2

  const firstControlX = middleX
  const firstControlY = source.y

  const secondControlX = middleX
  const secondControlY = target.y

  path.bezierCurveTo(
    firstControlX, firstControlY,
    secondControlX, secondControlY,
    target.x, target.y
  )

  return {
    path: path.toString(),
    startPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .10
    ),
    centerPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .50
    ),
    endPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .90
    ),
  }
}

/**
 * Bottom-to-top
 */
function bezierPathBtt(source: Point, target: Point): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  if (source.y < target.y) {
    const distance = target.y - source.y

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    const firstControlX = source.x
    const firstControlY = source.y - controlOffset

    const secondControlX = target.x
    const secondControlY = target.y + controlOffset

    path.bezierCurveTo(
      firstControlX, firstControlY,
      secondControlX, secondControlY,
      target.x, target.y
    )

    return {
      path: path.toString(),
      startPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .10
      ),
      centerPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .50
      ),
      endPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .90
      ),
    }
  }

  const middleY = (source.y + target.y) / 2

  const firstControlX = source.x
  const firstControlY = middleY

  const secondControlX = target.x
  const secondControlY = middleY

  path.bezierCurveTo(
    firstControlX, firstControlY,
    secondControlX, secondControlY,
    target.x, target.y
  )

  return {
    path: path.toString(),
    startPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .10
    ),
    centerPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .50
    ),
    endPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .90
    ),
  }
}

/**
 * Top to bottom
 */
function bezierPathTtb(source: Point, target: Point): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)

  if (source.y > target.y) {
    const distance = source.y - target.y

    // TODO: probably need to make this configurable
    const curvature = .25
    // thanks colleagues from react/svelte world
    // https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/system/src/utils/edges/bezier-edge.ts#L56
    const controlOffset = curvature * 25 * Math.sqrt(distance)

    const firstControlX = source.x
    const firstControlY = source.y + controlOffset

    const secondControlX = target.x
    const secondControlY = target.y - controlOffset

    path.bezierCurveTo(
      firstControlX, firstControlY,
      secondControlX, secondControlY,
      target.x, target.y
    )

    return {
      path: path.toString(),
      startPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .10
      ),
      centerPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .50
      ),
      endPoint: getPointOnBezier(
        source,
        target,
        { x: firstControlX, y: firstControlY },
        { x: secondControlX, y: secondControlY },
        .90
      ),
    }
  }

  const middleY = (source.y + target.y) / 2

  const firstControlX = source.x
  const firstControlY = middleY

  const secondControlX = target.x
  const secondControlY = middleY

  path.bezierCurveTo(
    firstControlX, firstControlY,
    secondControlX, secondControlY,
    target.x, target.y
  )

  return {
    path: path.toString(),
    startPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .10
    ),
    centerPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .50
    ),
    endPoint: getPointOnBezier(
      source,
      target,
      { x: firstControlX, y: firstControlY },
      { x: secondControlX, y: secondControlY },
      .90
    ),
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
