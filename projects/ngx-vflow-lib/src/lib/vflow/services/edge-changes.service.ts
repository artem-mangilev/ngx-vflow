import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { Observable, asyncScheduler, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, observeOn, pairwise, skip, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { EdgeChange } from '../types/edge-change.type';

@Injectable()
export class EdgeChangesService {
  protected entitiesService = inject(FlowEntitiesService);

  protected edgeDetachedChange$ = toObservable(
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
  ) satisfies Observable<EdgeChange[]>;

  protected edgeAddChange$ = toObservable(this.entitiesService.edges).pipe(
    pairwise(),
    map(([oldList, newList]) => {
      return newList.filter((edge) => !oldList.includes(edge));
    }),
    filter((edges) => !!edges.length),
    map((edges) => edges.map(({ edge }) => ({ type: 'add', id: edge.id }))),
  ) satisfies Observable<EdgeChange[]>;

  protected edgeRemoveChange$ = toObservable(this.entitiesService.edges).pipe(
    pairwise(),
    map(([oldList, newList]) => {
      return oldList.filter((edge) => !newList.includes(edge));
    }),
    filter((edges) => !!edges.length),
    map((edges) => edges.map(({ edge }) => ({ type: 'remove', id: edge.id }))),
  ) satisfies Observable<EdgeChange[]>;

  protected edgeSelectChange$ = toObservable(this.entitiesService.edges).pipe(
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
  ) satisfies Observable<EdgeChange[]>;

  public readonly changes$: Observable<EdgeChange[]> = merge(
    this.edgeDetachedChange$,
    this.edgeAddChange$,
    this.edgeRemoveChange$,
    this.edgeSelectChange$,
  ).pipe(
    // this fixes the case when user gets 'deteched' changes
    // and tries to delete these edges inside stream
    // angular may ignore this change because [edges] input changed
    // right after [nodes] input change
    observeOn(asyncScheduler),
  );
}
