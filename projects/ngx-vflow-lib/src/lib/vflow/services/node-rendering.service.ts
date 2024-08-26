import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService)

  public readonly nodes = computed(() => {
    return this.flowEntitiesService.nodes()
      .sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder())
  })

  private maxOrder = computed(() => {
    return Math.max(
      ...this.flowEntitiesService.nodes().map((n) => n.renderOrder())
    )
  })

  public pullNode(node: NodeModel) {
    // TODO do not pull when the node is already on top
    // pull node
    node.renderOrder.set(this.maxOrder() + 1)
    // pull children
    this.flowEntitiesService
      .nodes()
      .filter(n => n.parent() === node)
      .forEach(n => this.pullNode(n))
  }
}
