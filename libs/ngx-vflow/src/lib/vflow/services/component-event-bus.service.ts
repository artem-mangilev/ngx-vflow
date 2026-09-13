import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AnyComponentNodeEvent } from '../interfaces/component-node-event.interface';
import { AnyComponentEdgeEvent } from '../interfaces/component-edge-event.interface';

@Injectable()
export class ComponentEventBusService {
  private nodeEvents = new Subject<AnyComponentNodeEvent>();
  private edgeEvents = new Subject<AnyComponentEdgeEvent>();

  public readonly nodeEvent$ = this.nodeEvents.asObservable();
  public readonly edgeEvent$ = this.edgeEvents.asObservable();

  public pushNodeEvent(event: AnyComponentNodeEvent) {
    this.nodeEvents.next(event);
  }

  public pushEdgeEvent(event: AnyComponentEdgeEvent) {
    this.edgeEvents.next(event);
  }
}
