import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AnyComponentNodeEvent, ComponentNodeEvent } from '../interfaces/component-node-event.interface';
import { CustomNodeComponent } from '../public-components/custom-node.component';

@Injectable()
export class ComponentEventBusService {
  private _event$ = new Subject<AnyComponentNodeEvent>()

  public event$ = this._event$.asObservable()

  public pushEvent(event: AnyComponentNodeEvent) {
    this._event$.next(event)
  }
}
