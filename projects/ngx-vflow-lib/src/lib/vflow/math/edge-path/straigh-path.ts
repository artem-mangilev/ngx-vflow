import { Point } from "../../interfaces/point.interface";
import { path as d3Path } from 'd3-path'

interface PathData {
  path: string;
  centerPoint: Point
}

export function straightPath(source: Point, target: Point): PathData {
  const path = d3Path()

  path.moveTo(source.x, source.y)
  path.lineTo(target.x, target.y)

  return {
    path: path.toString(),
    centerPoint: {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2
    }
  }

}
