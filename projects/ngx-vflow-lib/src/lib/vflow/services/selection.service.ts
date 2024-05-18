import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { ViewportService } from './viewport.service';
import { FlowEntitiesService } from './flow-entities.service';

@Injectable()
export class SelectionService {
  private static delta = 6

  private viewportService = inject(ViewportService)
  private flowEntitiesService = inject(FlowEntitiesService)

  protected viewportStart = signal<ViewportState>(
    this.viewportService.readableViewport()
  )
  protected viewportEnd = signal<ViewportState>(
    this.viewportService.readableViewport()
  )

  protected resetSelection = effect(() => {
    const viewportStart = untracked(this.viewportStart)
    const viewportEnd = this.viewportEnd()

    if (viewportStart && viewportEnd) {
      const delta = SelectionService.delta

      const diffX = Math.abs(viewportEnd.x - viewportStart.x)
      const diffY = Math.abs(viewportEnd.y - viewportStart.y)

      // click (not drag)
      if (diffX < delta && diffY < delta) {
        this.flowEntitiesService.select(null)
      }
    }

    // TODO: allowSignalWrites
  }, { allowSignalWrites: true })

  public setViewportStart(state: ViewportState) {
    this.viewportStart.set(state)
  }

  public setViewportEnd(state: ViewportState) {
    this.viewportEnd.set(state)
  }
}
