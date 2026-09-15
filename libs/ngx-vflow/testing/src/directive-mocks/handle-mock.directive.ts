import { Directive, inject, input, signal } from '@angular/core';
import { HANDLE_REF } from 'ngx-vflow';
import type {
  DomAttributes,
  HandleLayout,
  HandleRef,
  HandleState,
  HandleType,
  Position,
  VflowHandleDirective,
} from 'ngx-vflow';
import { AsInterface } from '../types';

/** Accepts the handle inputs and provides a handle whose state stays `idle`. */
@Directive({
  selector: '[vflowHandle]',
  exportAs: 'vflowHandle',
  standalone: true,
  providers: [{ provide: HANDLE_REF, useFactory: () => inject(HandleMockDirective).ref }],
})
export class HandleMockDirective implements AsInterface<VflowHandleDirective> {
  public readonly type = input<HandleType>('source');
  public readonly position = input<Position>('top');
  public readonly id = input<string>();
  public readonly layout = input<HandleLayout>('auto');
  public readonly offsetX = input(0);
  public readonly offsetY = input(0);
  public readonly canStart = input(true);
  public readonly canAccept = input(true);
  public readonly ariaLabel = input<string>();
  public readonly ariaDescription = input<string>();
  public readonly domAttributes = input<DomAttributes>();

  public readonly state = signal<HandleState>('idle').asReadonly();

  public readonly ref: HandleRef = {
    state: this.state,
    type: this.type,
    position: this.position,
    id: this.id,
    canStart: this.canStart,
    canAccept: this.canAccept,
  };
}
