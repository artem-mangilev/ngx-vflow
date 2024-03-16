import { Injectable, computed, inject, untracked } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { Observable, animationFrameScheduler, asapScheduler, asyncScheduler, distinctUntilChanged, filter, map, merge, observeOn, pairwise, queueScheduler, skip, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export type EdgeChange = { id: string } & (EdgeDetachedChange | EdgeRemoveChange)

interface EdgeDetachedChange {
  type: 'detached'
}

interface EdgeRemoveChange {
  type: 'remove'
}

@Injectable()
export class EdgeChangesService {
  protected entitiesService = inject(FlowEntitiesService)

  protected edgeDetachedChange$ = toObservable(
    computed(() => {
      const nodes = this.entitiesService.nodes()

      return untracked(this.entitiesService.edges).filter(({ source, target }) =>
        !nodes.includes(source) || !nodes.includes(target)
      )
    })
  ).pipe(
    filter(edges => !!edges.length),
    // do not emit if the same detached list was generated
    distinctUntilChanged((prev, current) => {
      const prevAsString = prev.map(edge => edge.edge.id).sort().join('')
      const currentAsString = current.map(edge => edge.edge.id).sort().join('')

      return prevAsString === currentAsString

    }),
    map((edges) =>
      edges.map(({ edge }) => ({ type: 'detached', id: edge.id }))
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
