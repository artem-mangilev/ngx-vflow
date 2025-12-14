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
import { filter, map } from 'rxjs';
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
   * Watch nodes change
   */
  public readonly onNodesChange = outputFromObservable(this.nodesChangeService.changes$);

  public readonly onNodesChangePosition = outputFromObservable(this.nodeChangesOfType('position'), {
    alias: 'onNodesChange.position',
  });

  public readonly onNodesChangeSize = outputFromObservable(this.nodeChangesOfType('size'), {
    alias: 'onNodesChange.size',
  });

  public readonly onNodesChangeAdd = outputFromObservable(this.nodeChangesOfType('add'), {
    alias: 'onNodesChange.add',
  });

  public readonly onNodesChangeRemove = outputFromObservable(this.nodeChangesOfType('remove'), {
    alias: 'onNodesChange.remove',
  });

  public readonly onNodesChangeSelect = outputFromObservable(this.nodeChangesOfType('select'), {
    alias: 'onNodesChange.select',
  });

  /**
   * Watch edges change
   */
  public readonly onEdgesChange = outputFromObservable(this.edgesChangeService.changes$);

  public readonly onNodesChangeDetached = outputFromObservable(this.edgeChangesOfType('detached'), {
    alias: 'onEdgesChange.detached',
  });

  public readonly onEdgesChangeAdd = outputFromObservable(this.edgeChangesOfType('add'), {
    alias: 'onEdgesChange.add',
  });

  public readonly onEdgeChangeRemove = outputFromObservable(this.edgeChangesOfType('remove'), {
    alias: 'onEdgesChange.remove',
  });

  public readonly onEdgeChangeSelect = outputFromObservable(this.edgeChangesOfType('select'), {
    alias: 'onEdgesChange.select',
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
