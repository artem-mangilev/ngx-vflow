import { Node } from '../interfaces/node.interface';
import { Point } from '../interfaces/point.interface';

export function getNodeFlowPosition(nodeId: string, nodeLookup: ReadonlyMap<string, Node>): Point | undefined {
  const visited = new Set<string>();
  const requestedNode = nodeLookup.get(nodeId);
  let current = requestedNode;
  let x = 0;
  let y = 0;

  if (!requestedNode) return undefined;

  while (current) {
    // Cyclic parent ancestry has no position.
    if (visited.has(current.id)) return undefined;

    visited.add(current.id);
    const point = current.point();
    x += point.x;
    y += point.y;
    const parentId = current.parentId?.();
    current = parentId ? nodeLookup.get(parentId) : undefined;
  }

  return { x, y };
}
