import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'
import { UsingPoints } from "../../types/using-points.type";
import { getPointOnLineByRatio } from "../point-on-line-by-ratio";

export function straightPath(
  source: Point,
  target: Point,
  usingPoints: UsingPoints = [false, false, false]
): PathData {
  const [start, center, end] = usingPoints
  const nullPoint = { x: 0, y: 0 }

  const path = d3Path()

  path.moveTo(source.x, source.y)
  path.lineTo(target.x, target.y)

  return {
    path: path.toString(),
    points: {
      start: start ? getPointOnLineByRatio(source, target, .15) : nullPoint,
      center: center ? getPointOnLineByRatio(source, target, .50) : nullPoint,
      end: end ? getPointOnLineByRatio(source, target, .85) : nullPoint,
    }
  }
}
