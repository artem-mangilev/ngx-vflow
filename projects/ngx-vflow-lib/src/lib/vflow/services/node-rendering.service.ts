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

  public pullNode(node: NodeModel) {
    // TODO do not pull when the node is already on top
    const maxOrder = Math.max(
      ...this.flowEntitiesService.nodes().map((n) => n.renderOrder())
    )

    // pull node
    node.renderOrder.set(maxOrder + 1)

    this.flowEntitiesService
      .nodes()
      .filter(n => n.parent() === node)
      .forEach(n => this.pullNode(n))
  }
}
