import { Directive } from '@angular/core';
import { AsInterface } from '../types';
import type { VflowSelectableDirective } from 'ngx-vflow';

@Directive({
  selector: '[vSelectable]',
  standalone: true,
})
export class VflowSelectableMockDirective implements AsInterface<VflowSelectableDirective> {}
