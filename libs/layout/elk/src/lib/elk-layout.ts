import ELK, { ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { LayoutAlgorithm, LayoutNode } from '@vflow/layout';
import { Point } from 'ngx-vflow';
import { defer } from 'rxjs';

/** The ELK algorithms the adapter offers; `layered` suits directed graphs, `mrtree` trees, `stress` and `force` undirected ones. */
export type ElkAlgorithm = 'layered' | 'mrtree' | 'stress' | 'force' | 'radial' | 'box' | 'rectpacking';

export type ElkDirection = 'right' | 'left' | 'down' | 'up';

/** How `layered` places the nodes within their layers. */
export type ElkNodePlacement = 'simple' | 'linear-segments' | 'brandes-koepf' | 'network-simplex';

export type ElkEdgeRouting = 'orthogonal' | 'polyline' | 'splines';

/** The options of {@link elkLayout}, mapped to the ELK layout options of the root. */
export interface ElkLayoutOptions {
  /** @default 'layered' */
  algorithm?: ElkAlgorithm;
  /** Direction of the layout for the algorithms that have one. @default 'right' */
  direction?: ElkDirection;
  /** Space between the nodes of a layer, in flow units. */
  nodeSpacing?: number;
  /** Space between the layers of `layered`, in flow units. */
  layerSpacing?: number;
  /** Space between an edge and a node, in flow units. */
  edgeNodeSpacing?: number;
  /** Space a parent keeps around its children, in flow units: one value or one per side. */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Node placement strategy of `layered`. */
  nodePlacement?: ElkNodePlacement;
  edgeRouting?: ElkEdgeRouting;
  /** Lays out disconnected parts of the graph apart from each other. */
  separateConnectedComponents?: boolean;
  /** Width to height the layout aims for. */
  aspectRatio?: number;
}

const DIRECTIONS: Record<ElkDirection, string> = { right: 'RIGHT', left: 'LEFT', down: 'DOWN', up: 'UP' };
const NODE_PLACEMENTS: Record<ElkNodePlacement, string> = {
  simple: 'SIMPLE',
  'linear-segments': 'LINEAR_SEGMENTS',
  'brandes-koepf': 'BRANDES_KOEPF',
  'network-simplex': 'NETWORK_SIMPLEX',
};
const EDGE_ROUTINGS: Record<ElkEdgeRouting, string> = {
  orthogonal: 'ORTHOGONAL',
  polyline: 'POLYLINE',
  splines: 'SPLINES',
};

/** The ELK layout options of the root for the adapter options. Nested nodes are laid out with their parents. */
function toLayoutOptions(options: ElkLayoutOptions): LayoutOptions {
  const padding =
    typeof options.padding === 'number'
      ? { top: options.padding, right: options.padding, bottom: options.padding, left: options.padding }
      : { top: 40, right: 20, bottom: 20, left: 20, ...options.padding };
  const result: LayoutOptions = {
    'elk.algorithm': options.algorithm ?? 'layered',
    'elk.direction': DIRECTIONS[options.direction ?? 'right'],
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.padding': `[top=${padding.top},left=${padding.left},bottom=${padding.bottom},right=${padding.right}]`,
  };
  if (options.nodeSpacing !== undefined) result['elk.spacing.nodeNode'] = String(options.nodeSpacing);
  if (options.layerSpacing !== undefined) {
    result['elk.layered.spacing.nodeNodeBetweenLayers'] = String(options.layerSpacing);
  }
  if (options.edgeNodeSpacing !== undefined) result['elk.spacing.edgeNode'] = String(options.edgeNodeSpacing);
  if (options.nodePlacement) result['elk.layered.nodePlacement.strategy'] = NODE_PLACEMENTS[options.nodePlacement];
  if (options.edgeRouting) result['elk.edgeRouting'] = EDGE_ROUTINGS[options.edgeRouting];
  if (options.separateConnectedComponents !== undefined) {
    result['elk.separateConnectedComponents'] = String(options.separateConnectedComponents);
  }
  if (options.aspectRatio !== undefined) result['elk.aspectRatio'] = String(options.aspectRatio);

  return result;
}

/**
 * Lays out a graph with the [Eclipse Layout Kernel](https://eclipse.dev/elk/) through `elkjs`, in the main thread.
 * Nested nodes become ELK children, laid out with their parents; the result carries the sizes ELK gives to parents
 * with an explicit size.
 *
 * ```ts
 * readonly layout = elkLayout({ algorithm: 'mrtree', direction: 'down', nodeSpacing: 40 });
 * ```
 */
export function elkLayout(options: ElkLayoutOptions = {}): LayoutAlgorithm {
  const elk = new ELK();
  const layoutOptions = toLayoutOptions(options);

  return (graph) =>
    defer(async () => {
      const childrenOf = new Map<string | null, LayoutNode[]>();
      for (const node of graph.nodes) {
        childrenOf.set(node.parentId, [...(childrenOf.get(node.parentId) ?? []), node]);
      }
      const toElk = (node: LayoutNode): ElkNode => ({
        id: node.id,
        width: node.width,
        height: node.height,
        children: (childrenOf.get(node.id) ?? []).map(toElk),
      });
      const root: ElkNode = {
        id: 'root',
        layoutOptions,
        children: (childrenOf.get(null) ?? []).map(toElk),
        edges: graph.edges
          .filter((edge) => edge.source !== edge.target)
          .map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
      };

      const laidOut = await elk.layout(root);

      // ELK positions children relative to their parent; the result is in flow space.
      const positions = new Map<string, Point>();
      const sizes = new Map<string, { width: number; height: number }>();
      const collect = (node: ElkNode, origin: Point) => {
        for (const child of node.children ?? []) {
          const position = { x: origin.x + (child.x ?? 0), y: origin.y + (child.y ?? 0) };
          positions.set(child.id, position);
          if (child.children?.length) sizes.set(child.id, { width: child.width ?? 0, height: child.height ?? 0 });
          collect(child, position);
        }
      };
      collect(laidOut, { x: 0, y: 0 });

      return { positions, sizes };
    });
}
