import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { EdgeModel } from '../models/edge.model';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';
import { isRectInViewport } from '../utils/viewport';

@Injectable()
export class EdgeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private viewportService = inject(ViewportService);

  public readonly edges = computed(() => {
    if (!this.flowSettingsService.optimization().virtualization) {
      return [...this.flowEntitiesService.validEdges()].sort(
        (aEdge, bEdge) => aEdge.renderOrder() - bEdge.renderOrder(),
      );
    }

    return this.viewportEdges().sort((aEdge, bEdge) => aEdge.renderOrder() - bEdge.renderOrder());
  });

  public readonly viewportEdges = computed(() => {
    const viewport = this.viewportService.readableViewport();
    if (viewport.zoom < this.flowSettingsService.optimization().virtualizationZoomThreshold) return [];
    const width = this.flowSettingsService.computedFlowWidth();
    const height = this.flowSettingsService.computedFlowHeight();
    return this.flowEntitiesService.validEdges().filter((e) => {
      const bounds = e.bounds();
      return bounds !== null && isRectInViewport(bounds, viewport, width, height);
    });
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
