import { Directive, output } from '@angular/core';
import { Connection } from '../../interfaces/connection.interface';

@Directive({ selector: '[onConnect]', standalone: true })
export class ConnectionControllerMockDirective {
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onConnect = output<Connection>();
}
