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
    const maxOrder = Math.max(
      ...this.flowEntitiesService.nodes().map((n) => n.renderOrder())
    )

    // pull node
    const newOrder = maxOrder + 1
    node.renderOrder.set(newOrder)

    // TODO check multiple levels
    // pull node's children
    this.flowEntitiesService.nodes()
      .filter(n => n.parentId() === node.node.id)
      .forEach((c, i) => c.renderOrder.set(newOrder + i + 1))
  }
}
