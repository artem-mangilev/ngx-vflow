import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'

export function straightPath(source: Point, target: Point) {
  const path = d3Path()

  path.moveTo(source.x, source.y)
  path.lineTo(target.x, target.y)

  return path.toString()

}
