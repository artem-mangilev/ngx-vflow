import { hierarchy, tree } from 'd3-hierarchy';
import { LayoutAlgorithm, LayoutGraph, LayoutNode } from '@vflow/layout';
import { Point } from 'ngx-vflow';
import { of } from 'rxjs';

/** Where the children of a node go. */
export type TreeDirection = 'down' | 'up' | 'right' | 'left';

export interface TreeLayoutOptions {
  /** @default 'down' */
  direction?: TreeDirection;
  /** Space between siblings and between neighbouring subtrees, in flow units. @default 40 */
  nodeSpacing?: number;
  /** Space between a level and the next, in flow units. @default 60 */
  levelSpacing?: number;
}

export interface RadialTreeLayoutOptions {
  /** Distance between the rings of the tree, in flow units. @default 120 */
  levelSpacing?: number;
  /** Flow-space point the tree grows from. @default { x: 0, y: 0 } */
  center?: Point;
}

/** A node with the children its edges lead to; the forest root has no node of its own. */
interface Tree {
  node: LayoutNode | null;
  children: Tree[];
}

/**
 * The trees of a graph: a node's parent is the source of its first incoming edge, a node without one is a root, and
 * a node reachable only through a cycle becomes a root as well, so every node is placed once.
 */
function forest(graph: LayoutGraph): Tree[] {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const childrenOf = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const { source, target } of graph.edges) {
    if (source === target || hasParent.has(target)) continue;
    hasParent.add(target);
    childrenOf.set(source, [...(childrenOf.get(source) ?? []), target]);
  }
  const visited = new Set<string>();
  const build = (id: string): Tree[] => {
    if (visited.has(id)) return [];
    visited.add(id);
    return [{ node: byId.get(id)!, children: (childrenOf.get(id) ?? []).flatMap(build) }];
  };
  const roots = graph.nodes.flatMap((node) => (hasParent.has(node.id) ? [] : build(node.id)));
  const cyclic = graph.nodes.flatMap((node) => build(node.id));

  return [...roots, ...cyclic];
}

/**
 * Lays a tree, or a forest, out level by level with the tidy tree of
 * [d3-hierarchy](https://github.com/d3/d3-hierarchy): siblings side by side, each subtree under its parent. Every
 * node counts with its own size; the levels are aligned at their start. Nested nodes are laid out like the others.
 *
 * ```ts
 * readonly layout = treeLayout({ direction: 'right', levelSpacing: 80 });
 * ```
 */
export function treeLayout(options: TreeLayoutOptions = {}): LayoutAlgorithm {
  const { direction = 'down', nodeSpacing = 40, levelSpacing = 60 } = options;
  const vertical = direction === 'down' || direction === 'up';
  const breadthOf = (node: LayoutNode | null) => (node ? (vertical ? node.width : node.height) : 0);
  const depthOf = (node: LayoutNode) => (vertical ? node.height : node.width);

  return (graph) => {
    const trees = hierarchy<Tree>({ node: null, children: forest(graph) }, (tree) => tree.children);
    // A unit node size makes the separation a distance in flow units: half of each node, and the gap between.
    const root = tree<Tree>()
      .nodeSize([1, 1])
      .separation((a, b) => (breadthOf(a.data.node) + breadthOf(b.data.node)) / 2 + nodeSpacing)(trees);

    // A level is as deep as its deepest node; the next one starts after the spacing.
    const depths: number[] = [];
    root.each(({ depth, data }) => {
      if (data.node) depths[depth] = Math.max(depths[depth] ?? 0, depthOf(data.node));
    });
    const starts: number[] = [];
    let start = 0;
    for (let depth = 1; depth < depths.length; depth++) {
      starts[depth] = start;
      start += (depths[depth] ?? 0) + levelSpacing;
    }

    const positions = new Map<string, Point>();
    root.each(({ x, depth, data }) => {
      if (!data.node) return;
      const breadth = x - breadthOf(data.node) / 2;
      const forward = direction === 'down' || direction === 'right';
      const along = forward ? starts[depth] : -(starts[depth] + depthOf(data.node));
      positions.set(data.node.id, vertical ? { x: breadth, y: along } : { x: along, y: breadth });
    });

    return of({ positions });
  };
}

/**
 * Lays a tree out in rings around its root with the tidy tree of d3-hierarchy, as a mind map; a forest shares the
 * rings around an empty center. Nested nodes are laid out like the others.
 *
 * ```ts
 * readonly layout = radialTreeLayout({ levelSpacing: 140 });
 * ```
 */
export function radialTreeLayout(options: RadialTreeLayoutOptions = {}): LayoutAlgorithm {
  const { levelSpacing = 120, center = { x: 0, y: 0 } } = options;

  return (graph) => {
    const forests = forest(graph);
    // A single tree grows from its root; a forest shares the rings around an empty center.
    const trees = hierarchy<Tree>(
      forests.length === 1 ? forests[0] : { node: null, children: forests },
      (tree) => tree.children,
    );
    // Siblings sit one unit apart, subtrees two, less on the outer rings where the units are longer.
    const root = tree<Tree>()
      .nodeSize([1, 1])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)(trees);

    // The units span the full circle, with one more between the last node and the first.
    const xs = root.descendants().map((node) => node.x);
    const first = Math.min(...xs);
    const span = Math.max(...xs) - first + 1;

    const positions = new Map<string, Point>();
    root.each(({ x, depth, data }) => {
      if (!data.node) return;
      const angle = ((x - first) / span) * 2 * Math.PI - Math.PI / 2;
      const radius = depth * levelSpacing;
      positions.set(data.node.id, {
        x: center.x + radius * Math.cos(angle) - data.node.width / 2,
        y: center.y + radius * Math.sin(angle) - data.node.height / 2,
      });
    });

    return of({ positions });
  };
}
