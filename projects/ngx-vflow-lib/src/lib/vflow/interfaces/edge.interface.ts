export type EdgeType = 'straight' | 'bezier'

export interface Edge {
  id: string
  source: string
  target: string
  type?: EdgeType
}
