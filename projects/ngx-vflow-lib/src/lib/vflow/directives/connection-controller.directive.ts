import { Directive, EventEmitter, Output, effect, inject } from '@angular/core';
import { Connection } from '../interfaces/connection.interface';
import { FlowStatusService } from '../services/flow-status.service';

@Directive({
  selector: '[connectionController]',
  standalone: true
})
export class ConnectionControllerDirective {
  @Output()
  public onConnect = new EventEmitter<Connection>()

  private statusService = inject(FlowStatusService)

  protected connectEffect = effect(() => {
    const status = this.statusService.status()

    if (status.state === 'connection-end') {
      const source = status.payload.sourceNode.node
      const target = status.payload.targetNode.node

      this.onConnect.emit({ source, target })
    }
  })
}
