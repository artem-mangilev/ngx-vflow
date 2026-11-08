import { Edge, Node, Point, Rect } from 'ngx-vflow';
import { LayoutGraph, LayoutNode, LayoutResult } from './layout.types';

/** The rendered rectangle of a node in flow space, or `undefined` for a node that is not measured. */
export type RectOf = (id: string) => Rect | undefined;

/** The nodes as an algorithm sees them, with their rendered rectangles; unmeasured nodes are left out. */
export function toLayoutNodes(nodes: readonly Node[], rectOf: RectOf): LayoutNode[] {
  return nodes.flatMap((node) => {
    const rect = rectOf(node.id);
    return rect ? [{ id: node.id, parentId: node.parentId?.() ?? null, ...rect }] : [];
  });
}

export function toLayoutGraph(nodes: readonly Node[], edges: readonly Edge[], rectOf: RectOf): LayoutGraph {
  return {
    nodes: toLayoutNodes(nodes, rectOf),
    edges: edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
  };
}

/**
 * The node-space targets of a result: its flow-space positions, relative to the position of each parent, from the
 * result when it moves the parent, else as rendered now. Nodes the result leaves out and the skipped ones stay.
 */
export function toNodeSpaceTargets(
  result: LayoutResult,
  nodes: readonly Node[],
  rectOf: RectOf,
  skip: ReadonlySet<string>,
): Map<Node, Point> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const originOf = (node: Node): Point => {
    const parentId = node.parentId?.();
    if (!parentId) return { x: 0, y: 0 };
    return result.positions.get(parentId) ?? rectOf(parentId) ?? { x: 0, y: 0 };
  };
  const targets = new Map<Node, Point>();
  for (const [id, position] of result.positions) {
    const node = byId.get(id);
    if (!node || skip.has(id)) continue;
    const origin = originOf(node);
    targets.set(node, { x: position.x - origin.x, y: position.y - origin.y });
  }

  return targets;
}
