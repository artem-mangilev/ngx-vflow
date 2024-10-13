import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyboardService } from './keyboard.service';

export interface ViewportForSelection {
  start: ViewportState
  end: ViewportState
  /**
   * Target may not exist if viewport change made programmatically
   */
  target?: Element
}

@Injectable()
export class SelectionService {
  private static delta = 6

  private flowEntitiesService = inject(FlowEntitiesService)
  private keyboardService = inject(KeyboardService);

  protected viewport$ = new Subject<ViewportForSelection>()

  protected resetSelection = this.viewport$.pipe(
    tap(({ start, end, target }) => {
      if (start && end && target) {
        const delta = SelectionService.delta

        const diffX = Math.abs(end.x - start.x)
        const diffY = Math.abs(end.y - start.y)

        // click (not drag)
        const isClick = diffX < delta && diffY < delta
        // do not reset if event chain contains selectable elems
        const isNotSelectable = !target.closest('.selectable')

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
    // ? May be not a responsibility of this method
    // if entity already selected - do nothing
    if (entity?.selected()) {
      return
    }

    if (!this.keyboardService.isActiveAction('multiSelection')) {
      // undo select for previously selected nodes
      this.flowEntitiesService.entities()
        .filter(n => n.selected)
        .forEach(n => n.selected.set(false))
    }

    if (entity) {
      // select passed entity
      entity.selected.set(true)
    }
  }
}
