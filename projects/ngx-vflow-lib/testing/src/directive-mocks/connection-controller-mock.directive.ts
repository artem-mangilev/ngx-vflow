import { Directive, output } from '@angular/core';
import { Connection, ReconnectEvent } from 'ngx-vflow';
import { AsInterface } from '../types';
import type {
  ConnectEndEvent,
  ConnectionControllerDirective,
  ConnectStartEvent,
  ɵHandleModel as HandleModel,
  ReconnectEndEvent,
  ReconnectStartEvent,
} from 'ngx-vflow';

@Directive({
  selector: '[connectStart], [connect], [connectEnd], [reconnectStart], [reconnect], [reconnectEnd]',
  standalone: true,
})
export class ConnectionControllerMockDirective implements AsInterface<ConnectionControllerDirective> {
  public readonly connectStart = output<ConnectStartEvent>();
  public readonly connect = output<Connection>();
  public readonly connectEnd = output<ConnectEndEvent>();

  public readonly reconnectStart = output<ReconnectStartEvent>();
  public readonly reconnect = output<ReconnectEvent>();
  public readonly reconnectEnd = output<ReconnectEndEvent>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public startConnection(handle: HandleModel): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public startReconnection(handle: HandleModel): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validateConnection(handle: HandleModel): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public resetValidateConnection(targetHandle: HandleModel): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public endConnection(): void {}
}
