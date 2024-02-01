import { EdgeLabel, EdgeLabelPosition } from "./edge-label.interface"

export type EdgeType = 'straight' | 'bezier'

export interface Edge {
  id: string
  source: string
  target: string
  type?: EdgeType,
  edgeLabels?: { [position in EdgeLabelPosition]?: EdgeLabel }
}
