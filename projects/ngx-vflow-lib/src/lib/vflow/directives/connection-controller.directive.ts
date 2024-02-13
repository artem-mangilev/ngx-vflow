import { Directive, EventEmitter, Output, effect, inject } from '@angular/core';
import { Connection, PartialEdge } from '../interfaces/connection.interface';
import { FlowStatusService } from '../services/flow-status.service';
import { VflowComponent } from '../components/vflow/vflow.component';
import { Edge } from '../interfaces/edge.interface';
import { Node } from '../interfaces/node.interface';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { uuid } from '../../../public-api';

@Directive({
  selector: '[connectionController]',
  standalone: true
})
export class ConnectionControllerDirective {
  @Output()
  public onConnect = new EventEmitter<Connection>()

  private statusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)

  protected connectEffect = effect(() => {
    const status = this.statusService.status()

    if (status.state === 'connection-end') {
      const sourceModel = status.payload.sourceNode
      const targetModel = status.payload.targetNode

      const source = sourceModel.node
      const target = targetModel.node
      const convertToEdge = (edge?: PartialEdge) =>
        this.convertToEdge(sourceModel, targetModel, edge)

      this.onConnect.emit({ source, target, toEdge: convertToEdge })
    }

    // writing occurs in convertToEdge method
  }, { allowSignalWrites: true })

  private convertToEdge(source: NodeModel, target: NodeModel, partialEdge?: PartialEdge) {
    const edge = partialEdge
      ? fromPartialEdge(source, target, partialEdge)
      : defaultEdge(source, target)

    const edgeModel = new EdgeModel(edge)
    edgeModel.source = source
    edgeModel.target = target

    this.flowEntitiesService.addEdge(edgeModel)
  }
}

function fromPartialEdge(source: NodeModel, target: NodeModel, edge: PartialEdge): Edge {
  return {
    source: source.node.id,
    target: target.node.id,
    ...edge
  }
}

function defaultEdge(source: NodeModel, target: NodeModel): Edge {
  return {
    source: source.node.id,
    target: target.node.id,
    id: uuid()
  }
}
