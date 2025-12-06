import { Injectable, inject } from '@angular/core';
import { SelectionStrategy } from '../interfaces/selection-strategy.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { KeyboardService } from './keyboard.service';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { ViewportForSelection } from './selection.service';

/**
 * Default selection strategy for ngx-vflow.
 * Implements the standard single/multi selection logic.
 */
@Injectable()
export class DefaultSelectionStrategy implements SelectionStrategy {
  private static delta = 6;

  private flowEntitiesService = inject(FlowEntitiesService);
  private keyboardService = inject(KeyboardService);

  select(entity: FlowEntity | null): void {
    if (entity?.selected()) {
      return;
    }
    if (!this.keyboardService.isActiveAction('multiSelection')) {
      this.flowEntitiesService.entities().forEach((n) => n.selected.set(false));
    }
    if (entity) {
      entity.selected.set(true);
    }
  }

  handleViewportChange(viewport: ViewportForSelection): void {
    const { start, end, target } = viewport;
    if (start && end && target) {
      const delta = DefaultSelectionStrategy.delta;
      const diffX = Math.abs(end.x - start.x);
      const diffY = Math.abs(end.y - start.y);
      const isClick = diffX < delta && diffY < delta;
      const isNotSelectable = !target.closest('.selectable');
      if (isClick && isNotSelectable) {
        this.select(null);
      }
    }
  }
}
