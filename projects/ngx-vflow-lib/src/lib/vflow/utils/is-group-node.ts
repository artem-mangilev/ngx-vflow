import { NodeModel } from "../models/node.model";

export function isGroupNode(node: NodeModel): boolean {
  return node.node.type === 'default-group' || node.node.type === 'template-group';

}
