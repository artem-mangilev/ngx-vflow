import { Connection } from "./connection.interface"
import { EdgeLabel, EdgeLabelPosition } from "./edge-label.interface"

export type EdgeType = 'default' | 'template'
export type Curve = 'straight' | 'bezier'

export interface Edge<T = unknown> extends Connection {
  id: string
  type?: EdgeType
  curve?: Curve
  data?: T
  edgeLabels?: { [position in EdgeLabelPosition]?: EdgeLabel }
}
