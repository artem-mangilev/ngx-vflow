import { Edge } from "../interfaces/edge.interface";
import { NodeModel } from "./node.model";

export class EdgeModel {
  public source!: NodeModel
  public target!: NodeModel

  constructor(public edge: Edge) { }
}
