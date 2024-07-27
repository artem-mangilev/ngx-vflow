import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { ViewportState, WritableViewport } from '../interfaces/viewport.interface';
import { getNodesBounds } from '../utils/nodes';
import { FlowEntitiesService } from './flow-entities.service';
import { getViewportForBounds } from '../utils/viewport';
import { FlowSettingsService } from './flow-settings.service';

@Injectable()
export class ViewportService {
  private entitiesService = inject(FlowEntitiesService)
  private flowSettingsService = inject(FlowSettingsService)

  /**
   * The default value used by d3, just copy it here
   *
   * @returns default viewport value
   */
  private static getDefaultViewport(): ViewportState { return { zoom: 1, x: 0, y: 0 } }

  /**
   * Internal signal that accepts value from user by lib api
   * When this signal changes, lib sets new view state and update readableViewport signal
   */
  public readonly writableViewport: WritableSignal<WritableViewport> = signal({
    changeType: 'initial',
    state: ViewportService.getDefaultViewport()
  })

  /**
   * Public signal with viewport state. User can directly read from this signal. It's updated by:
   * - user events on flow
   * - writableViewport signal
   */
  public readonly readableViewport: WritableSignal<ViewportState> = signal(ViewportService.getDefaultViewport())

  // TODO: add writableViewportWithConstraints (to apply min zoom/max zoom values)

  public fitView() {
    const state = getViewportForBounds(
      getNodesBounds(this.entitiesService.nodes()),
      this.flowSettingsService.computedFlowWidth(),
      this.flowSettingsService.computedFlowHeight(),
      this.flowSettingsService.minZoom(),
      this.flowSettingsService.maxZoom(),
      0.1
    )

    this.writableViewport.set({ changeType: 'absolute', state })
  }
}
