import { Point } from "../interfaces/point.interface"

export type NodeChange = NodePositionChange | NodeAddChange | NodeRemoveChange

export interface NodePositionChange extends NodeChangeShared {
  type: 'position'
  point: Point
}

export interface NodeAddChange extends NodeChangeShared {
  type: 'add'
}

export interface NodeRemoveChange extends NodeChangeShared {
  type: 'remove'
}

interface NodeChangeShared {
  id: string
}
