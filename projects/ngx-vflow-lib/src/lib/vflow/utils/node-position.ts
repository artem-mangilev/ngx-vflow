import { isDevMode } from '@angular/core';
import { Point } from '../interfaces/point.interface';

export interface PositionNode {
  id: string;
  point: () => Point;
  parentId?: () => string | null;
}

export function getNodeFlowPosition(nodeId: string, nodeLookup: ReadonlyMap<string, PositionNode>): Point | undefined {
  const visited = new Set<string>();
  const requestedNode = nodeLookup.get(nodeId);
  let current = requestedNode;
  let x = 0;
  let y = 0;

  if (!requestedNode) return undefined;

  while (current) {
    if (visited.has(current.id)) {
      if (isDevMode()) console.warn(`[ngx-vflow] Skipping node "${nodeId}" with cyclic parent ancestry.`);
      return undefined;
    }

    visited.add(current.id);
    const point = current.point();
    x += point.x;
    y += point.y;
    const parentId = current.parentId?.();
    current = parentId ? nodeLookup.get(parentId) : undefined;
  }

  return { x, y };
}
