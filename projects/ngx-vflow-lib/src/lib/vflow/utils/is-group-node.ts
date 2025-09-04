import { NodeModel } from '../models/node.model';
import { isDynamicNode, isComponentStaticGroupNode, isComponentDynamicGroupNode } from '../interfaces/node.interface';

export function isGroupNode(node: NodeModel): boolean {
  const rawNode = node.rawNode;

  // Check for traditional group node types
  if (rawNode.type === 'default-group' || rawNode.type === 'template-group') {
    return true;
  }

  // Check for component nodes with group property
  if (isDynamicNode(rawNode)) {
    return isComponentDynamicGroupNode(rawNode);
  }

  return isComponentStaticGroupNode(rawNode);
}
