import { computed } from "@angular/core";
import { EdgeLabelPosition } from "../interfaces/edge-label.interface";
import { Edge, Curve, EdgeType } from "../interfaces/edge.interface";
import { EdgeLabelModel } from "./edge-label.model";
import { NodeModel } from "./node.model";
import { straightPath } from "../math/edge-path/straigh-path";
import { bezierPath } from "../math/edge-path/bezier-path";
import { UsingPoints } from "../types/using-points.type";

export class EdgeModel {
  public source!: NodeModel
  public target!: NodeModel
  public curve: Curve
  public type: EdgeType

  public path = computed(() => {
    const source = this.source.sourcePointAbsolute()
    const target = this.target.targetPointAbsolute()

    switch (this.curve) {
      case 'straight':
        return straightPath(source, target, this.usingPoints)
      case 'bezier':
        return bezierPath(
          source, target,
          this.source.sourcePosition(),
          this.target.targetPosition(),
          this.usingPoints
        )
    }
  })

  public edgeLabels: { [position in EdgeLabelPosition]?: EdgeLabelModel } = {}

  private usingPoints: UsingPoints

  constructor(public edge: Edge) {
    this.type = edge.type ?? 'default'
    this.curve = edge.curve ?? 'bezier'

    if (edge.edgeLabels?.start) this.edgeLabels.start = new EdgeLabelModel(edge.edgeLabels.start)
    if (edge.edgeLabels?.center) this.edgeLabels.center = new EdgeLabelModel(edge.edgeLabels.center)
    if (edge.edgeLabels?.end) this.edgeLabels.end = new EdgeLabelModel(edge.edgeLabels.end)

    this.usingPoints = [!!this.edgeLabels.start, !!this.edgeLabels.center, !!this.edgeLabels.end]
  }
}
