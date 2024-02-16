import { Directive, EventEmitter, Output, effect, inject } from '@angular/core';
import { Connection } from '../interfaces/connection.interface';
import { FlowStatusService } from '../services/flow-status.service';

import { FlowEntitiesService } from '../services/flow-entities.service';

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

      const source = sourceModel.node.id
      const target = targetModel.node.id

      const connection = this.flowEntitiesService.connection()

      if (connection.validator({ source, target })) {
        this.onConnect.emit({ source, target })
      }
    }

    // writing occurs in convertToEdge method
  }, { allowSignalWrites: true })
}
