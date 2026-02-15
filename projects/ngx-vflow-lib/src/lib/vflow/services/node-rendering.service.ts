import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { FlowSettingsService } from './flow-settings.service';
import { isRectInViewport } from '../utils/viewport';
import { ViewportService } from './viewport.service';
import { isGroupNode } from '../utils/is-group-node';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private viewportService = inject(ViewportService);
  private maxOrder = 0;

  public readonly nodes = computed(() => {
    if (!this.flowSettingsService.optimization().virtualization) {
      return [...this.flowEntitiesService.nodes()].sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
    }

    const nodesToRender = this.viewportNodes();

    const viewport = this.viewportService.readableViewport();
    const zoomThreshold = this.flowSettingsService.optimization().virtualizationZoomThreshold;

    return viewport.zoom < zoomThreshold
      ? []
      : nodesToRender.sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
  });

  public readonly groups = computed(() => {
    return this.nodes().filter((n) => !!n.children().length || isGroupNode(n));
  });

  public readonly nonGroups = computed(() => {
    return this.nodes().filter((n) => !this.groups().includes(n));
  });

  public viewportNodes = computed(() => {
    const nodes = this.flowEntitiesService.nodes();
    const viewport = this.viewportService.readableViewport();
    const flowWidth = this.flowSettingsService.computedFlowWidth();
    const flowHeight = this.flowSettingsService.computedFlowHeight();

    return nodes.filter((n) => {
      const { x, y } = n.globalPoint();
      const width = n.width();
      const height = n.height();

      return isRectInViewport({ x, y, width, height }, viewport, flowWidth, flowHeight);
    });
  });

  public pullNode(node: NodeModel) {
    this.maxOrder++;
    // pull node
    node.renderOrder.set(this.maxOrder);

    // pull children
    node.children().forEach((n) => this.pullNode(n));
  }
}
