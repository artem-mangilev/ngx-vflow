import { Edge, EdgeType } from "../interfaces/edge.interface";
import { NodeModel } from "./node.model";

export class EdgeModel {
  public source!: NodeModel
  public target!: NodeModel
  public type: EdgeType

  constructor(public edge: Edge) {
    this.type = edge.type ?? 'bezier'
  }
}
