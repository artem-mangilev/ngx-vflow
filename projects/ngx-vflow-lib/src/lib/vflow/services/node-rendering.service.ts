import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { isGroupNode } from '../utils/is-group-node';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);

  public readonly nodes = computed(() => {
    return this.flowEntitiesService.nodes().sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
  });

  public readonly groups = computed(() => {
    return this.nodes().filter((n) => isGroupNode(n));
  });

  public readonly nonGroups = computed(() => {
    return this.nodes().filter((n) => !isGroupNode(n));
  });

  private maxOrder = computed(() => {
    return Math.max(...this.flowEntitiesService.nodes().map((n) => n.renderOrder()));
  });

  public pullNode(node: NodeModel) {
    const isAlreadyOnTop = node.renderOrder() !== 0 && this.maxOrder() === node.renderOrder();

    // TODO: does not work for group nodes
    if (isAlreadyOnTop) {
      return;
    }

    // pull node
    node.renderOrder.set(this.maxOrder() + 1);

    // pull children
    node.children().forEach((n) => this.pullNode(n));
  }
}
