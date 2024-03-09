import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, of, switchMap } from 'rxjs';

export type NodeChange = { id: string } & NodePositionChange

interface NodePositionChange {
  type: 'position'
  point: Point
}

@Injectable()
export class NodesChangeService {
  public readonly changes = computed(() => this.nodesPositionChange())

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

  protected nodesPositionChange = toSignal(this.nodesPositionChange$)
}
