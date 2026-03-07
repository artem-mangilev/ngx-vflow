import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SelectionBoxContextDirective } from '../../directives/selection-box-context.directive';
import { FlowSettingsService } from '../../services/flow-settings.service';

@Component({
  selector: 'g[selectionBox]',
  templateUrl: './selection-box.component.html',
  styleUrls: ['./selection-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SelectionBoxComponent {
  private flowSettingsService = inject(FlowSettingsService);

  protected selectionBox = inject(SelectionBoxContextDirective).model;
  protected color = computed(() => this.flowSettingsService.selectionBox().color);
}
