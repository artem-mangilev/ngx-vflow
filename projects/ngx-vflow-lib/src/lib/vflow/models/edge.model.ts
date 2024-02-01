import { computed } from "@angular/core";
import { EdgeLabelPosition } from "../interfaces/edge-label.interface";
import { Edge, EdgeType } from "../interfaces/edge.interface";
import { EdgeLabelModel } from "./edge-label.model";
import { NodeModel } from "./node.model";
import { straightPath } from "../math/edge-path/straigh-path";

export class EdgeModel {
  public source!: NodeModel
  public target!: NodeModel
  public type: EdgeType

  public path = computed(() => {
    const source = {
      x: this.source.point().x + this.source.sourcePoint().x,
      y: this.source.point().y + this.source.sourcePoint().y
    }

    const target = {
      x: this.target.point().x + this.target.targetPoint().x,
      y: this.target.point().y + this.target.targetPoint().y
    }

    return straightPath(source, target)

    // TODO: fix
    // switch (this.edgeModel.type) {
    //   case 'straight':
    //     return straightPath(source, target)
    //   case 'bezier':
    //     return bezierPath(source, target,
    //       this.edgeModel.source.sourcePosition,
    //       this.edgeModel.target.targetPosition
    //     )
    // }
  })

  public edgeLabels: { [position in EdgeLabelPosition]?: EdgeLabelModel } = {}

  constructor(public edge: Edge) {
    this.type = edge.type ?? 'bezier'

    if (edge.edgeLabels?.start) this.edgeLabels.start = new EdgeLabelModel(edge.edgeLabels.start)
    if (edge.edgeLabels?.center) this.edgeLabels.center = new EdgeLabelModel(edge.edgeLabels.center)
    if (edge.edgeLabels?.end) this.edgeLabels.end = new EdgeLabelModel(edge.edgeLabels.end)
  }
}
