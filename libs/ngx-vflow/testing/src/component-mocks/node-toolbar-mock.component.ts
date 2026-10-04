import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Position, VflowNodeToolbarComponent } from 'ngx-vflow';
import { AsInterface } from '../types';

@Component({
  selector: 'v-node-toolbar',
  template: '<ng-content />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VflowNodeToolbarMockComponent implements AsInterface<VflowNodeToolbarComponent> {
  public position = input<Position>('top');
}
