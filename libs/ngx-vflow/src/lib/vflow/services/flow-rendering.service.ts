import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, Injector, signal, untracked } from '@angular/core';
import { VFLOW_INITIALIZATION_GATE } from '../interfaces/initialization-gate.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { extendedComputed } from '../utils/signals/extended-computed';

@Injectable()
export class FlowRenderingService {
  private entities = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);
  private injector = inject(Injector);

  /**
   * The first layout is complete: the flow has a size, and every node has its size and handle positions. Once true
   * it stays true and stops tracking the graph.
   */
  public measured = extendedComputed<boolean>(
    (measured) =>
      measured ||
      (this.settings.computedFlowWidth() > 0 &&
        this.settings.computedFlowHeight() > 0 &&
        // A node without a layout box (display: none) is never measured and must not keep the flow hidden.
        this.entities.nodes().every((node) => node.isReady() || !node.hasBox())),
  );

  /** The gate on the flow element has let the flow paint, or there is no gate; `null` until the flow is measured. */
  private readonly gateOpen = signal<boolean | null>(null);

  /**
   * The flow is measured and the initialization gate on its element, if any, has called `ready`: the graph may be
   * painted and `initialized` emitted. Once true it stays true.
   */
  public flowInitialized = extendedComputed<boolean>(
    (initialized) => initialized || (this.measured() && this.gateOpen() === true),
  );

  constructor() {
    // The gate is a directive on the flow element, resolved once the element is built, not while the flow is. It is
    // told once that the flow is measured and opens when it calls `ready`.
    effect(() => {
      if (!this.measured() || untracked(this.gateOpen) !== null) return;
      untracked(() => {
        const gate = this.injector.get(VFLOW_INITIALIZATION_GATE, null, { self: true });
        this.gateOpen.set(gate === null);
        gate?.onMeasured(() => this.gateOpen.set(true));
      });
    });
  }

  /**
   * False in a DOM that never lays out, such as jsdom and happy-dom, where nothing is ever measured. The flow
   * then hides nothing: the `v-no-layout` class of its host disables the `data-v-pending` rule. Read once: the
   * check forces a layout.
   */
  public readonly hasLayout = domHasLayout(inject(DOCUMENT));

  /**
   * The elements the flow renders into, registered by the flow component once its view exists: the root, the pane
   * (the target of viewport gestures and the origin of flow coordinates) and the viewport (the element that carries
   * the zoom transform). `null` before that, and for a node rendered outside of a flow, as in a unit test.
   */
  public readonly root = signal<HTMLElement | null>(null);
  public readonly pane = signal<HTMLElement | null>(null);
  public readonly viewport = signal<HTMLElement | null>(null);
}

/** A DOM without layout gives the window a size and the root element none. */
function domHasLayout(document: Document): boolean {
  const view = document.defaultView;

  return !view || view.innerWidth === 0 || document.documentElement.clientWidth > 0;
}
