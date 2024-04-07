import { computed } from "@angular/core";
import { EdgeLabelPosition } from "../interfaces/edge-label.interface";
import { Edge, Curve, EdgeType } from "../interfaces/edge.interface";
import { EdgeLabelModel } from "./edge-label.model";
import { NodeModel } from "./node.model";
import { straightPath } from "../math/edge-path/straigh-path";
import { bezierPath } from "../math/edge-path/bezier-path";
import { UsingPoints } from "../types/using-points.type";
import { Point } from "../interfaces/point.interface";
import { HandleModel } from "./handle.model";

export class EdgeModel {
  public source!: NodeModel
  public target!: NodeModel
  public curve: Curve
  public type: EdgeType

  public path = computed(() => {
    let source: HandleModel | undefined
    if (this.edge.sourceHandle) {
      source = this.source.handles()
        .find(handle => handle.rawHandle.id === this.edge.sourceHandle)
    } else {
      source = this.source.handles()
        .find(handle => handle.rawHandle.type === 'source')
    }

    let target: HandleModel | undefined
    if (this.edge.targetHandle) {
      target = this.target.handles()
        .find(handle => handle.rawHandle.id === this.edge.targetHandle)
    } else {
      target = this.target.handles()
        .find(handle => handle.rawHandle.type === 'target')
    }

    // TODO: don't like this
    if (!source || !target) {
      return {
        path: '',
        points: {
          start: { x: 0, y: 0 },
          center: { x: 0, y: 0 },
          end: { x: 0, y: 0 }
        }
      }
    }

    switch (this.curve) {
      case 'straight':
        return straightPath(source.pointAbsolute(), target.pointAbsolute(), this.usingPoints)
      case 'bezier':
        return bezierPath(
          source.pointAbsolute(), target.pointAbsolute(),
          source.rawHandle.position,
          target.rawHandle.position,
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
