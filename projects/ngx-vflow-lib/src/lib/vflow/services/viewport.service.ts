import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { ViewportState, WritableViewport } from '../interfaces/viewport.interface';
import { getNodesBounds } from '../utils/nodes';
import { FlowEntitiesService } from './flow-entities.service';
import { getViewportForBounds } from '../utils/viewport';
import { FlowSettingsService } from './flow-settings.service';
import { FitViewOptions } from '../interfaces/fit-view-options.interface';
import { NodeModel } from '../models/node.model';

@Injectable()
export class ViewportService {
  private entitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);

  /**
   * The default value used by d3, just copy it here
   *
   * @returns default viewport value
   */
  private static getDefaultViewport(): ViewportState {
    return { zoom: 1, x: 0, y: 0 };
  }

  /**
   * Internal signal that accepts value from user by lib api
   * When this signal changes, lib sets new view state and update readableViewport signal
   */
  public readonly writableViewport: WritableSignal<WritableViewport> = signal({
    changeType: 'initial',
    state: ViewportService.getDefaultViewport(),
    duration: 0,
  });

  /**
   * Public signal with viewport state. User can directly read from this signal. It's updated by:
   * - user events on flow
   * - writableViewport signal
   */
  public readonly readableViewport: WritableSignal<ViewportState> = signal(ViewportService.getDefaultViewport());

  // TODO: add writableViewportWithConstraints (to apply min zoom/max zoom values)

  public fitView(options: FitViewOptions = { padding: 0.1, duration: 0, nodes: [] }) {
    const nodes = this.getBoundsNodes(options.nodes ?? []);

    const state = getViewportForBounds(
      getNodesBounds(nodes),
      this.flowSettingsService.computedFlowWidth(),
      this.flowSettingsService.computedFlowHeight(),
      this.flowSettingsService.minZoom(),
      this.flowSettingsService.maxZoom(),
      options.padding ?? 0.1,
    );

    const duration = options.duration ?? 0;

    this.writableViewport.set({ changeType: 'absolute', state, duration });
  }

  private getBoundsNodes(nodeIds: string[]) {
    return !nodeIds?.length
      ? // If nodes option not passed or the list is empty, then get fit the whole view
        this.entitiesService.nodes()
      : // Otherwise fit to specific nodes
        nodeIds
          .map((nodeId) => this.entitiesService.nodes().find(({ rawNode }) => rawNode.id === nodeId))
          .filter((node): node is NodeModel => !!node);
  }
}
