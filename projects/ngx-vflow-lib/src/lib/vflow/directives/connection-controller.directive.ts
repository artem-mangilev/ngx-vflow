import { Directive, computed, inject } from '@angular/core';
import { Connection, ReconnectionEvent } from '../interfaces/connection.interface';
import { FlowStatusConnectionEnd, FlowStatusReconnectionEnd, FlowStatusService } from '../services/flow-status.service';

import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from '../models/handle.model';
import { adjustDirection } from '../utils/adjust-direction';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { filter, map, tap } from 'rxjs';
import { EdgeModel } from '../models/edge.model';

@Directive({
  selector: '[onConnect], [onReconnect], [connect], [reconnect]',
  standalone: true,
})
export class ConnectionControllerDirective {
  private statusService = inject(FlowStatusService);
  private flowEntitiesService = inject(FlowEntitiesService);

  /**
   * This event fires when user tries to create new Edge.
   *
   * `Connection` is an entity that contains data about source and target nodes.
   *
   * Also it's important to note, that this event only fires when connection is valid by validator function in `ConnectionSettings`,
   * by default without passing the validator every connection concidered valid.
   *
   * @deprecated use `connect` output instead
   */
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onConnect = outputFromObservable<Connection>(
    toObservable(this.statusService.status).pipe(
      filter((status): status is FlowStatusConnectionEnd => status.state === 'connection-end'),
      map((status) => statusToConnection(status, this.isStrictMode())),
      tap(() => this.statusService.setIdleStatus()),
      filter((connection) => this.flowEntitiesService.connection().validator(connection)),
    ),
  );

  public readonly connect = outputFromObservable<Connection>(
    toObservable(this.statusService.status).pipe(
      filter((status): status is FlowStatusConnectionEnd => status.state === 'connection-end'),
      map((status) => statusToConnection(status, this.isStrictMode())),
      tap(() => this.statusService.setIdleStatus()),
      filter((connection) => this.flowEntitiesService.connection().validator(connection)),
    ),
  );

  /**
   * @deprecated use `reconnect` output instead
   */
  public readonly onReconnect = outputFromObservable<ReconnectionEvent>(
    toObservable(this.statusService.status).pipe(
      filter((status): status is FlowStatusReconnectionEnd => status.state === 'reconnection-end'),
      map((status) => {
        const connection = statusToConnection(status, this.isStrictMode());
        const oldEdge = status.payload.oldEdge.edge;

        return { connection, oldEdge };
      }),
      tap(() => this.statusService.setIdleStatus()),
      filter(({ connection }) => this.flowEntitiesService.connection().validator(connection)),
    ),
  );

  public readonly reconnect = outputFromObservable<ReconnectionEvent>(
    toObservable(this.statusService.status).pipe(
      filter((status): status is FlowStatusReconnectionEnd => status.state === 'reconnection-end'),
      map((status) => {
        const connection = statusToConnection(status, this.isStrictMode());
        const oldEdge = status.payload.oldEdge.edge;

        return { connection, oldEdge };
      }),
      tap(() => this.statusService.setIdleStatus()),
      filter(({ connection }) => this.flowEntitiesService.connection().validator(connection)),
    ),
  );

  protected isStrictMode = computed(() => this.flowEntitiesService.connection().mode === 'strict');

  public startConnection(handle: HandleModel) {
    this.statusService.setConnectionStartStatus(handle.parentNode, handle);
  }

  public startReconnection(handle: HandleModel, oldEdge: EdgeModel) {
    this.statusService.setReconnectionStartStatus(handle.parentNode, handle, oldEdge);
  }

  public validateConnection(handle: HandleModel) {
    const status = this.statusService.status();

    if (status.state === 'connection-start' || status.state === 'reconnection-start') {
      const isReconnection = status.state === 'reconnection-start';

      let source = status.payload.source;
      let target = handle.parentNode;
      let sourceHandle = status.payload.sourceHandle;
      let targetHandle = handle;

      if (this.isStrictMode()) {
        // swap direction (if needed) according to actual source and target of strict mode
        const adjusted = adjustDirection({
          source: status.payload.source,
          sourceHandle: status.payload.sourceHandle,
          target: handle.parentNode,
          targetHandle: handle,
        });

        source = adjusted.source;
        target = adjusted.target;
        sourceHandle = adjusted.sourceHandle;
        targetHandle = adjusted.targetHandle;
      }

      const valid = this.flowEntitiesService.connection().validator({
        source: source.rawNode.id,
        target: target.rawNode.id,
        sourceHandle: sourceHandle.rawHandle.id,
        targetHandle: targetHandle.rawHandle.id,
      });

      // TODO: check how react flow handles highlight of handle
      // if direction changes
      handle.state.set(valid ? 'valid' : 'invalid');

      // status is about how we draw connection, so we don't need
      // swapped diretion here
      isReconnection
        ? this.statusService.setReconnectionValidationStatus(
            valid,
            status.payload.source,
            handle.parentNode,
            status.payload.sourceHandle,
            handle,
            status.payload.oldEdge,
          )
        : this.statusService.setConnectionValidationStatus(
            valid,
            status.payload.source,
            handle.parentNode,
            status.payload.sourceHandle,
            handle,
          );
    }
  }

  public resetValidateConnection(targetHandle: HandleModel) {
    targetHandle.state.set('idle');

    // drop back to start status
    const status = this.statusService.status();
    if (status.state === 'connection-validation' || status.state === 'reconnection-validation') {
      const isReconnection = status.state === 'reconnection-validation';

      isReconnection
        ? this.statusService.setReconnectionStartStatus(
            status.payload.source,
            status.payload.sourceHandle,
            status.payload.oldEdge,
          )
        : this.statusService.setConnectionStartStatus(status.payload.source, status.payload.sourceHandle);
    }
  }

  public endConnection() {
    const status = this.statusService.status();

    if (status.state === 'connection-validation' || status.state === 'reconnection-validation') {
      const isReconnection = status.state === 'reconnection-validation';

      const source = status.payload.source;
      const sourceHandle = status.payload.sourceHandle;
      const target = status.payload.target;
      const targetHandle = status.payload.targetHandle;

      isReconnection
        ? this.statusService.setReconnectionEndStatus(
            source,
            target,
            sourceHandle,
            targetHandle,
            status.payload.oldEdge,
          )
        : this.statusService.setConnectionEndStatus(source, target, sourceHandle, targetHandle);
    }
  }
}

function statusToConnection(
  status: FlowStatusConnectionEnd | FlowStatusReconnectionEnd,
  isStrictMode: boolean,
): Connection {
  let source = status.payload.source;
  let target = status.payload.target;
  let sourceHandle = status.payload.sourceHandle;
  let targetHandle = status.payload.targetHandle;

  if (isStrictMode) {
    const adjusted = adjustDirection({
      source: status.payload.source,
      sourceHandle: status.payload.sourceHandle,
      target: status.payload.target,
      targetHandle: status.payload.targetHandle,
    });

    source = adjusted.source;
    target = adjusted.target;
    sourceHandle = adjusted.sourceHandle;
    targetHandle = adjusted.targetHandle;
  }

  const sourceId = source.rawNode.id;
  const targetId = target.rawNode.id;

  const sourceHandleId = sourceHandle.rawHandle.id;
  const targetHandleId = targetHandle.rawHandle.id;

  return {
    source: sourceId,
    target: targetId,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
  };
}
