import { Directive, inject } from '@angular/core';
import { FlowStatus, FlowStatusService } from '../services/flow-status.service';
import { filter, map } from 'rxjs/operators';
import { Node } from '../interfaces/node.interface';
import { outputFromObservable } from '@angular/core/rxjs-interop';

/** Payload of `(nodeDragStart)`, `(nodeDrag)` and `(nodeDragEnd)`. */
export interface NodeDragEvent {
  /** The node the pointer grabbed. */
  node: Node;
  /** Every node the gesture moves: the grabbed node and the other selected nodes that move with it. */
  nodes: Node[];
  /** The pointer event being handled: the move that started the drag, a move, or the release. */
  sourceEvent: PointerEvent;
}

type DragState = 'node-drag-start' | 'node-drag' | 'node-drag-end';

@Directive()
export class NodeDragControllerDirective {
  private statusService = inject(FlowStatusService);

  readonly nodeDragStart = outputFromObservable(this.dragEvents('node-drag-start'));

  readonly nodeDrag = outputFromObservable(this.dragEvents('node-drag'));

  readonly nodeDragEnd = outputFromObservable(this.dragEvents('node-drag-end'));

  private dragEvents(state: DragState) {
    return this.statusService.nodeDragStatus$.pipe(
      filter((status): status is Extract<FlowStatus, { state: DragState }> => status.state === state),
      map(({ payload }): NodeDragEvent => ({
        node: payload.node.rawNode,
        nodes: payload.nodes.map((model) => model.rawNode),
        sourceEvent: payload.event,
      })),
    );
  }
}
