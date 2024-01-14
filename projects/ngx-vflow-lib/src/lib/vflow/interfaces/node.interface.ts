import { Point } from "./point.interface"

export interface Node<T = unknown> {
  id: string
  position: Point,
  type: 'default' | 'custom'
  data?: T
}
