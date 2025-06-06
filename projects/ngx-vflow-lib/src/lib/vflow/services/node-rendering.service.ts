import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { isGroupNode } from '../utils/is-group-node';
import { entitiesPerFrame } from '../utils/entities-per-frame';

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

  public readonly nodesPerFrame = computed(() => entitiesPerFrame(this.nodes().length, 10));
  public readonly groupsPerFrame = computed(() => entitiesPerFrame(this.groups().length, 10));
  public readonly nonGroupsPerFrame = computed(() => entitiesPerFrame(this.nonGroups().length, 10));

  private maxOrder = computed(() => {
    return Math.max(...this.flowEntitiesService.nodes().map((n) => n.renderOrder()));
  });

  public pullNode(node: NodeModel) {
    // pull node
    node.renderOrder.set(this.maxOrder() + 1);

    // pull children
    node.children().forEach((n) => this.pullNode(n));
  }
}
