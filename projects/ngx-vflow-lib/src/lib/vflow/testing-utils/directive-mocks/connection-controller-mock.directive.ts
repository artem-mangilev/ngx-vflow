import { Directive, output } from '@angular/core';
import { Connection, ReconnectionEvent } from '../../interfaces/connection.interface';
import { AsInterface } from '../types';
import type { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { HandleModel } from '../../models/handle.model';

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
