import { Directive, inject } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { Node } from '../interfaces/node.interface';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { DraggableService, NodeDragGestureEvent } from '../services/draggable.service';

/** Payload of `(nodeDragStart)`, `(nodeDrag)` and `(nodeDragEnd)`. */
export interface NodeDragEvent {
  /** The node the pointer grabbed. */
  node: Node;
  /** Every node the gesture moves: the grabbed node and the other selected nodes that move with it. */
  nodes: Node[];
  /** The pointer event being handled: the move that started the drag, a move, or the release. */
  sourceEvent: PointerEvent;
}

/** The node drag outputs of the flow; the gesture itself is {@link DraggableService}. */
@Directive()
export class NodeDragControllerDirective {
  private draggable = inject(DraggableService);

  readonly nodeDragStart = outputFromObservable(this.dragEvents('start'));

  readonly nodeDrag = outputFromObservable(this.dragEvents('move'));

  readonly nodeDragEnd = outputFromObservable(this.dragEvents('end'));

  private dragEvents(type: NodeDragGestureEvent['type']) {
    return this.draggable.events$.pipe(
      filter((event) => event.type === type),
      map(({ node, nodes, event }): NodeDragEvent => ({
        node: node.rawNode,
        nodes: nodes.map((model) => model.rawNode),
        sourceEvent: event,
      })),
    );
  }
}
