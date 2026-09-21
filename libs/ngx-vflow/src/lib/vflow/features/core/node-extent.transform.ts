import { inject } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { GeometryIntent, GeometryTransform } from '../geometry-intent.interface';

/**
 * Keeps a node whose `extent` is `'parent'` inside its parent's box. A parent size proposed earlier in the same
 * batch counts, so a parent grown by another transform widens the allowed area in the same frame. A hard
 * constraint: it ignores claimed axes.
 */
export class NodeExtentTransform implements GeometryTransform {
  public readonly id = 'core:node-extent';
  public readonly precedence = 'lowest';
  public readonly kinds = ['move'] as const;

  private readonly entities = inject(FlowEntitiesService);

  public transform(intent: GeometryIntent): void {
    for (const change of intent.changes) {
      if (!change.point) continue;
      const model = this.entities.getNode(change.id);
      const parent = model?.parent();
      if (!model || !parent || model.extent() !== 'parent') continue;

      const pending = intent.changes.find((other) => other.id === parent.rawNode.id);
      const parentWidth = pending?.width ?? parent.width();
      const parentHeight = pending?.height ?? parent.height();
      const width = change.width ?? model.width();
      const height = change.height ?? model.height();

      change.point.x = Math.max(0, Math.min(parentWidth - width, change.point.x));
      change.point.y = Math.max(0, Math.min(parentHeight - height, change.point.y));
    }
  }
}
