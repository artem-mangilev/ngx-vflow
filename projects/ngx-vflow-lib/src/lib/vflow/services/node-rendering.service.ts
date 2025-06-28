import { Injectable, computed, inject, untracked } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { isGroupNode } from '../utils/is-group-node';
import { ViewportService } from './viewport.service';
import { FlowSettingsService } from './flow-settings.service';
import { isRectInViewport } from '../utils/viewport';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private viewportService = inject(ViewportService);
  private flowSettingsService = inject(FlowSettingsService);

  public readonly nodes = computed(() => {
    return [...this.viewportNodes().sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder())];
  });

  public readonly groups = computed(() => {
    return this.nodes().filter((n) => isGroupNode(n));
  });

  public readonly nonGroups = computed(() => {
    return this.nodes().filter((n) => !isGroupNode(n));
  });

  private viewportNodes = computed(() => {
    if (!this.flowSettingsService.optimization().viewportVirtualization) {
      return this.flowEntitiesService.nodes();
    }

    const viewport = this.viewportService.readableViewport();
    const flowWidth = this.flowSettingsService.computedFlowWidth();
    const flowHeight = this.flowSettingsService.computedFlowHeight();

    return this.flowEntitiesService.nodes().filter((n) => {
      const { x, y } = n.globalPoint();
      const width = untracked(n.width);
      const height = untracked(n.height);

      return isRectInViewport({ x, y, width, height }, viewport, flowWidth, flowHeight);
    });
  });

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
