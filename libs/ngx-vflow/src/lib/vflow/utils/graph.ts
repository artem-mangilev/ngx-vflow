import { Connection } from '../interfaces/connection.interface';

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
