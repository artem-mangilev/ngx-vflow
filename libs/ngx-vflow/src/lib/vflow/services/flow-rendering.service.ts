import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable } from '@angular/core';
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

  /** False in a DOM that never lays out, such as jsdom and happy-dom. Read once: the check forces a layout. */
  public readonly hasLayout = domHasLayout(inject(DOCUMENT));

  /**
   * Whether an entity or a layer is kept hidden until `ready`. Where nothing is ever measured, nothing waits:
   * the content stays visible to a test, with sizes of zero.
   */
  public hiddenUntil(ready: boolean): boolean {
    return this.hasLayout && !ready;
  }

  /** The flow waits for its first layout: the layers that follow the viewport are not painted yet. */
  public readonly awaitsFirstLayout = computed(() => this.hiddenUntil(this.flowInitialized()));
}

/** A DOM without layout gives the window a size and the root element none. */
function domHasLayout(document: Document): boolean {
  const view = document.defaultView;

  return !view || view.innerWidth === 0 || document.documentElement.clientWidth > 0;
}
