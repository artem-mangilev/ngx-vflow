import { Injectable, computed, inject, untracked } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { Observable, asyncScheduler, filter, map, merge, observeOn, pairwise, skip } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { EdgeChange } from '../types/edge-change.type';

@Injectable()
export class EdgeChangesService {
  protected entitiesService = inject(FlowEntitiesService)

  protected edgeDetachedChange$ = toObservable(
    computed(() => {
      const nodes = this.entitiesService.nodes()
      const edges = untracked(this.entitiesService.edges)

      return edges.filter(({ source, target }) =>
        !nodes.includes(source) || !nodes.includes(target)
      )
    })
  ).pipe(
    // TODO check why there are 2 emits from single call inside computed
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
