import { isDevMode, signal } from '@angular/core';
import { Connection } from '../interfaces/connection.interface';
import { Edge } from '../interfaces/edge.interface';
import { Node } from '../interfaces/node.interface';
import { Point } from '../interfaces/point.interface';

export interface NodeReparentOperation {
  id: string;
  parentId: string | null;
}

export interface EdgeReconnectOperation {
  id: string;
  connection: Connection;
}

export interface RemoveNodesResult<NodeType extends Node, EdgeType extends Edge> {
  nodes: NodeType[];
  edges: EdgeType[];
  removedNodes: NodeType[];
  removedEdges: EdgeType[];
}

/** Appends valid nodes in input order. */
export function addNodes<ExistingNodeType extends Node, AddedNodeType extends Node>(
  nodesToAdd: readonly AddedNodeType[],
  nodes: readonly ExistingNodeType[],
): Array<ExistingNodeType | AddedNodeType> {
  let result: readonly (ExistingNodeType | AddedNodeType)[] = nodes;

  for (const node of nodesToAdd) {
    if (!node.id) {
      warn('Cannot add a node without an id.');
      continue;
    }

    if (findUniqueIndex(result, node.id).count) {
      warn(`Cannot add node "${node.id}" because its id already exists.`);
      continue;
    }

    const parentId = node.parentId?.() ?? null;
    if (parentId) {
      const parent = findUniqueIndex(result, parentId);
      if (parent.count !== 1) {
        warnTarget('parent node', parentId, parent.count);
        continue;
      }

      const ancestry = getFlowPoint(result[parent.index], result, node.id);
      if ('error' in ancestry) {
        warnAncestry(node.id, ancestry.error);
        continue;
      }
    }

    result = [...result, node];
  }

  return result as Array<ExistingNodeType | AddedNodeType>;
}

/** Removes nodes, their descendants, and every incident edge. */
export function removeNodes<NodeType extends Node, EdgeType extends Edge>(
  nodeIds: readonly string[],
  { nodes, edges }: { nodes: readonly NodeType[]; edges: readonly EdgeType[] },
): RemoveNodesResult<NodeType, EdgeType> {
  let nextNodes: readonly NodeType[] = nodes;
  let nextEdges: readonly EdgeType[] = edges;
  const removedNodeSet = new Set<NodeType>();
  const removedEdgeSet = new Set<EdgeType>();

  for (const id of nodeIds) {
    const match = findUniqueIndex(nextNodes, id);
    if (!match.count) continue;
    if (match.count > 1) {
      warnTarget('node', id, match.count);
      continue;
    }

    const children = new Map<string, NodeType[]>();
    for (const node of nextNodes) {
      const parentId = node.parentId?.();
      if (parentId) children.set(parentId, [...(children.get(parentId) ?? []), node]);
    }

    const descendants = new Set<NodeType>([nextNodes[match.index]]);
    const pending = [nextNodes[match.index]];
    const expandedIds = new Set<string>();
    let cyclic = false;

    while (pending.length) {
      const parent = pending.pop()!;
      if (expandedIds.has(parent.id)) continue;
      expandedIds.add(parent.id);

      for (const child of children.get(parent.id) ?? []) {
        if (descendants.has(child)) {
          cyclic = true;
          continue;
        }
        descendants.add(child);
        pending.push(child);
      }
    }

    if (cyclic) warn(`Removing node "${id}" and its cyclic descendant closure.`);

    const removedIds = new Set([...descendants].map((node) => node.id));
    const incidentEdges = nextEdges.filter((edge) => removedIds.has(edge.source) || removedIds.has(edge.target));

    descendants.forEach((node) => removedNodeSet.add(node));
    incidentEdges.forEach((edge) => removedEdgeSet.add(edge));
    nextNodes = nextNodes.filter((node) => !descendants.has(node));
    nextEdges = nextEdges.filter((edge) => !removedEdgeSet.has(edge));
  }

  return {
    nodes: nextNodes as NodeType[],
    edges: nextEdges as EdgeType[],
    removedNodes: nodes.filter((node) => removedNodeSet.has(node)),
    removedEdges: edges.filter((edge) => removedEdgeSet.has(edge)),
  };
}

/** Reparents nodes through their existing signals without changing their flow-space positions. */
export function reparentNodes<NodeType extends Node>(
  operations: readonly NodeReparentOperation[],
  nodes: readonly NodeType[],
): NodeType[] {
  let changed = false;

  for (const { id, parentId } of operations) {
    const source = findUniqueIndex(nodes, id);
    if (source.count !== 1) {
      warnTarget('node', id, source.count);
      continue;
    }

    const node = nodes[source.index];
    if ((node.parentId?.() ?? null) === parentId) continue;

    const sourcePoint = getFlowPoint(node, nodes);
    if ('error' in sourcePoint) {
      warnAncestry(id, sourcePoint.error);
      continue;
    }

    let parentPoint: Point = { x: 0, y: 0 };
    if (parentId) {
      const parent = findUniqueIndex(nodes, parentId);
      if (parent.count !== 1) {
        warnTarget('parent node', parentId, parent.count);
        continue;
      }

      const resolvedParentPoint = getFlowPoint(nodes[parent.index], nodes, id);
      if ('error' in resolvedParentPoint) {
        warnAncestry(id, resolvedParentPoint.error);
        continue;
      }
      parentPoint = resolvedParentPoint.point;
    }

    node.point.set({ x: sourcePoint.point.x - parentPoint.x, y: sourcePoint.point.y - parentPoint.y });
    if (node.parentId) node.parentId.set(parentId);
    else node.parentId = signal(parentId);
    changed = true;
  }

  return (changed ? [...nodes] : nodes) as NodeType[];
}

/** Appends edges with valid endpoints and unique connection tuples. */
export function addEdges<ExistingEdgeType extends Edge, AddedEdgeType extends Edge>(
  edgesToAdd: readonly AddedEdgeType[],
  { nodes, edges }: { nodes: readonly { id: string }[]; edges: readonly ExistingEdgeType[] },
): Array<ExistingEdgeType | AddedEdgeType> {
  let result: readonly (ExistingEdgeType | AddedEdgeType)[] = edges;

  for (const edge of edgesToAdd) {
    if (!edge.id) {
      warn('Cannot add an edge without an id.');
      continue;
    }
    if (findUniqueIndex(result, edge.id).count) {
      warn(`Cannot add edge "${edge.id}" because its id already exists.`);
      continue;
    }
    if (!hasUniqueEndpoint(nodes, edge.source) || !hasUniqueEndpoint(nodes, edge.target)) continue;
    if (result.some((candidate) => sameConnection(candidate, edge))) continue;

    result = [...result, edge];
  }

  return result as Array<ExistingEdgeType | AddedEdgeType>;
}

/** Removes uniquely addressed edges. */
export function removeEdges<EdgeType extends Edge>(edgeIds: readonly string[], edges: readonly EdgeType[]): EdgeType[] {
  let result: readonly EdgeType[] = edges;

  for (const id of edgeIds) {
    const match = findUniqueIndex(result, id);
    if (!match.count) continue;
    if (match.count > 1) {
      warnTarget('edge', id, match.count);
      continue;
    }
    result = result.filter((_, index) => index !== match.index);
  }

  return result as EdgeType[];
}

/** Replaces connection fields while preserving edge ids, slots, metadata, and signals. */
export function reconnectEdges<EdgeType extends Edge>(
  operations: readonly EdgeReconnectOperation[],
  { nodes, edges }: { nodes: readonly { id: string }[]; edges: readonly EdgeType[] },
): EdgeType[] {
  let result: readonly EdgeType[] = edges;

  for (const { id, connection } of operations) {
    const match = findUniqueIndex(result, id);
    if (match.count !== 1) {
      warnTarget('edge', id, match.count);
      continue;
    }
    if (!hasUniqueEndpoint(nodes, connection.source) || !hasUniqueEndpoint(nodes, connection.target)) continue;

    const edge = result[match.index];
    if (sameConnection(edge, connection)) continue;

    const replacement = {
      ...edge,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };
    result = result.map((candidate, index) => (index === match.index ? replacement : candidate));
  }

  return result as EdgeType[];
}

// ponytail: linear scans keep small operation batches simple; index snapshots if profiling shows large-batch cost.
function findUniqueIndex(items: readonly { id: string }[], id: string): { count: number; index: number } {
  let count = 0;
  let index = -1;
  items.forEach((item, itemIndex) => {
    if (item.id === id) {
      count++;
      index = itemIndex;
    }
  });
  return { count, index };
}

function getFlowPoint<NodeType extends Node>(
  node: NodeType,
  nodes: readonly NodeType[],
  forbiddenAncestorId?: string,
): { point: Point } | { error: 'ambiguous ancestry' | 'cyclic ancestry' | 'descendant parent' } {
  const visited = new Set<NodeType>();
  let current: NodeType | undefined = node;
  let x = 0;
  let y = 0;

  while (current) {
    if (current.id === forbiddenAncestorId) return { error: 'descendant parent' };
    if (visited.has(current)) return { error: 'cyclic ancestry' };
    visited.add(current);
    x += current.point().x;
    y += current.point().y;

    const parentId = current.parentId?.();
    if (!parentId) break;
    if (parentId === forbiddenAncestorId) return { error: 'descendant parent' };

    const parent = findUniqueIndex(nodes, parentId);
    if (!parent.count) break;
    if (parent.count > 1) return { error: 'ambiguous ancestry' };
    current = nodes[parent.index];
  }

  return { point: { x, y } };
}

function sameConnection(a: Connection, b: Connection): boolean {
  return (
    a.source === b.source &&
    a.target === b.target &&
    (a.sourceHandle ?? '') === (b.sourceHandle ?? '') &&
    (a.targetHandle ?? '') === (b.targetHandle ?? '')
  );
}

function hasUniqueEndpoint(nodes: readonly { id: string }[], id: string): boolean {
  const endpoint = findUniqueIndex(nodes, id);
  if (endpoint.count === 1) return true;
  warnTarget('endpoint node', id, endpoint.count);
  return false;
}

function warnTarget(target: string, id: string, count: number): void {
  warn(count ? `Cannot target ${target} "${id}" because its id is ambiguous.` : `Cannot find ${target} "${id}".`);
}

function warnAncestry(id: string, error: string): void {
  warn(`Cannot update node "${id}" because of ${error}.`);
}

function warn(message: string): void {
  if (isDevMode()) console.warn(`[ngx-vflow] ${message}`);
}
