import { Directive } from '@angular/core';
import { AsInterface } from '../types';
import type { VflowDragHandleDirective } from 'ngx-vflow';

@Directive({ selector: '[vDragHandle]', standalone: true })
export class VflowDragHandleMockDirective implements AsInterface<VflowDragHandleDirective> {}
