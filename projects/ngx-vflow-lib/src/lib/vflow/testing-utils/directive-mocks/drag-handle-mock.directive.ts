import { Directive } from '@angular/core';
import { AsInterface } from '../types';
import { DragHandleDirective } from '../../directives/drag-handle.directive';

@Directive({ selector: '[dragHandle]', standalone: true })
export class DragHandleMockDirective implements AsInterface<DragHandleDirective> {}
