import { NodeModel } from '../../models/node.model';
import { DynamicNode, Node } from '../../interfaces/node.interface';
import { EdgeModel } from '../../models/edge.model';
import { Edge } from '../../interfaces/edge.interface';

export class ReferenceIdentityChecker {
  /**
   * Create new models for new node references and keep old models for old node references
   */
  public static nodes(newNodes: Node[] | DynamicNode[], oldNodeModels: NodeModel[]) {
    const oldNodesMap: Map<Node | DynamicNode, NodeModel> = new Map();
    oldNodeModels.forEach((model) => oldNodesMap.set(model.rawNode, model));

    const nodes = {
      all: [] as NodeModel[],
      new: [] as NodeModel[],
    };

    newNodes.forEach((newNode) => {
      const node = oldNodesMap.get(newNode) ?? new NodeModel(newNode);

      if (!oldNodesMap.has(node.rawNode)) {
        nodes.new.push(node);
      }

      nodes.all.push(node);
    });

    return nodes;
  }

  /**
   * Create new models for new edge references and keep old models for old edge references
   */
  public static edges(newEdges: Edge[], oldEdgeModels: EdgeModel[]): EdgeModel[] {
    const oldEdgesMap: Map<Edge, EdgeModel> = new Map();
    oldEdgeModels.forEach((model) => oldEdgesMap.set(model.edge, model));

    return newEdges.map((newEdge) => {
      if (oldEdgesMap.has(newEdge)) return oldEdgesMap.get(newEdge)!;
      else return new EdgeModel(newEdge);
    });
  }
}
