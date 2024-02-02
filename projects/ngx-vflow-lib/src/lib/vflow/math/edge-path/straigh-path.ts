import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'
import { UsingPoints } from "../../types/using-points.type";

// TODO: we should not compute not used points on path
export function straightPath(source: Point, target: Point, usingPoints: UsingPoints): PathData {
  const [start, center, end] = usingPoints
  const nullPoint = { x: 0, y: 0 }

  const path = d3Path()

  path.moveTo(source.x, source.y)
  path.lineTo(target.x, target.y)

  return {
    path: path.toString(),
    points: {
      start: start ? getPointByRatio(source, target, .15) : nullPoint,
      center: center ? getPointByRatio(source, target, .50) : nullPoint,
      end: end ? getPointByRatio(source, target, .85) : nullPoint,
    }
  }
}

function getPointByRatio(source: Point, target: Point, ratio: number) {
  return {
    x: source.x + (target.x - source.x) * ratio,
    y: source.y + (target.y - source.y) * ratio,
  }
}
