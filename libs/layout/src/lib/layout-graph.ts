import { Edge, Node, Point, Rect } from 'ngx-vflow';
import { LayoutGraph, LayoutNode, LayoutResult } from './layout.types';
import { NodeTarget } from './position-writer';

/** The rendered rectangle of a node in flow space, or `undefined` for a node that is not measured. */
export type RectOf = (id: string) => Rect | undefined;

/**
 * The nodes as an algorithm sees them, with their rendered rectangles. Unmeasured nodes are left out, and a parent
 * that is left out is no parent.
 */
export function toLayoutNodes(nodes: readonly Node[], rectOf: RectOf): LayoutNode[] {
  const measured = new Set(nodes.filter((node) => rectOf(node.id)).map((node) => node.id));
  return nodes.flatMap((node) => {
    const rect = rectOf(node.id);
    if (!rect) return [];
    const parentId = node.parentId?.();
    return [{ id: node.id, parentId: parentId && measured.has(parentId) ? parentId : null, ...rect }];
  });
}

/** The graph as an algorithm sees it: the measured nodes, and the edges between them. */
export function toLayoutGraph(nodes: readonly Node[], edges: readonly Edge[], rectOf: RectOf): LayoutGraph {
  const layoutNodes = toLayoutNodes(nodes, rectOf);
  const ids = new Set(layoutNodes.map((node) => node.id));
  return {
    nodes: layoutNodes,
    edges: edges
      .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
      .map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
  };
}

/**
 * The targets of a result: its flow-space positions in the node space of each parent, from the result when it moves
 * the parent, else as rendered now, with the sizes the result gives. Nodes the result leaves out and the skipped
 * ones stay.
 */
export function toNodeSpaceTargets(
  result: LayoutResult,
  nodes: readonly Node[],
  rectOf: RectOf,
  skip: ReadonlySet<string>,
): Map<Node, NodeTarget> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const originOf = (node: Node): Point => {
    const parentId = node.parentId?.();
    if (!parentId) return { x: 0, y: 0 };
    return result.positions.get(parentId) ?? rectOf(parentId) ?? { x: 0, y: 0 };
  };
  const targets = new Map<Node, NodeTarget>();
  for (const [id, position] of result.positions) {
    const node = byId.get(id);
    if (!node || skip.has(id)) continue;
    const origin = originOf(node);
    const size = result.sizes?.get(id);
    targets.set(node, { point: { x: position.x - origin.x, y: position.y - origin.y }, ...(size && { size }) });
  }

  return targets;
}
