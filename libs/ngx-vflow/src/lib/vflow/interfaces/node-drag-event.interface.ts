import { Node } from './node.interface';

/** Payload of `(nodeDragStart)`, `(nodeDrag)` and `(nodeDragEnd)`. */
export interface NodeDragEvent<N extends Node = Node> {
  /** The node the pointer grabbed. */
  node: N;
  /** Every node the gesture moves: the grabbed node and the other selected nodes that move with it. */
  nodes: N[];
  /** The pointer event being handled: the move that started the drag, a move, or the release. */
  sourceEvent: PointerEvent;
}
