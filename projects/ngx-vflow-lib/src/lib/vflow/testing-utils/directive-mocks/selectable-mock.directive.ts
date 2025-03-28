import { Directive } from '@angular/core';
import { AsInterface } from '../types';
import { SelectableDirective } from '../../directives/selectable.directive';

@Directive({
  selector: '[selectable]',
  standalone: true,
})
export class SelectableMockDirective implements AsInterface<SelectableDirective> {}
