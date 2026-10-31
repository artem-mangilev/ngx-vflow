import { Injectable, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { KeyboardService } from './keyboard.service';
import { FlowSettingsService } from './flow-settings.service';

@Injectable()
export class SelectionService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private keyboardService = inject(KeyboardService);
  private flowSettingsService = inject(FlowSettingsService);

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

  private isManual() {
    return this.flowSettingsService.selectionMode() === 'manual';
  }
}
