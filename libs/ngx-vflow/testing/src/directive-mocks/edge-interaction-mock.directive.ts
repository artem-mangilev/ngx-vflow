import { Directive } from '@angular/core';
import type { VflowEdgeInteractionDirective } from 'ngx-vflow';
import { AsInterface } from '../types';

@Directive({
  standalone: true,
  selector: 'g[vEdgeInteraction]',
})
export class VflowEdgeInteractionMockDirective implements AsInterface<VflowEdgeInteractionDirective> {}
