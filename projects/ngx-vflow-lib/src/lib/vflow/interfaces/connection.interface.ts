import { Edge } from "./edge.interface";
import { Node } from "./node.interface";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type PartialEdge = PartialBy<Edge, 'source' | 'target'>

export interface Connection {
  source: Node
  target: Node
}

export interface ValidConnection extends Connection {
  /**
   * Convert this connection to edge and add to the edges list
   */
  toEdge(edge?: PartialEdge): void
}
