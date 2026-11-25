import { Injectable, inject } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { SelectionService } from './selection.service';
import { DraggableService } from './draggable.service';
import { KeyboardService } from './keyboard.service';
import { FlowSettingsService } from './flow-settings.service';
import { FlowEntitiesService } from './flow-entities.service';
import { AnnouncerService } from './announcer.service';
import { ArrowCommand } from '../utils/keyboard-commands';

/**
 * What the keyboard commands of a focused node or edge do. Each one reports whether it took the press, so a command
 * that cannot act leaves its key to the commands behind it.
 */
@Injectable()
export class KeyboardEntityCommandsService {
  private selection = inject(SelectionService);
  private draggable = inject(DraggableService);
  private keyboard = inject(KeyboardService);
  private settings = inject(FlowSettingsService);
  private entities = inject(FlowEntitiesService);
  private announcer = inject(AnnouncerService);

  public select(model: FlowEntity): boolean {
    const labels = this.settings.ariaLabels();
    if (this.selection.selectFromKeyboard(model, this.keyboard.isActiveModifier('multiSelection'))) {
      this.announcer.announce(
        labels.selectionAnnouncement({
          label: model.accessibility().label,
          selected: model.selected(),
          count: this.entities.entities().filter((entity) => entity.selected()).length,
        }),
      );
    }
    return true;
  }

  public clearSelection(): boolean {
    if (this.selection.selectFromKeyboard(null, this.keyboard.isActiveModifier('multiSelection'))) {
      this.announcer.announce(this.settings.ariaLabels().selectionClearedAnnouncement);
    }
    return true;
  }

  public requestDeletion(model: FlowEntity): boolean {
    // The command acts at the point of focus: the whole selection when the focused entity belongs to it,
    // otherwise only the focused entity, so a stale selection elsewhere is never deleted by surprise.
    const target = (entity: FlowEntity) => (model.selected() ? entity.selected() : entity === model);
    this.keyboard.deleteRequest$.next({
      nodeIds: this.entities
        .nodes()
        .filter(target)
        .map((node) => node.rawNode.id),
      edgeIds: this.entities
        .edges()
        .filter(target)
        .map((edge) => edge.edge.id),
    });
    return true;
  }

  /** Declines unless the focused entity is a node that is selected and movable, which is what lets its key pan. */
  public move(model: FlowEntity, direction: ArrowCommand, fast: boolean): boolean {
    if (!(model instanceof NodeModel) || !model.selected() || !model.draggable()) return false;
    const moved = this.draggable.moveSelected(model, direction.vector, fast);
    if (moved.length > 0) {
      const { x, y } = model.point();
      const labels = this.settings.ariaLabels();
      this.announcer.announce(labels.movedAnnouncement({ count: moved.length, direction: direction.name, x, y }));
    }
    return true;
  }
}
