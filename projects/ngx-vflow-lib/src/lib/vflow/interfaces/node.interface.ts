import { Position } from "../types/position.type"
import { Point } from "./point.interface"

export interface Node<T = unknown> {
  id: string
  point: Point,
  type: 'default' | 'html-template'
  data?: T
}
