import { Position } from "../enums/position.enum"
import { Point } from "./point.interface"

export interface Node<T = unknown> {
  id: string
  point: Point,
  type: 'default' | 'custom'
  data?: T,
  sourcePosition?: Position
  targetPosition?: Position
}
