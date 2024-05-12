import { Injectable, effect, inject, untracked } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { BehaviorSubject, filter, map, pairwise } from 'rxjs';
import { ViewportService } from './viewport.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FlowEntitiesService } from './flow-entities.service';

@Injectable()
export class SelectionService {
  private static delta = 6

  private viewportService = inject(ViewportService)
  private flowEntitiesService = inject(FlowEntitiesService)

  protected viewportStart$ = new BehaviorSubject<ViewportState>(
    this.viewportService.readableViewport()
  )
  protected viewportEnd$ = new BehaviorSubject<ViewportState>(
    this.viewportService.readableViewport()
  )

  protected panStart = toSignal(
    this.viewportStart$.pipe(
      pairwise(),
      filter(([prevState, currentState]) => {
        // pass only pan changes
        return prevState.zoom === currentState.zoom
      }),
      map(([, currentState]) => currentState),
    )
  )

  protected panEnd = toSignal(
    this.viewportEnd$.pipe(
      pairwise(),
      filter(([prevState, currentState]) => {
        // pass only pan changes
        return prevState.zoom === currentState.zoom
      }),
      map(([, currentState]) => currentState),
    )
  )

  protected resetSelection = effect(() => {
    const panStart = untracked(this.panStart)
    const panEnd = this.panEnd()

    if (panStart && panEnd) {
      const delta = SelectionService.delta

      const diffX = Math.abs(panEnd.x - panStart.x)
      const diffY = Math.abs(panEnd.y - panStart.y)

      // click (not drag)
      if (diffX < delta && diffY < delta) {
        this.flowEntitiesService.select(null)
      }
    }

    // TODO: allowSignalWrites
  }, { allowSignalWrites: true })

  public setViewpostStart(state: ViewportState) {
    this.viewportStart$.next(state)
  }

  public setViewportEnd(state: ViewportState) {
    this.viewportEnd$.next(state)
  }
}
