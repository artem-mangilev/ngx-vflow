import { Directive, inject } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { ConnectionService } from '../services/connection.service';

/**
 * The connection outputs of the flow; the gesture itself is {@link ConnectionService}.
 *
 * @internal A host directive of `vflow`, exported only because the compiler requires it in the entry point.
 */
@Directive()
export class ConnectionControllerDirective {
  private readonly connection = inject(ConnectionService);

  public readonly connectStart = outputFromObservable(this.connection.connectStart$);
  /** Emits an application-owned structural connection request after validation. */
  public readonly connect = outputFromObservable(this.connection.connect$);
  public readonly connectEnd = outputFromObservable(this.connection.connectEnd$);
  public readonly reconnectStart = outputFromObservable(this.connection.reconnectStart$);
  public readonly reconnect = outputFromObservable(this.connection.reconnect$);
  public readonly reconnectEnd = outputFromObservable(this.connection.reconnectEnd$);
}
