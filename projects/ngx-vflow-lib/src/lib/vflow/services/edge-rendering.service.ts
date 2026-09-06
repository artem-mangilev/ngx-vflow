import { Injectable, computed, effect, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { EdgeModel } from '../models/edge.model';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';
import { isRectInViewport } from '../utils/viewport';

@Injectable()
export class EdgeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);
  private viewport = inject(ViewportService);

  constructor() {
    effect(() => {
      if (!this.settings.optimization().virtualization) return;
      const viewport = this.viewport.readableViewport();
      const width = this.settings.computedFlowWidth();
      const height = this.settings.computedFlowHeight();
      // ponytail: linear bounds scan; add a spatial index if profiling warrants it.
      for (const edge of this.flowEntitiesService.validEdges()) {
        const bounds = edge.bounds();
        edge.inViewport.set(bounds !== null && isRectInViewport(bounds, viewport, width, height));
      }
    });
  }

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
