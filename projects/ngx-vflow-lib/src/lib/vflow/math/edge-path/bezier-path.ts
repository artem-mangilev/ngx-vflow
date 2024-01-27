import { Position } from "../../enums/position.enum";
import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'

// TODO check for vertical view and opposite direction of current
export function bezierPath(
  source: Point,
  target: Point,
  sourcePosition: Position,
  targetPosition: Position
) {
  if (sourcePosition === Position.left && targetPosition === Position.right) {
    return bezierPathLtr(source, target)
  }

  if (sourcePosition === Position.right && targetPosition === Position.left) {
    return bezierPathLtr(source, target)
  }

  if (sourcePosition === Position.bottom && targetPosition === Position.top) {
    return bezierPathBtt(source, target)
  }

  if (sourcePosition === Position.top && targetPosition === Position.bottom) {
    return bezierPathBtt(source, target)
  }

  return bezierPathLtr(source, target)
}

/**
 * Left-to-right
 */
function bezierPathLtr(source: Point, target: Point) {
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

    return path.toString()
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

  return path.toString()
}

/**
 * Bottom-to-top
 */
function bezierPathBtt(source: Point, target: Point) {
  const path = d3Path()

  const middleY = (source.y + target.y) / 2

  const firstControlX = source.x
  const firstControlY = middleY

  const secondControlX = target.x
  const secondControlY = middleY

  path.moveTo(source.x, source.y)
  path.bezierCurveTo(
    firstControlX, firstControlY,
    secondControlX, secondControlY,
    target.x, target.y
  )

  return path.toString()
}

