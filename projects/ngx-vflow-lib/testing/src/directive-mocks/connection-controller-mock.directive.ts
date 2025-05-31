import { Directive, output } from '@angular/core';
import { Connection, ReconnectionEvent } from 'ngx-vflow';
import { AsInterface } from '../types';
import type { ConnectionControllerDirective, ɵHandleModel as HandleModel } from 'ngx-vflow';

@Directive({ selector: '[onConnect]', standalone: true })
export class ConnectionControllerMockDirective implements AsInterface<ConnectionControllerDirective> {
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onConnect = output<Connection>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onReconnect = output<ReconnectionEvent>();

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
