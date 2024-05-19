import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { ViewportService } from './viewport.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ViewportForSelection {
  start: ViewportState
  end: ViewportState
  target: Element
}

@Injectable()
export class SelectionService {
  private static delta = 6

  private flowEntitiesService = inject(FlowEntitiesService)

  protected viewport$ = new Subject<ViewportForSelection>()

  protected resetSelection = this.viewport$.pipe(
    tap((viewport) => {
      if (viewport.start && viewport.end) {
        const delta = SelectionService.delta

        const diffX = Math.abs(viewport.end.x - viewport.start.x)
        const diffY = Math.abs(viewport.end.y - viewport.start.y)

        // click (not drag)
        const isClick = diffX < delta && diffY < delta
        // do not reset if event chain contains selectable elems
        const isNotSelectable = !viewport.target.closest('.selectable')

        if (isClick && isNotSelectable) {
          this.select(null)
        }
      }
    }),
    takeUntilDestroyed()
  ).subscribe()


  public setViewport(viewport: ViewportForSelection) {
    this.viewport$.next(viewport)
  }

  public select(entity: FlowEntity | null) {
    // undo select for previously selected nodes
    this.flowEntitiesService.entities()
      .filter(n => n.selected)
      .forEach(n => n.selected.set(false))

    if (entity) {
      // select passed entity
      entity.selected.set(true)
    }
  }
}
