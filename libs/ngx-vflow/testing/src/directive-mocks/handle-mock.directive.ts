import { Directive, forwardRef, input, signal } from '@angular/core';
import { VflowHandleDirective } from 'ngx-vflow';
import type { DomAttributes, HandleLayout, HandlePosition, HandleState, HandleType } from 'ngx-vflow';
import { AsInterface } from '../types';

/** Accepts the handle inputs and stands in for the handle directive in DI; its state stays `idle`. */
@Directive({
  selector: '[vHandle]',
  exportAs: 'vHandle',
  standalone: true,
  providers: [{ provide: VflowHandleDirective, useExisting: forwardRef(() => VflowHandleMockDirective) }],
})
export class VflowHandleMockDirective implements AsInterface<VflowHandleDirective> {
  public readonly handleType = input<HandleType>('source');
  public readonly position = input<HandlePosition>('top');
  public readonly handleId = input<string>();
  public readonly layout = input<HandleLayout>('auto');
  public readonly offsetX = input(0);
  public readonly offsetY = input(0);
  public readonly canStart = input(true);
  public readonly canAccept = input(true);
  public readonly domAttributes = input<DomAttributes>();

  public readonly state = signal<HandleState>('idle').asReadonly();
}
