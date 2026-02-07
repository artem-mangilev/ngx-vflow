import { Directive, inject } from '@angular/core';
import {
  NodeAddChange,
  NodeChange,
  NodePositionChange,
  NodeRemoveChange,
  NodeSelectedChange,
  NodeSizeChange,
} from '../types/node-change.type';
import { EdgeChangesService } from '../services/edge-changes.service';
import { NodesChangeService } from '../services/node-changes.service';
import { filter, map } from 'rxjs/operators';
import {
  EdgeAddChange,
  EdgeChange,
  EdgeDetachedChange,
  EdgeRemoveChange,
  EdgeSelectChange,
} from '../types/edge-change.type';
import { outputFromObservable } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[changesController]',
  standalone: true,
})
export class ChangesControllerDirective {
  protected nodesChangeService = inject(NodesChangeService);
  protected edgesChangeService = inject(EdgeChangesService);

  /**
   * Watch nodes changes
   */
  public readonly nodesChanges = outputFromObservable(this.nodesChangeService.changes$);

  public readonly nodesChangesPosition = outputFromObservable(this.nodeChangesOfType('position'), {
    alias: 'nodesChanges.position',
  });

  public readonly nodesChangesSize = outputFromObservable(this.nodeChangesOfType('size'), {
    alias: 'nodesChanges.size',
  });

  public readonly nodesChangesAdd = outputFromObservable(this.nodeChangesOfType('add'), {
    alias: 'nodesChanges.add',
  });

  public readonly nodesChangesRemove = outputFromObservable(this.nodeChangesOfType('remove'), {
    alias: 'nodesChanges.remove',
  });

  public readonly nodesChangesSelect = outputFromObservable(this.nodeChangesOfType('select'), {
    alias: 'nodesChanges.select',
  });

  /**
   * Watch edges change
   */
  public readonly edgesChanges = outputFromObservable(this.edgesChangeService.changes$);

  public readonly edgesChangesDetached = outputFromObservable(this.edgeChangesOfType('detached'), {
    alias: 'edgesChanges.detached',
  });

  public readonly edgesChangesAdd = outputFromObservable(this.edgeChangesOfType('add'), {
    alias: 'edgesChanges.add',
  });

  public readonly edgesChangesRemove = outputFromObservable(this.edgeChangesOfType('remove'), {
    alias: 'edgesChanges.remove',
  });

  public readonly edgesChangesSelect = outputFromObservable(this.edgeChangesOfType('select'), {
    alias: 'edgesChanges.select',
  });

  private nodeChangesOfType<T extends NodeChange['type']>(type: T) {
    return this.nodesChangeService.changes$.pipe(
      map((changes) => changes.filter((c): c is NodeChangeMap[T] => c.type === type)),
      filter((changes) => !!changes.length),
    );
  }

  private edgeChangesOfType<T extends EdgeChange['type']>(type: T) {
    return this.edgesChangeService.changes$.pipe(
      map((changes) => changes.filter((c): c is EdgeChangeMap[T] => c.type === type)),
      filter((changes) => !!changes.length),
    );
  }
}

// TODO: do not write this types manually
type NodeChangeMap = {
  position: NodePositionChange;
  size: NodeSizeChange;
  add: NodeAddChange;
  remove: NodeRemoveChange;
  select: NodeSelectedChange;
};

type EdgeChangeMap = {
  detached: EdgeDetachedChange;
  add: EdgeAddChange;
  remove: EdgeRemoveChange;
  select: EdgeSelectChange;
};
