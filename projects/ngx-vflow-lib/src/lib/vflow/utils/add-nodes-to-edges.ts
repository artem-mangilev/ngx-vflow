import { EdgeModel } from "../models/edge.model"
import { NodeModel } from "../models/node.model"

export function addNodesToEdges(nodes: NodeModel[], edges: EdgeModel[]) {
  const nodesById = nodes.reduce((acc, n) => {
    acc[n.node.id] = n

    return acc
  }, {} as { [nodeId: string]: NodeModel })

  edges.forEach(e => {
    e.source = nodesById[e.edge.source]
    e.target = nodesById[e.edge.target]
  })
}
