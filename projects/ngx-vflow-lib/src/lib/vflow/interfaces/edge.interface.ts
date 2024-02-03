import { EdgeLabel, EdgeLabelPosition } from "./edge-label.interface"

export type EdgeCurve = 'straight' | 'bezier'

export interface Edge<T = unknown> {
  id: string
  source: string
  target: string
  curve?: EdgeCurve
  data?: T
  edgeLabels?: { [position in EdgeLabelPosition]?: EdgeLabel }
}
