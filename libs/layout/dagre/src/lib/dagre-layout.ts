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
  /** Space a parent keeps around its children, which dagre itself places at the very edge of a compound node. */
  padding?: number;
}

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
    dagreGraph.setGraph({ ...options });
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    for (const node of graph.nodes) dagreGraph.setNode(node.id, { width: node.width, height: node.height });
    for (const node of graph.nodes) {
      if (node.parentId) dagreGraph.setParent(node.id, node.parentId);
    }
    for (const edge of graph.edges) {
      if (edge.source !== edge.target) dagreGraph.setEdge(edge.source, edge.target);
    }

    layout(dagreGraph);

    const parents = new Set(graph.nodes.map((node) => node.parentId));
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
