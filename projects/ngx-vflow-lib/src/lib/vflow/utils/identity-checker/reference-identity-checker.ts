import { NodeModel } from '../../models/node.model';
import { Node } from '../../interfaces/node.interface';
import { EdgeModel } from '../../models/edge.model';
import { Edge } from '../../interfaces/edge.interface';

export class ReferenceIdentityChecker {
  /**
   * Create new models for new node references and keep old models for old node references
   */
  public static nodes(newNodes: Node[], oldNodeModels: NodeModel[]) {
    const oldNodesMap: Map<Node, NodeModel> = new Map();
    oldNodeModels.forEach((model) => oldNodesMap.set(model.rawNode, model));

    const models = newNodes.map((newNode) => {
      const model = oldNodesMap.get(newNode) ?? new NodeModel(newNode);
      oldNodesMap.delete(newNode);
      return model;
    });
    oldNodesMap.forEach((model) => model.destroy());
    return models;
  }

  /**
   * Create new models for new edge references and keep old models for old edge references
   */
  public static edges(newEdges: Edge[], oldEdgeModels: EdgeModel[]): EdgeModel[] {
    const oldEdgesMap: Map<Edge, EdgeModel> = new Map();
    oldEdgeModels.forEach((model) => oldEdgesMap.set(model.edge, model));

    const models = newEdges.map((newEdge) => {
      const model = oldEdgesMap.get(newEdge) ?? new EdgeModel(newEdge);
      oldEdgesMap.delete(newEdge);
      return model;
    });
    oldEdgesMap.forEach((model) => model.destroy());
    return models;
  }
}
