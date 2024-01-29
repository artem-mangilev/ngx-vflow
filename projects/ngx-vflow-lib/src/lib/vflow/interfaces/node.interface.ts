import { Position } from "../enums/position.enum"
import { Point } from "./point.interface"

export interface Node<T = unknown> {
  id: string
  point: Point,
  type: 'default'
  data?: T

  // TODO: decide if this should be applied globally (now we can't handle different combos on different nodes)
  sourcePosition?: Position
  targetPosition?: Position
}
