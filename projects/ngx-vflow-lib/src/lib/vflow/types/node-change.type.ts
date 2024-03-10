import { Point } from "../interfaces/point.interface"

export type NodeChange = { id: string } & (NodePositionChange | NodeAddChange | NodeRemoveChange)

interface NodePositionChange {
  type: 'position'
  point: Point
}

interface NodeAddChange {
  type: 'add'
}

interface NodeRemoveChange {
  type: 'remove'
}
