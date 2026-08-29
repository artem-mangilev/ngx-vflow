import { isDevMode } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';
import { Connection } from '../interfaces/connection.interface';
import { getBoundsOfRects } from './rect';

type BoundsNode = {
  id: string;
  point: () => Point;
  parentId?: () => string | null;
  width?: () => number;
  height?: () => number;
};

/**
 * Returns every edge incident to at least one supplied node, preserving edge order and duplicates.
 *
 * @example
 * `const selectedEdges = getConnectedEdges(selectedNodes, edges);`
 */
export function getConnectedEdges<NodeType extends { id: string }, EdgeType extends Connection>(
  nodes: readonly NodeType[],
  edges: readonly EdgeType[],
): EdgeType[] {
  const nodeIds = new Set(nodes.map((node) => node.id));

  return edges.filter((edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target));
}

/**
 * Returns unique nodes with an edge into the supplied node, preserving node order.
 *
 * @example
 * `const upstreamNodes = getIncomers(node, nodes, edges);`
 */
export function getIncomers<NodeType extends { id: string }, EdgeType extends Connection>(
  node: { id: string },
  nodes: readonly NodeType[],
  edges: readonly EdgeType[],
): NodeType[] {
  if (!nodes.some((candidate) => candidate.id === node.id)) return [];

  const ids = new Set(edges.filter((edge) => edge.target === node.id).map((edge) => edge.source));

  return nodes.filter((candidate) => ids.has(candidate.id));
}

/**
 * Returns unique nodes with an edge out of the supplied node, preserving node order.
 *
 * @example
 * `const downstreamNodes = getOutgoers(node, nodes, edges);`
 */
export function getOutgoers<NodeType extends { id: string }, EdgeType extends Connection>(
  node: { id: string },
  nodes: readonly NodeType[],
  edges: readonly EdgeType[],
): NodeType[] {
  if (!nodes.some((candidate) => candidate.id === node.id)) return [];

  const ids = new Set(edges.filter((edge) => edge.source === node.id).map((edge) => edge.target));

  return nodes.filter((candidate) => ids.has(candidate.id));
}

/**
 * Returns the bounds of the supplied nodes. A lookup makes its node snapshots and ancestry authoritative.
 *
 * @example
 * `getNodesBounds([child], { nodeLookup: new Map(nodes.map((node) => [node.id, node])) })`
 */
export function getNodesBounds(
  nodes: readonly BoundsNode[],
  { nodeLookup }: { nodeLookup?: ReadonlyMap<string, BoundsNode> } = {},
): Rect {
  if (!nodeLookup && nodes.some((node) => node.parentId?.())) {
    if (isDevMode()) console.warn('[ngx-vflow] Pass nodeLookup to get flow-space bounds for nested nodes.');
  }

  const rects = nodes.flatMap((requestedNode) => {
    const node = nodeLookup?.get(requestedNode.id) ?? (nodeLookup ? undefined : requestedNode);
    if (!node) return [];

    const point = nodeLookup ? getFlowPoint(node, nodeLookup) : node.point();
    if (!point) return [];

    return [
      {
        ...point,
        width: node.width?.() ?? 0,
        height: node.height?.() ?? 0,
      },
    ];
  });

  return getBoundsOfRects(rects);
}

function getFlowPoint(node: BoundsNode, nodeLookup: ReadonlyMap<string, BoundsNode>): Point | null {
  const visited = new Set<string>();
  let current: BoundsNode | undefined = node;
  let x = 0;
  let y = 0;

  while (current) {
    if (visited.has(current.id)) {
      if (isDevMode()) console.warn(`[ngx-vflow] Skipping node "${node.id}" with cyclic parent ancestry.`);
      return null;
    }

    visited.add(current.id);
    const point = current.point();
    x += point.x;
    y += point.y;

    const parentId: string | null | undefined = current.parentId?.();
    current = parentId ? nodeLookup.get(parentId) : undefined;
  }

  return { x, y };
}
