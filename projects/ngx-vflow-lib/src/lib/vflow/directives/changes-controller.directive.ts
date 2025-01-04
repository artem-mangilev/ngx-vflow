import { Directive, inject, output } from '@angular/core';
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
import { Observable, filter, map } from 'rxjs';
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

  public readonly onNodesChangePosition = outputFromObservable(
    this.nodeChangesOfType('position'),
    { alias: 'onNodesChange.position' },
  );

  public readonly onNodesChangePositionSignle = outputFromObservable(
    this.singleChange(this.nodeChangesOfType('position')),
    { alias: 'onNodesChange.position.single' },
  );

  public readonly onNodesChangePositionMany = outputFromObservable(
    this.manyChanges(this.nodeChangesOfType('position')),
    { alias: 'onNodesChange.position.many' },
  );

  public readonly onNodesChangeSize = outputFromObservable(
    this.nodeChangesOfType('size'),
    { alias: 'onNodesChange.size' },
  );

  public readonly onNodesChangeSizeSingle = outputFromObservable(
    this.singleChange(this.nodeChangesOfType('size')),
    { alias: 'onNodesChange.size.single' },
  );

  public readonly onNodesChangeSizeMany = outputFromObservable(
    this.manyChanges(this.nodeChangesOfType('size')),
    { alias: 'onNodesChange.size.many' },
  );

  public readonly onNodesChangeAdd = outputFromObservable(
    this.nodeChangesOfType('add'),
    { alias: 'onNodesChange.add' },
  );

  public readonly onNodesChangeAddSingle = outputFromObservable(
    this.singleChange(this.nodeChangesOfType('add')),
    { alias: 'onNodesChange.add.single' },
  );

  public readonly onNodesChangeAddMany = outputFromObservable(
    this.manyChanges(this.nodeChangesOfType('add')),
    { alias: 'onNodesChange.add.many' },
  );

  public readonly onNodesChangeRemove = outputFromObservable(
    this.nodeChangesOfType('remove'),
    { alias: 'onNodesChange.remove' },
  );

  public readonly onNodesChangeRemoveSingle = outputFromObservable(
    this.singleChange(this.nodeChangesOfType('remove')),
    { alias: 'onNodesChange.remove.single' },
  );

  public readonly onNodesChangeRemoveMany = outputFromObservable(
    this.manyChanges(this.nodeChangesOfType('remove')),
    { alias: 'onNodesChange.remove.many' },
  );

  public readonly onNodesChangeSelect = outputFromObservable(
    this.nodeChangesOfType('select'),
    { alias: 'onNodesChange.select' },
  );

  public readonly onNodesChangeSelectSingle = outputFromObservable(
    this.singleChange(this.nodeChangesOfType('select')),
    { alias: 'onNodesChange.select.single' },
  );

  public readonly onNodesChangeSelectMany = outputFromObservable(
    this.manyChanges(this.nodeChangesOfType('select')),
    { alias: 'onNodesChange.select.many' },
  );

  /**
   * Watch edges change
   */
  public readonly onEdgesChange = outputFromObservable(this.edgesChangeService.changes$);

  public readonly onNodesChangeDetached = outputFromObservable(
    this.edgeChangesOfType('detached'),
    { alias: 'onEdgesChange.detached' },
  );

  public readonly onNodesChangeDetachedSingle = outputFromObservable(
    this.singleChange(this.edgeChangesOfType('detached')),
    { alias: 'onEdgesChange.detached.single' },
  );

  public readonly onNodesChangeDetachedMany = outputFromObservable(
    this.manyChanges(this.edgeChangesOfType('detached')),
    { alias: 'onEdgesChange.detached.many' },
  );

  public readonly onEdgesChangeAdd = outputFromObservable(
    this.edgeChangesOfType('add'),
    { alias: 'onEdgesChange.add' },
  );

  public readonly onEdgeChangeAddSingle = outputFromObservable(
    this.singleChange(this.edgeChangesOfType('add')),
    { alias: 'onEdgesChange.add.single' },
  );

  public readonly onEdgeChangeAddMany = outputFromObservable(
    this.manyChanges(this.edgeChangesOfType('add')),
    { alias: 'onEdgesChange.add.many' },
  );

  public readonly onEdgeChangeRemove = outputFromObservable(
    this.edgeChangesOfType('remove'),
    { alias: 'onEdgesChange.remove' },
  );

  public readonly onEdgeChangeRemoveSingle = outputFromObservable(
    this.singleChange(this.edgeChangesOfType('remove')),
    { alias: 'onEdgesChange.remove.single' },
  );

  public readonly onEdgeChangeRemoveMany = outputFromObservable(
    this.manyChanges(this.edgeChangesOfType('remove')),
    { alias: 'onEdgesChange.remove.many' },
  );

  public readonly onEdgeChangeSelect = outputFromObservable(
    this.edgeChangesOfType('select'),
    { alias: 'onEdgesChange.select' },
  );

  public readonly onEdgeChangeSelectSingle = outputFromObservable(
    this.singleChange(this.edgeChangesOfType('select')),
    { alias: 'onEdgesChange.select.single' },
  );

  public readonly onEdgeChangeSelectMany = outputFromObservable(
    this.manyChanges(this.edgeChangesOfType('select')),
    { alias: 'onEdgesChange.select.many' },
  );

  private nodeChangesOfType<T extends NodeChange['type']>(type: T) {
    return this.nodesChangeService.changes$.pipe(
      map((changes) =>
        changes.filter((c): c is NodeChangeMap[T] => c.type === type),
      ),
      filter((changes) => !!changes.length),
    );
  }

  private edgeChangesOfType<T extends EdgeChange['type']>(type: T) {
    return this.edgesChangeService.changes$.pipe(
      map((changes) =>
        changes.filter((c): c is EdgeChangeMap[T] => c.type === type),
      ),
      filter((changes) => !!changes.length),
    );
  }

  private singleChange<T>(changes$: Observable<T[]>) {
    return changes$.pipe(
      filter((changes) => changes.length === 1),
      map(([first]) => first),
    );
  }

  private manyChanges<T>(changes$: Observable<T[]>) {
    return changes$.pipe(filter((changes) => changes.length > 1));
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
