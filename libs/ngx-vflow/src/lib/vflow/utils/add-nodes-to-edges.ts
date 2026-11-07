import { EdgeModel } from '../models/edge.model';
import { NodeModel } from '../models/node.model';

/** Links every edge to the models of its endpoint nodes; an endpoint that is not among `nodes` is `null`. */
export function addNodesToEdges(nodes: readonly NodeModel[], edges: readonly EdgeModel[]): void {
  const nodesById = new Map(nodes.map((node) => [node.rawNode.id, node]));

  for (const edge of edges) {
    edge.source.set(nodesById.get(edge.edge.source) ?? null);
    edge.target.set(nodesById.get(edge.edge.target) ?? null);
  }
}
