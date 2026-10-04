import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { VflowMinimapComponent, MinimapPosition } from 'ngx-vflow';
import { AsInterface } from '../types';

@Component({
  selector: 'v-minimap',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VflowMinimapMockComponent implements AsInterface<VflowMinimapComponent> {
  public position = input<MinimapPosition>('bottom-right');

  public pannable = input(false);
  public zoomable = input(false);
  public zoomStep = input(0.1);
}
