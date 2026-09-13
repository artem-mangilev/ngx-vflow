import { NodeModel } from '../models/node.model';

/** A node is presented and ordered as a group while other nodes reference it as their parent. */
export function isGroupNode(node: NodeModel): boolean {
  return node.children().length > 0;
}
