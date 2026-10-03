import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { Observable, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, share, skip, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  EdgeAddChange,
  EdgeChange,
  EdgeDetachedChange,
  EdgeRemoveChange,
  EdgeSelectChange,
} from '../types/edge-change.type';
import { batchChanges } from '../utils/batch-changes';

@Injectable()
export class EdgeChangesService {
  protected entitiesService = inject(FlowEntitiesService);

  protected edgeDetachedChange$: Observable<EdgeDetachedChange[]> = toObservable(
    computed(() => {
      const nodes = new Set(this.entitiesService.nodes());
      return this.entitiesService
        .edges()
        .filter((edge) => !nodes.has(edge.source()!) || !nodes.has(edge.target()!) || edge.detached());
    }),
  ).pipe(
    pairwise(),
    map(([previous, current]) => {
      const detached = new Set(previous);
      return current.filter((edge) => !detached.has(edge));
    }),
    filter((edges) => edges.length > 0),
    map((edges) => edges.map(({ edge }) => ({ type: 'detached', id: edge.id }))),
  );

  protected edgeAddChange$: Observable<EdgeAddChange[]> = toObservable(this.entitiesService.edges).pipe(
    pairwise(),
    map(([oldList, newList]) => {
      return newList.filter((edge) => !oldList.includes(edge));
    }),
    filter((edges) => !!edges.length),
    map((edges) => edges.map(({ edge }) => ({ type: 'add', id: edge.id }))),
  );

  protected edgeRemoveChange$: Observable<EdgeRemoveChange[]> = toObservable(this.entitiesService.edges).pipe(
    pairwise(),
    map(([oldList, newList]) => {
      return oldList.filter((edge) => !newList.includes(edge));
    }),
    filter((edges) => !!edges.length),
    map((edges) => edges.map(({ edge }) => ({ type: 'remove', id: edge.id }))),
  );

  protected edgeSelectChange$: Observable<EdgeSelectChange[]> = toObservable(this.entitiesService.edges).pipe(
    switchMap((edges) =>
      merge(
        ...edges.map((edge) =>
          edge.selected$.pipe(
            distinctUntilChanged(),
            skip(1),
            map(() => edge),
          ),
        ),
      ),
    ),
    map((changedEdge) => [{ type: 'select', id: changedEdge.edge.id, selected: changedEdge.selected() }]),
  );

  /** Every change of one tick as a single array. */
  public readonly changes$: Observable<EdgeChange[]> = this.deliver(
    merge<EdgeChange[][]>(
      this.edgeDetachedChange$,
      this.edgeAddChange$,
      this.edgeRemoveChange$,
      this.edgeSelectChange$,
    ),
  );

  private readonly changesByType: { [T in EdgeChange['type']]: Observable<Extract<EdgeChange, { type: T }>[]> } = {
    detached: this.deliver(this.edgeDetachedChange$),
    add: this.deliver(this.edgeAddChange$),
    remove: this.deliver(this.edgeRemoveChange$),
    select: this.deliver(this.edgeSelectChange$),
  };

  /** The changes of one type, one array per tick. It observes only what this type needs. */
  public changesOfType<T extends EdgeChange['type']>(type: T) {
    return this.changesByType[type];
  }

  private deliver<T>(changes$: Observable<T[]>): Observable<T[]> {
    return changes$.pipe(
      // the delivery in a later task fixes the case when user gets 'deteched' changes
      // and tries to delete these edges inside stream
      // angular may ignore this change because [edges] input changed
      // right after [nodes] input change
      batchChanges(),
      share(),
    );
  }
}
