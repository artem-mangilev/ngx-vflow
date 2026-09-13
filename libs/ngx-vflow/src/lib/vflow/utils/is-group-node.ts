import { NodeModel } from '../models/node.model';

export function isGroupNode(node: NodeModel): boolean {
  return node.rawNode.type === 'template-group';
}
