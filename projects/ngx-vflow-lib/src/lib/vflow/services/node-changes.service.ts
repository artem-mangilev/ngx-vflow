import { Injectable, inject } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, merge, of, pairwise, switchMap } from 'rxjs';

export type NodeChange = { id: string } & NodePositionChange & NodeAddChange & NodeRemoveChange

interface NodePositionChange {
  type: 'position'
  point: Point
}

interface NodeAddChange {
  type: 'add'
}

interface NodeRemoveChange {
  type: 'remove'
}

@Injectable()
export class NodesChangeService {
  protected entitiesService = inject(FlowEntitiesService)

  protected nodesPositionChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      // Check for nodes list change and watch for specific node from this list change its position
      switchMap((nodes) =>
        merge(
          ...nodes.map(node => node.point$.pipe(map(() => node)))
        )
      ),
      // For now it's a single node, later this list will also be filled
      // with child node position changes
      map(changedNode => [
        { type: 'position', id: changedNode.node.id, point: changedNode.point() }
      ])
    )

  protected nodeAddChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      pairwise(),
      filter(([oldList, newList]) => newList.length > oldList.length),
      map(([oldList, newList]) => newList.filter(node => !oldList.includes(node))),
      map((nodes) =>
        nodes.map(node => ({ type: 'add', id: node.node.id }))
      )
    )

  protected nodeRemoveChange$ = toObservable(this.entitiesService.nodes)
    .pipe(
      pairwise(),
      filter(([oldList, newList]) => oldList.length > newList.length),
      map(([oldList, newList]) => oldList.filter(node => !newList.includes(node))),
      map((nodes) =>
        nodes.map(node => ({ type: 'remove', id: node.node.id }))
      )
    )

  protected allChanges$ = merge(
    this.nodesPositionChange$,
    this.nodeAddChange$,
    this.nodeRemoveChange$
  )

  public readonly changes = toSignal(this.allChanges$)
}
