import { graphlib, layout } from '@dagrejs/dagre';
import { LayoutAlgorithm } from '@vflow/layout';
import { Point } from 'ngx-vflow';
import { of } from 'rxjs';

/** The graph options of dagre; see https://github.com/dagrejs/dagre/wiki#configuring-the-layout. */
export interface DagreLayoutOptions {
  /** Direction of the ranks: top to bottom by default. */
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  /** Alignment of the nodes within a rank. */
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  /** Space between the nodes of a rank. */
  nodesep?: number;
  /** Space between the edges of a rank. */
  edgesep?: number;
  /** Space between the ranks. */
  ranksep?: number;
  marginx?: number;
  marginy?: number;
  acyclicer?: 'greedy';
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
  /**
   * Space a parent keeps around its children, which dagre itself places at the very edge of a compound node. In a
   * graph with parents, `edgesep` and `ranksep` grow by twice the padding, so neighbouring parents keep apart.
   */
  padding?: number;
}

/** The defaults of dagre. */
const DAGRE_EDGESEP = 20;
const DAGRE_RANKSEP = 50;

/**
 * Lays out a directed graph in ranks with [dagre](https://github.com/dagrejs/dagre). Nested nodes become compound
 * nodes, which dagre sizes around their children; the result carries those sizes for parents with an explicit size.
 *
 * ```ts
 * readonly layout = dagreLayout({ rankdir: 'LR', ranksep: 80 });
 * ```
 */
export function dagreLayout({ padding = 20, ...options }: DagreLayoutOptions = {}): LayoutAlgorithm {
  return (graph) => {
    const dagreGraph = new graphlib.Graph({ compound: true });
    // dagre keeps no room around a compound node for the padding added below, so the spacing between compound nodes,
    // `edgesep` beside them and `ranksep` across ranks, grows by the padding of both neighbours.
    const spacing = graph.nodes.some((node) => node.parentId)
      ? {
          edgesep: (options.edgesep ?? DAGRE_EDGESEP) + padding * 2,
          ranksep: (options.ranksep ?? DAGRE_RANKSEP) + padding * 2,
        }
      : {};
    dagreGraph.setGraph({ ...options, ...spacing });
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    for (const node of graph.nodes) dagreGraph.setNode(node.id, { width: node.width, height: node.height });
    for (const node of graph.nodes) {
      if (node.parentId) dagreGraph.setParent(node.id, node.parentId);
    }
    const parents = new Set(graph.nodes.map((node) => node.parentId));
    for (const edge of graph.edges) {
      // dagre cannot rank an edge that touches a compound node: it throws, so such an edge does not shape the layout.
      if (edge.source === edge.target || parents.has(edge.source) || parents.has(edge.target)) continue;
      dagreGraph.setEdge(edge.source, edge.target);
    }

    layout(dagreGraph);

    const positions = new Map<string, Point>();
    const sizes = new Map<string, { width: number; height: number }>();
    for (const node of graph.nodes) {
      const { x, y, width, height } = dagreGraph.node(node.id);
      // dagre positions the centers; a parent grows by the padding around the children dagre packed into it.
      const inflate = parents.has(node.id) ? padding : 0;
      positions.set(node.id, { x: x - width / 2 - inflate, y: y - height / 2 - inflate });
      if (parents.has(node.id)) sizes.set(node.id, { width: width + inflate * 2, height: height + inflate * 2 });
    }

    return of({ positions, sizes });
  };
}
