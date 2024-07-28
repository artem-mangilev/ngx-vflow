import { Injectable, Signal, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, animationFrameScheduler, asyncScheduler, distinctUntilChanged, filter, map, merge, observeOn, of, pairwise, skip, switchMap } from 'rxjs';
import { NodeChange } from '../types/node-change.type';

@Injectable()
export class NodesChangeService {
  protected entitiesService = inject(FlowEntitiesService)

  protected nodesPositionChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      // Check for nodes list change and watch for specific node from this list change its position
      switchMap((nodes) =>
        merge(
          ...nodes.map(node =>
            node.point$.pipe(
              // skip initial position from signal
              skip(1),
              map(() => node)
            )
          )
        )
      ),
      // For now it's a single node, later this list will also be filled
      // with child node position changes
      map(changedNode => [
        { type: 'position', id: changedNode.node.id, point: changedNode.point() }
      ])
    ) satisfies Observable<NodeChange[]>

  protected nodeAddChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      pairwise(),
      map(([oldList, newList]) =>
        newList.filter(node => !oldList.includes(node))
      ),
      filter((nodes) => !!nodes.length),
      map((nodes) =>
        nodes.map(node => ({ type: 'add', id: node.node.id }))
      )
    ) satisfies Observable<NodeChange[]>

  protected nodeRemoveChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      pairwise(),
      map(([oldList, newList]) =>
        oldList.filter(node => !newList.includes(node))
      ),
      filter((nodes) => !!nodes.length),
      map((nodes) =>
        nodes.map(node => ({ type: 'remove', id: node.node.id }))
      )
    ) satisfies Observable<NodeChange[]>

  protected nodeSelectedChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      switchMap((nodes) =>
        merge(
          ...nodes.map(node =>
            node.selected$.pipe(
              distinctUntilChanged(),
              skip(1),
              map(() => node),
            )
          )
        )
      ),
      map((changedNode) => [
        { type: 'select', id: changedNode.node.id, selected: changedNode.selected() }
      ])
    ) satisfies Observable<NodeChange[]>

  public readonly changes$: Observable<NodeChange[]> = merge(
    this.nodesPositionChange$,
    this.nodeAddChange$,
    this.nodeRemoveChange$,
    this.nodeSelectedChange$
  ).pipe(
    // this fixes a bug when on fire node event change,
    // you can't get valid list of detached edges
    observeOn(animationFrameScheduler),
  )
}
