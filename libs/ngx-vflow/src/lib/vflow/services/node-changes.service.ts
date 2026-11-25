import { Injectable, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, merge } from 'rxjs';
import { distinctUntilChanged, map, share, skip, switchMap } from 'rxjs/operators';
import { NodeChange, NodePositionChange, NodeSelectedChange, NodeSizeChange } from '../types/node-change.type';
import { batchChanges } from '../utils/batch-changes';

// this delay fixes the cases when change triggered
// but the flow not yet fylly re-rendered
const DELAY_FOR_SCHEDULER = 25;

@Injectable()
export class NodesChangeService {
  protected entitiesService = inject(FlowEntitiesService);

  protected nodesPositionChange$: Observable<NodePositionChange[]> = toObservable(this.entitiesService.nodes).pipe(
    // Check for nodes list change and watch for specific node from this list change its position
    switchMap((nodes) =>
      merge(
        ...nodes.map((node) =>
          node.point$.pipe(
            // skip initial position from signal
            skip(1),
            map(() => node),
          ),
        ),
      ),
    ),
    map((node) => [{ type: 'position', id: node.rawNode.id, point: node.point() }]),
  );

  protected nodeSizeChange$: Observable<NodeSizeChange[]> = toObservable(this.entitiesService.nodes).pipe(
    switchMap((nodes) =>
      merge(...nodes.map((node) => merge(node.width$.pipe(skip(1)), node.height$.pipe(skip(1))).pipe(map(() => node)))),
    ),
    map((changedNode) => [
      {
        type: 'size',
        id: changedNode.rawNode.id,
        size: { width: changedNode.width(), height: changedNode.height() },
        mode: { width: changedNode.widthMode(), height: changedNode.heightMode() },
      },
    ]),
  );

  protected nodeSelectedChange$: Observable<NodeSelectedChange[]> = toObservable(this.entitiesService.nodes).pipe(
    switchMap((nodes) =>
      merge(
        ...nodes.map((node) =>
          node.selected$.pipe(
            distinctUntilChanged(),
            skip(1),
            map(() => node),
          ),
        ),
      ),
    ),
    map((changedNode) => [{ type: 'select', id: changedNode.rawNode.id, selected: changedNode.selected() }]),
  );

  /** Every change of one tick as a single array. */
  public readonly changes$: Observable<NodeChange[]> = this.deliver(
    merge<NodeChange[][]>(this.nodesPositionChange$, this.nodeSizeChange$, this.nodeSelectedChange$),
  );

  private readonly changesByType: { [T in NodeChange['type']]: Observable<Extract<NodeChange, { type: T }>[]> } = {
    position: this.deliver(this.nodesPositionChange$),
    size: this.deliver(this.nodeSizeChange$),
    select: this.deliver(this.nodeSelectedChange$),
  };

  /** The changes of one type, one array per tick. It observes only what this type needs. */
  public changesOfType<T extends NodeChange['type']>(type: T): Observable<Extract<NodeChange, { type: T }>[]> {
    return this.changesByType[type];
  }

  private deliver<T>(changes$: Observable<T[]>): Observable<T[]> {
    return changes$.pipe(
      // The delay lets the flow finish rendering the change before the application hears of it.
      batchChanges(DELAY_FOR_SCHEDULER),
      share(),
    );
  }
}
