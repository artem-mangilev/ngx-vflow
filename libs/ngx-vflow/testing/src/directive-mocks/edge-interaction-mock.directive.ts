import { Directive } from '@angular/core';
import type { EdgeInteractionDirective } from 'ngx-vflow';
import { AsInterface } from '../types';

@Directive({
  standalone: true,
  selector: 'g[edgeInteraction]',
})
export class EdgeInteractionMockDirective implements AsInterface<EdgeInteractionDirective> {}
