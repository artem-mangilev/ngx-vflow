import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ComponentNodeEvent } from '../interfaces/component-node-event.interface';

@Injectable()
export class ComponentEventBusService {
  private _event$ = new Subject<ComponentNodeEvent>()

  public event$ = this._event$.asObservable()

  public pushEvent(event: ComponentNodeEvent) {
    this._event$.next(event)
  }
}
