import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectionBoxService } from '../../services/selection-box.service';

@Component({
  selector: 'g[selectionBox]',
  templateUrl: './selection-box.component.html',
  styleUrls: ['./selection-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SelectionBoxComponent {
  protected selectionBox = inject(SelectionBoxService).model;
}
