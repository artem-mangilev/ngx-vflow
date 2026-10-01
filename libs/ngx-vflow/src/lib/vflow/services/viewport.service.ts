import { Injectable, WritableSignal, inject, signal, untracked } from '@angular/core';
import { ViewportChange, ViewportState } from '../interfaces/viewport.interface';
import { getNodesFlowBounds } from '../utils/nodes';
import { FlowEntitiesService } from './flow-entities.service';
import { getViewportForBounds } from '../utils/viewport';
import { FlowSettingsService } from './flow-settings.service';
import { FitViewOptions } from '../interfaces/fit-view-options.interface';
import { NodeModel } from '../models/node.model';
import { Subject } from 'rxjs';

@Injectable()
export class ViewportService {
  private entitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);

  /**
   * The identity viewport: no translation, zoom 1.
   *
   * @returns default viewport value
   */
  private static getDefaultViewport(): ViewportState {
    return { zoom: 1, x: 0, y: 0 };
  }

  /**
   * Public signal with viewport state. User can directly read from this signal. It's updated by:
   * - user events on flow
   * - programmatic changes requested through {@link change}
   */
  public readonly readableViewport: WritableSignal<ViewportState> = signal(ViewportService.getDefaultViewport());

  public readonly viewportChangeEnd$ = new Subject<void>();

  private applyChange: ((change: ViewportChange) => void) | null = null;
  private pendingChanges: ViewportChange[] = [];

  /**
   * Requests a programmatic viewport change. Changes apply at once and in order, each from where the previous one
   * leads, so that consecutive calls compose; zoom keeps to the limits. Changes requested before the pane exists
   * wait for it.
   *
   * Applying a change reads the viewport and the zoom limits untracked, so that a call from an effect does not make
   * the effect depend on the viewport it changes.
   */
  public change(state: Partial<ViewportState>, duration = 0) {
    const change = { state, duration };
    const apply = this.applyChange;
    if (apply) untracked(() => apply(change));
    else this.pendingChanges.push(change);
  }

  /** Registers the pane that applies programmatic changes; returns the function that unregisters it. */
  public connect(apply: (change: ViewportChange) => void): () => void {
    this.applyChange = apply;
    untracked(() => {
      for (const change of this.pendingChanges.splice(0)) apply(change);
    });

    return () => {
      if (this.applyChange === apply) this.applyChange = null;
    };
  }

  /** Returns the target state, or `undefined` when there is nothing to fit. */
  public fitView(options: FitViewOptions = { padding: 0.1, duration: 0, nodes: [] }): ViewportState | undefined {
    const nodes = this.getBoundsNodes(options.nodes ?? []);
    const width = this.flowSettingsService.computedFlowWidth();
    const height = this.flowSettingsService.computedFlowHeight();

    if (!nodes.length || width <= 0 || height <= 0) return undefined;

    const state = getViewportForBounds(
      getNodesFlowBounds(nodes),
      width,
      height,
      this.flowSettingsService.minZoom(),
      this.flowSettingsService.maxZoom(),
      options.padding ?? 0.1,
    );

    this.change(state, options.duration ?? 0);
    return state;
  }

  public triggerViewportChangeEvent(type: 'end') {
    if (type === 'end') {
      this.viewportChangeEnd$.next();
    }
  }

  private getBoundsNodes(nodeIds: string[]) {
    return !nodeIds?.length
      ? // If nodes option not passed or the list is empty, then get fit the whole view
        this.entitiesService.nodes()
      : // Otherwise fit to specific nodes
        nodeIds
          .map((nodeId) => this.entitiesService.nodeByIdMap().get(nodeId))
          .filter((node): node is NodeModel => !!node);
  }
}
