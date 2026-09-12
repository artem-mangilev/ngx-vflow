import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectionBoxContextDirective } from '../../directives/selection-box-context.directive';

@Component({
  selector: 'g[selectionBox]',
  templateUrl: './selection-box.component.html',
  styleUrls: ['./selection-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SelectionBoxComponent {
  protected selectionBox = inject(SelectionBoxContextDirective).model;
}
