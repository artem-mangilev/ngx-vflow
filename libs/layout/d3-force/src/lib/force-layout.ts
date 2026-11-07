import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { LayoutAlgorithm, LayoutResult } from '@vflow/layout';
import { Point } from 'ngx-vflow';
import { Observable } from 'rxjs';

export interface ForceLayoutOptions {
  /** Length the links try to keep. */
  linkDistance?: number;
  /** Repulsion between the nodes, negative to push apart. */
  chargeStrength?: number;
  /** Flow-space point the graph gathers around. */
  center?: Point;
  /** Keeps the nodes from overlapping, with this many flow units between them; `false` turns it off. */
  collide?: number | false;
  /** How fast the simulation cools down; higher values settle sooner. */
  alphaDecay?: number;
}

interface SimulationNode {
  id: string;
  x: number;
  y: number;
  /** Fixed position while the node is dragged. */
  fx?: number | null;
  fy?: number | null;
  width: number;
  height: number;
}

/**
 * Lays out a graph continuously with a [d3-force](https://github.com/d3/d3-force) simulation: the nodes move on
 * every tick until the simulation settles, and a dragged node is pinned under the pointer and reheats it. Nodes
 * start where they are; nested nodes are laid out like the others. The layout never completes: the simulation stays
 * ready for the next drag.
 *
 * ```ts
 * readonly layout = forceLayout({ linkDistance: 120, chargeStrength: -400 });
 * ```
 */
export function forceLayout(options: ForceLayoutOptions = {}): LayoutAlgorithm {
  const { linkDistance = 100, chargeStrength = -300, center = { x: 0, y: 0 }, collide = 8, alphaDecay } = options;

  return (graph, context) =>
    new Observable<LayoutResult>((subscriber) => {
      const ids = new Set(graph.nodes.map((node) => node.id));
      // The simulation moves the centers of the nodes.
      const nodes: SimulationNode[] = graph.nodes.map((node) => ({
        id: node.id,
        x: node.x + node.width / 2,
        y: node.y + node.height / 2,
        width: node.width,
        height: node.height,
      }));
      const links = graph.edges
        .filter((edge) => edge.source !== edge.target && ids.has(edge.source) && ids.has(edge.target))
        .map((edge) => ({ source: edge.source, target: edge.target }));

      const simulation = forceSimulation(nodes)
        .force(
          'link',
          forceLink<SimulationNode, { source: string; target: string }>(links)
            .id((node) => node.id)
            .distance(linkDistance),
        )
        .force('charge', forceManyBody().strength(chargeStrength))
        .force('center', forceCenter(center.x, center.y));
      if (collide !== false) {
        simulation.force(
          'collide',
          forceCollide<SimulationNode>((node) => Math.max(node.width, node.height) / 2 + collide),
        );
      }
      if (alphaDecay !== undefined) simulation.alphaDecay(alphaDecay);

      const emit = () =>
        subscriber.next({
          positions: new Map(
            nodes.map((node) => [node.id, { x: node.x - node.width / 2, y: node.y - node.height / 2 }]),
          ),
        });
      simulation.on('tick', emit);

      // A dragged node is fixed at the pointer, as with d3-drag, and the simulation warms up to follow it.
      const byId = new Map(nodes.map((node) => [node.id, node]));
      const drags = context.drags.subscribe((event) => {
        for (const dragged of event.nodes) {
          const node = byId.get(dragged.id);
          if (!node) continue;
          if (event.type === 'end') {
            node.fx = null;
            node.fy = null;
          } else {
            node.fx = dragged.x + dragged.width / 2;
            node.fy = dragged.y + dragged.height / 2;
          }
        }
        if (event.type === 'start') simulation.alphaTarget(0.3).restart();
        if (event.type === 'end') simulation.alphaTarget(0);
      });

      return () => {
        drags.unsubscribe();
        simulation.stop();
      };
    });
}
