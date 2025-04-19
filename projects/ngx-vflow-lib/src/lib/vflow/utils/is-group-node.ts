import { NodeModel } from '../models/node.model';

export function isGroupNode(node: NodeModel): boolean {
  return node.rawNode.type === 'default-group' || node.rawNode.type === 'template-group';
}
