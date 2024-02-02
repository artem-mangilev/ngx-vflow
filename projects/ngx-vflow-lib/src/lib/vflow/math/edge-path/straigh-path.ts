import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'

// TODO: we should not compute not used points on path
export function straightPath(source: Point, target: Point): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)
  path.lineTo(target.x, target.y)

  return {
    path: path.toString(),
    startPoint: getPointByRatio(source, target, .15),
    centerPoint: {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2
    },
    endPoint: getPointByRatio(source, target, .85)
  }
}

function getPointByRatio(source: Point, target: Point, ratio: number) {
  return {
    x: source.x + (target.x - source.x) * ratio,
    y: source.y + (target.y - source.y) * ratio,
  }
}
