import { NodeModel } from "../models/node.model";
import { Node } from '../interfaces/node.interface';
import { EdgeModel } from "../models/edge.model";
import { Edge } from "../interfaces/edge.interface";

export class ReferenceKeeper {
  /**
   * Create new models for new node references and keep old models for old node references
   */
  public static nodes(newNodes: Node[], oldNodeModels: NodeModel[]) {
    const oldNodesMap: Map<Node, NodeModel> = new Map()
    oldNodeModels.forEach(model => oldNodesMap.set(model.node, model))

    return newNodes.map(newNode => {
      if (oldNodesMap.has(newNode)) return oldNodesMap.get(newNode)!
      else return new NodeModel(newNode)
    })
  }

  /**
   * Create new models for new edge references and keep old models for old edge references
   */
  public static edges(newEdges: Edge[], oldEdgeModels: EdgeModel[]) {
    const oldEdgesMap: Map<Edge, EdgeModel> = new Map()
    oldEdgeModels.forEach(model => oldEdgesMap.set(model.edge, model))

    return newEdges.map(newEdge => {
      if (oldEdgesMap.has(newEdge)) return oldEdgesMap.get(newEdge)!
      else return new EdgeModel(newEdge)
    })
  }
}
