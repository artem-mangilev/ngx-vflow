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

    node.renderOrder.set(maxOrder + 1)
  }
}
