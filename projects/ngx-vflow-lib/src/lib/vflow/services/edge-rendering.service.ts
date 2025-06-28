import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { EdgeModel } from '../models/edge.model';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';
import { isLineInViewport } from '../utils/viewport';

@Injectable()
export class EdgeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private viewportService = inject(ViewportService);
  private flowSettingsService = inject(FlowSettingsService);

  public readonly edges = computed(() => {
    const viewport = this.viewportService.readableViewport();
    const flowWidth = this.flowSettingsService.computedFlowWidth();
    const flowHeight = this.flowSettingsService.computedFlowHeight();

    const viewportEdges = this.flowEntitiesService.validEdges().filter((e) => {
      const sourceHandle = e.sourceHandle();
      const targetHandle = e.targetHandle();

      // If edge is detached or handles are missing, don't render
      if (!sourceHandle || !targetHandle) {
        return false;
      }

      const sourcePoint = sourceHandle.pointAbsolute();
      const targetPoint = targetHandle.pointAbsolute();

      const padding = 50;

      return isLineInViewport(sourcePoint, targetPoint, viewport, flowWidth, flowHeight, padding);
    });

    return viewportEdges.sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
  });

  private maxOrder = computed(() => {
    return Math.max(...this.flowEntitiesService.validEdges().map((n) => n.renderOrder()));
  });

  public pull(edge: EdgeModel) {
    const isAlreadyOnTop = edge.renderOrder() !== 0 && this.maxOrder() === edge.renderOrder();

    if (isAlreadyOnTop) {
      return;
    }

    // pull node
    edge.renderOrder.set(this.maxOrder() + 1);
  }
}
