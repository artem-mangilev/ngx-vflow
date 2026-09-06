import { FlowSettingsService } from '../services/flow-settings.service';
import { eventClientPoint, isTouchEvent } from '../utils/event';
import { DestroyRef, Directive, computed, inject, output } from '@angular/core';
import { Connection } from '../interfaces/connection.interface';
import {
  FlowStatusConnectionRelease,
  FlowStatusReconnectionRelease,
  FlowStatusService,
} from '../services/flow-status.service';

import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from '../models/handle.model';
import { adjustDirection } from '../utils/adjust-direction';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EdgeModel } from '../models/edge.model';
import { ConnectionForValidation } from '../interfaces/connection-settings.interface';
import {
  ConnectEndEvent,
  connectEndEventFromConnectionDroppedStatus,
  connectEndEventFromConnectionReleaseValidatedStatus,
  ConnectStartEvent,
  connectStartEventFromConnectionStartStatus,
  ReconnectEndEvent,
  reconnectEndEventFromReconnectionDroppedStatus,
  reconnectEndEventFromReconnectionReleaseValidatedStatus,
  ReconnectEvent,
  ReconnectStartEvent,
  reconnectStartEventFromReconnectionStartStatus,
} from '../interfaces/connection-events.interface';

@Directive({
  selector: '[connectStart], [connect], [connectEnd], [reconnectStart], [reconnect], [reconnectEnd]',
  standalone: true,
})
export class ConnectionControllerDirective {
  private settings = inject(FlowSettingsService);
  private destroyRef = inject(DestroyRef);
  private pendingDrag?: AbortController;

  constructor() {
    this.destroyRef.onDestroy(() => this.pendingDrag?.abort());
    this.statusService.status$.pipe(takeUntilDestroyed()).subscribe((status) => {
      switch (status.state) {
        case 'connection-start':
          this.connectStart.emit(connectStartEventFromConnectionStartStatus(status));
          break;
        case 'reconnection-start':
          this.reconnectStart.emit(reconnectStartEventFromReconnectionStartStatus(status));
          break;
        case 'connection-release': {
          const connection = statusToConnection(status, this.isStrictMode());
          const valid = this.flowEntitiesService.connection().validator(connection);
          const { source, target, sourceHandle, targetHandle } = status.payload;
          this.statusService.setConnectionReleaseValidatedStatus(source, target, sourceHandle, targetHandle, valid);
          if (valid) this.connect.emit(connection);
          break;
        }
        case 'reconnection-release': {
          const connection = statusToConnection(status, this.isStrictMode());
          const valid = this.flowEntitiesService.connection().validator(connection);
          const { source, target, sourceHandle, targetHandle, oldEdge } = status.payload;
          this.statusService.setReconnectionReleaseValidatedStatus(
            source,
            target,
            sourceHandle,
            targetHandle,
            oldEdge,
            valid,
          );
          if (valid) this.reconnect.emit({ connection, oldEdge: oldEdge.edge });
          break;
        }
        case 'connection-release-validated':
          this.statusService.setIdleStatus();
          this.connectEnd.emit(connectEndEventFromConnectionReleaseValidatedStatus(status));
          break;
        case 'reconnection-release-validated':
          this.statusService.setIdleStatus();
          this.reconnectEnd.emit(reconnectEndEventFromReconnectionReleaseValidatedStatus(status));
          break;
        case 'connection-dropped':
          this.statusService.setIdleStatus();
          this.connectEnd.emit(connectEndEventFromConnectionDroppedStatus(status));
          break;
        case 'reconnection-dropped':
          this.statusService.setIdleStatus();
          this.reconnectEnd.emit(reconnectEndEventFromReconnectionDroppedStatus(status));
          break;
      }
    });
  }

  private afterDragThreshold(event: Event | undefined, start: () => void) {
    this.pendingDrag?.abort();
    const threshold = this.settings.connectionDragThreshold();
    if (!event || threshold === 0) {
      start();
      return;
    }
    if (!(event instanceof MouseEvent) && !isTouchEvent(event)) return;
    const origin = eventClientPoint(event);
    const pending = (this.pendingDrag = new AbortController());
    const options = { signal: pending.signal, capture: true, passive: false };
    const move = (next: MouseEvent | TouchEvent) => {
      if (isTouchEvent(next)) next.preventDefault();
      const point = eventClientPoint(next);
      if (Math.hypot(point.x - origin.x, point.y - origin.y) > threshold) {
        pending.abort();
        start();
      }
    };
    document.addEventListener('mousemove', move, options);
    document.addEventListener('touchmove', move, options);
    for (const type of ['mouseup', 'touchend', 'touchcancel']) {
      document.addEventListener(type, () => pending.abort(), options);
    }
    window.addEventListener('blur', () => pending.abort(), options);
  }

  private statusService = inject(FlowStatusService);
  private flowEntitiesService = inject(FlowEntitiesService);

  public readonly connectStart = output<ConnectStartEvent>();
  /** Emits an application-owned structural connection request after validation. */
  public readonly connect = output<Connection>();
  public readonly connectEnd = output<ConnectEndEvent>();
  public readonly reconnectStart = output<ReconnectStartEvent>();
  public readonly reconnect = output<ReconnectEvent>();
  public readonly reconnectEnd = output<ReconnectEndEvent>();

  protected isStrictMode = computed(() => this.flowEntitiesService.connection().mode === 'strict');

  public startConnection(handle: HandleModel, event?: Event) {
    if (!handle.canStart()) {
      return;
    }

    this.afterDragThreshold(event, () => {
      if (handle.canStart()) this.statusService.setConnectionStartStatus(handle.parentNode, handle);
    });
  }

  public startReconnection(handle: HandleModel, oldEdge: EdgeModel, event?: Event) {
    this.afterDragThreshold(event, () =>
      this.statusService.setReconnectionStartStatus(handle.parentNode, handle, oldEdge),
    );
  }

  public validateConnection(handle: HandleModel) {
    const status = this.statusService.status();

    if (status.state === 'connection-start' || status.state === 'reconnection-start') {
      const isReconnection = status.state === 'reconnection-start';

      let source = status.payload.source;
      let target = handle.parentNode;
      let sourceHandle = status.payload.sourceHandle;
      let targetHandle = handle;
      let valid = false;

      if (handle.canAccept()) {
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

        valid = this.flowEntitiesService.connection().validator({
          source: source.rawNode.id,
          target: target.rawNode.id,
          sourceHandle: sourceHandle.rawHandle.id,
          targetHandle: targetHandle.rawHandle.id,
          sourceHandleType: sourceHandle.rawHandle.type,
          targetHandleType: targetHandle.rawHandle.type,
        });
      }

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

      if (!targetHandle.canAccept()) {
        isReconnection
          ? this.statusService.setReconnectionDroppedStatus(source, sourceHandle, status.payload.oldEdge)
          : this.statusService.setConnectionDroppedStatus(source, sourceHandle);

        return;
      }

      isReconnection
        ? this.statusService.setReconnectionReleaseStatus(
            source,
            target,
            sourceHandle,
            targetHandle,
            status.payload.oldEdge,
          )
        : this.statusService.setConnectionReleaseStatus(source, target, sourceHandle, targetHandle);
    }
  }
}

function statusToConnection(
  status: FlowStatusConnectionRelease | FlowStatusReconnectionRelease,
  isStrictMode: boolean,
): ConnectionForValidation {
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
    sourceHandleType: sourceHandle.rawHandle.type,
    targetHandleType: targetHandle.rawHandle.type,
  };
}
