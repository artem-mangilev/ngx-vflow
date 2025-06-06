import { EdgeModel } from '../models/edge.model';
import { NodeModel } from '../models/node.model';

export function addNodesToEdges(nodes: NodeModel[], edges: EdgeModel[]): void {
  const nodesById = nodes.reduce(
    (acc, n) => {
      acc[n.rawNode.id] = n;

      return acc;
    },
    {} as { [nodeId: string]: NodeModel },
  );

  edges.forEach((e) => {
    e.source.set(nodesById[e.edge.source]);
    e.target.set(nodesById[e.edge.target]);
  });
}
