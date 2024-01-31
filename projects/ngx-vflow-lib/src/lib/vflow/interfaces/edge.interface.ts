export type EdgeType = 'straight' | 'bezier'

export interface Edge {
  id: string
  source: string
  target: string
  type?: EdgeType,
  edgeLabel?: { [position in EdgeLabelPosition]?: EdgeLabel }
}

export type EdgeLabelType = 'html-template'
export type EdgeLabelPosition = 'start' | 'center' | 'end'

export interface EdgeLabel {
  type: EdgeLabelType,
}
