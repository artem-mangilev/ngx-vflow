import { SelectionStrategy, SelectionContext, ViewportChangeContext } from '../interfaces/selection-strategy.interface';
import { FlowEntity } from '../interfaces/flow-entity.interface';

export class DefaultSelectionStrategy implements SelectionStrategy {
  select(entity: FlowEntity | null, context: SelectionContext): void {
    // if entity already selected - do nothing
    if (entity?.selected()) {
      return;
    }

    if (!context.isMultiSelectionActive) {
      // undo select for previously selected nodes
      context.entities.forEach((n) => n.selected.set(false));
    }

    if (entity) {
      // select passed entity
      entity.selected.set(true);
    }
  }

  handleViewportChange(viewport: ViewportChangeContext, context: SelectionContext): void {
    const { start, end, target, delta } = viewport;

    const diffX = Math.abs(end.x - start.x);
    const diffY = Math.abs(end.y - start.y);

    // click (not drag)
    const isClick = diffX < delta && diffY < delta;
    // do not reset if event chain contains selectable elems
    const isNotSelectable = !target.closest('.selectable');

    if (isClick && isNotSelectable) {
      this.select(null, context);
    }
  }
}
