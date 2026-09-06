import { Injectable, computed, effect, inject } from '@angular/core';
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
    return this.flowEntitiesService
      .nodes()
      .filter((node) => !node.culled())
      .sort((a, b) => a.renderOrder() - b.renderOrder());
  });

  public readonly groups = computed(() => {
    return this.flowEntitiesService
      .nodes()
      .filter((n) => !!n.children().length || isGroupNode(n))
      .sort((a, b) => a.renderOrder() - b.renderOrder());
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

  constructor() {
    effect(() => {
      if (!this.flowSettingsService.optimization().virtualization) return;
      // ponytail: linear viewport scan; add a spatial index if this scan becomes the bottleneck.
      const visible = new Set(this.viewportNodes());
      // Only membership changes notify node views; camera movement alone must not.
      for (const node of this.flowEntitiesService.nodes()) node.inViewport.set(visible.has(node));
    });
  }

  public pullNode(node: NodeModel) {
    this.maxOrder++;
    // pull node
    node.renderOrder.set(this.maxOrder);

    // pull children
    node.children().forEach((n) => this.pullNode(n));
  }
}
