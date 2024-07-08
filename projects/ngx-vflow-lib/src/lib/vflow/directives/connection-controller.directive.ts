import { Directive, EventEmitter, Output, effect, inject } from '@angular/core';
import { Connection } from '../interfaces/connection.interface';
import { FlowStatusService, batchStatusChanges } from '../services/flow-status.service';

import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from '../models/handle.model';
import { adjustDirection } from '../utils/adjust-direction';

@Directive({
  selector: '[connectionController]',
  standalone: true
})
export class ConnectionControllerDirective {
  /**
   * This event fires when user tries to create new Edge.
   *
   * `Connection` is an entity that contains data about source and target nodes.
   *
   * Also it's important to note, that this event only fires when connection is valid by validator function in `ConnectionSettings`,
   * by default without passing the validator every connection concidered valid.
   */
  @Output()
  public onConnect = new EventEmitter<Connection>()

  private statusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)

  protected connectEffect = effect(() => {
    const status = this.statusService.status()

    if (status.state === 'connection-end') {
      const { source, target, sourceHandle, targetHandle } = adjustDirection({
        source: status.payload.source,
        sourceHandle: status.payload.sourceHandle,
        target: status.payload.target,
        targetHandle: status.payload.targetHandle
      })

      const sourceId = source.node.id
      const targetId = target.node.id

      const sourceHandleId = sourceHandle.rawHandle.id
      const targetHandleId = targetHandle.rawHandle.id

      const connectionModel = this.flowEntitiesService.connection()
      const connection = {
        source: sourceId, target: targetId,
        sourceHandle: sourceHandleId, targetHandle: targetHandleId
      }

      if (connectionModel.validator(connection)) {
        this.onConnect.emit(connection)
      }
    }
  }, { allowSignalWrites: true })

  public startConnection(handle: HandleModel) {
    this.statusService.setConnectionStartStatus(handle.parentNode, handle)
  }

  public validateConnection(handle: HandleModel) {
    const status = this.statusService.status()

    if (status.state === 'connection-start') {
      // swap direction (if needed) according to actual source and target
      const { source, target, sourceHandle, targetHandle } = adjustDirection({
        source: status.payload.source,
        sourceHandle: status.payload.sourceHandle,
        target: handle.parentNode,
        targetHandle: handle
      })

      const valid = this.flowEntitiesService.connection().validator({
        source: source.node.id,
        target: target.node.id,
        sourceHandle: sourceHandle.rawHandle.id,
        targetHandle: targetHandle.rawHandle.id
      })

      // TODO: check how react flow handles highlight of handle
      // if direction changes
      handle.state.set(valid ? 'valid' : 'invalid')

      // status is about how we draw connection, so we don't need
      // swapped diretion here
      this.statusService.setConnectionValidationStatus(
        valid,
        status.payload.source, handle.parentNode,
        status.payload.sourceHandle, handle
      )
    }
  }

  public resetValidateConnection(targetHandle: HandleModel) {
    targetHandle.state.set('idle')

    // drop back to start status
    const status = this.statusService.status()
    if (status.state === 'connection-validation') {
      this.statusService.setConnectionStartStatus(
        status.payload.source,
        status.payload.sourceHandle
      )
    }
  }

  public endConnection() {
    const status = this.statusService.status()

    if (status.state === 'connection-validation') {
      const source = status.payload.source
      const sourceHandle = status.payload.sourceHandle
      const target = status.payload.target
      const targetHandle = status.payload.targetHandle

      batchStatusChanges(
        // call to create connection
        () => this.statusService.setConnectionEndStatus(source!, target!, sourceHandle!, targetHandle!),
        // when connection created, we need go back to idle status
        () => this.statusService.setIdleStatus()
      )
    }
  }
}
