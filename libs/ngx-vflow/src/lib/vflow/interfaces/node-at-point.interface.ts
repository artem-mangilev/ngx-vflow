import { Node } from './node.interface';
import { Point } from './point.interface';

/** A rendered node under a flow-space position, as `VflowComponent.getNodesAtPoint` returns it. */
export interface NodeAtPoint<T = unknown> {
  /** The application node object. */
  node: Node<T>;
  /** Snapshot of the queried position relative to the node's top-left corner. */
  nodeSpacePoint: Point;
}
