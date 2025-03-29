import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { EdgeModel } from '../models/edge.model';

@Injectable()
export class EdgeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);

  public readonly edges = computed(() => {
    return this.flowEntitiesService.validEdges().sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
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
