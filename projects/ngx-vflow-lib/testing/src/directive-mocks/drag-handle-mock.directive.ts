import { Directive } from '@angular/core';
import { AsInterface } from '../types';
import type { DragHandleDirective } from 'ngx-vflow';

@Directive({ selector: '[dragHandle]', standalone: true })
export class DragHandleMockDirective implements AsInterface<DragHandleDirective> {}
