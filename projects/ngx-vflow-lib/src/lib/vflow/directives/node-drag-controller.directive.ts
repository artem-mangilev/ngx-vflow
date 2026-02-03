import { Directive, inject } from '@angular/core';
import { FlowStatusService } from '../services/flow-status.service';
import { filter, map } from 'rxjs';
import { Node } from '../interfaces/node.interface';
import { outputFromObservable } from '@angular/core/rxjs-interop';

export interface NodeDragStartEvent {
  // TODO: expose DOM event?
  node: Node;
}

export interface NodeDragEvent {
  node: Node;
}

export interface NodeDragEndEvent {
  node: Node;
}

@Directive()
export class NodeDragControllerDirective {
  private statusService = inject(FlowStatusService);

  readonly nodeDragStart = outputFromObservable(
    this.statusService.status$.pipe(
      filter((status) => status.state === 'node-drag-start'),
      map((status) => ({ node: status.payload.node.rawNode }) as NodeDragStartEvent),
    ),
  );

  readonly nodeDrag = outputFromObservable(
    this.statusService.status$.pipe(
      filter((status) => status.state === 'node-drag'),
      map((status) => ({ node: status.payload.node.rawNode }) as NodeDragEvent),
    ),
  );

  readonly nodeDragEnd = outputFromObservable(
    this.statusService.status$.pipe(
      filter((status) => status.state === 'node-drag-end'),
      map((status) => ({ node: status.payload.node.rawNode }) as NodeDragEndEvent),
    ),
  );
}
