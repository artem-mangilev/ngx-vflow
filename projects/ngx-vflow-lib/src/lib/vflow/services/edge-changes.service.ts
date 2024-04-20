import { Injectable, computed, inject, untracked } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { Observable, asyncScheduler, combineLatest, distinctUntilChanged, filter, map, merge, observeOn, pairwise, skip, switchMap, tap, zip } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { EdgeChange } from '../types/edge-change.type';

const haveSameContents = <T>(a: T[], b: T[]) =>
  a.length === b.length &&
  [...new Set([...a, ...b])].every(
    v => a.filter(e => e === v).length === b.filter(e => e === v).length
  );

@Injectable()
export class EdgeChangesService {
  protected entitiesService = inject(FlowEntitiesService)

  protected edgeDetachedChange$ = merge(
    toObservable(
      computed(() => {
        const nodes = this.entitiesService.nodes()
        const edges = untracked(this.entitiesService.edges)

        return edges.filter(({ source, target }) =>
          !nodes.includes(source) || !nodes.includes(target)
        )
      })
    ),
    toObservable(this.entitiesService.edges).pipe(
      switchMap((edges) => {
        return zip(
          ...edges.map(e => e.detached$.pipe(map(() => e)))
        )
      }),
      map((edges) => edges.filter(e => e.detached())),
      // TODO check why there are 2 emits
      skip(2),
    )
  ).pipe(
    // here we check if 2 approaches to detect detached edges emits same
    // and same values (this may happen on node delete)
    distinctUntilChanged(haveSameContents),
    filter(edges => !!edges.length),
    map((edges) =>
      edges.map(({ edge }) => ({ type: 'detached', id: edge.id }))
    )
  ) satisfies Observable<EdgeChange[]>

  protected edgeAddChange$ = toObservable(this.entitiesService.edges)
    .pipe(
      pairwise(),
      map(([oldList, newList]) => {
        return newList.filter(edge => !oldList.includes(edge))
      }),
      filter(edges => !!edges.length),
      map((edges) =>
        edges.map(({ edge }) => ({ type: 'add', id: edge.id }))
      )
    ) satisfies Observable<EdgeChange[]>

  protected edgeRemoveChange$ = toObservable(this.entitiesService.edges)
    .pipe(
      pairwise(),
      map(([oldList, newList]) => {
        return oldList.filter(edge => !newList.includes(edge))
      }),
      filter(edges => !!edges.length),
      map((edges) =>
        edges.map(({ edge }) => ({ type: 'remove', id: edge.id }))
      )
    ) satisfies Observable<EdgeChange[]>

  public readonly changes$: Observable<EdgeChange[]> = merge(
    this.edgeDetachedChange$,
    this.edgeAddChange$,
    this.edgeRemoveChange$
  )
    .pipe(
      // this fixes the case when user gets 'deteched' changes
      // and tries to delete these edges inside stream
      // angular may ignore this change because [edges] input changed
      // right after [nodes] input change
      observeOn(asyncScheduler),
    )
}
