import { isDevMode } from '@angular/core';
import { Node } from '../interfaces/node.interface';
import { Rect } from '../interfaces/rect';
import { Connection } from '../interfaces/connection.interface';
import { getBoundsOfRects } from './rect';
import { getNodeFlowPosition } from './node-position';

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
  nodes: readonly Node[],
  { nodeLookup }: { nodeLookup?: ReadonlyMap<string, Node> } = {},
): Rect {
  if (!nodeLookup && nodes.some((node) => node.parentId?.())) {
    if (isDevMode()) console.warn('[ngx-vflow] Pass nodeLookup to get flow-space bounds for nested nodes.');
  }

  const rects = nodes.flatMap((requestedNode) => {
    const node = nodeLookup?.get(requestedNode.id) ?? (nodeLookup ? undefined : requestedNode);
    if (!node) return [];

    const point = nodeLookup ? getNodeFlowPosition(node.id, nodeLookup) : node.point();
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
