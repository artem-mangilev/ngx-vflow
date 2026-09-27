import { inject, Injectable } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { extendedComputed } from '../utils/signals/extended-computed';

@Injectable()
export class FlowRenderingService {
  private entities = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);

  /**
   * The first layout is complete: the flow has a size, and every node has its size and handle positions. Once true
   * it stays true and stops tracking the graph.
   */
  public flowInitialized = extendedComputed<boolean>(
    (initialized) =>
      initialized ||
      (this.settings.computedFlowWidth() > 0 &&
        this.settings.computedFlowHeight() > 0 &&
        // A node without a layout box (display: none) is never measured and must not keep the flow hidden.
        this.entities.nodes().every((node) => node.isReady() || !node.hasBox())),
  );
}
