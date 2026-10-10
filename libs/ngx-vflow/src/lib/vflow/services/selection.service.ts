import { Injectable, inject } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyboardService } from './keyboard.service';
import { FlowSettingsService } from './flow-settings.service';

export interface ViewportForSelection {
  start: ViewportState;
  end: ViewportState;
  /**
   * Target may not exist if viewport change made programmatically
   */
  target?: Element;
}

@Injectable()
export class SelectionService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private keyboardService = inject(KeyboardService);
  private flowSettingsService = inject(FlowSettingsService);

  protected viewport$ = new Subject<ViewportForSelection>();

  protected viewportChangeSub = this.viewport$
    .pipe(
      tap(({ start, end, target }) => {
        if (start && end && target) {
          this.handlePaneGesture(start, end, target);
        }
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  public setViewport(viewport: ViewportForSelection) {
    this.viewport$.next(viewport);
  }

  /** Selects an entity, or clears the selection for `null`. In manual mode the application owns every write. */
  public select(entity: FlowEntity | null) {
    if (this.isManual()) return;

    if (entity && !entity.selectable()) {
      return;
    }

    // if entity already selected - do nothing
    if (entity?.selected()) {
      return;
    }

    if (!this.keyboardService.isActiveModifier('multiSelection')) {
      // undo select for previously selected nodes
      this.flowEntitiesService.entities().forEach((n) => n.selected.set(false));
    }

    if (entity) {
      // select passed entity
      entity.selected.set(true);
    }
  }

  /** Returns whether any selection state changed. */
  public selectFromKeyboard(entity: FlowEntity | null, toggle: boolean): boolean {
    if (this.isManual()) return false;
    // Denying selection acquisition must still allow deselection.
    if (entity && !entity.selectable() && !(toggle && entity.selected())) return false;
    if (entity && toggle) {
      entity.selected.set(!entity.selected());
      return true;
    }
    let changed = false;
    for (const item of this.flowEntitiesService.entities()) {
      const selected = item === entity;
      if (item.selected() !== selected) {
        item.selected.set(selected);
        changed = true;
      }
    }
    return changed;
  }

  /** A click on the pane, outside every node and edge, clears the selection; a pan keeps it. */
  private handlePaneGesture(start: ViewportState, end: ViewportState, target: Element) {
    const delta = this.flowSettingsService.paneClickDistance();
    const diffX = Math.abs(end.x - start.x);
    const diffY = Math.abs(end.y - start.y);

    const isClick = delta === 0 ? diffX === 0 && diffY === 0 : diffX < delta && diffY < delta;
    // A click on a node or an edge is handled by that entity, not by the pane.
    const isOnPane = !target.closest('.v-node, .v-edge');

    if (isClick && isOnPane) {
      this.select(null);
    }
  }

  private isManual() {
    return this.flowSettingsService.selectionMode() === 'manual';
  }
}
