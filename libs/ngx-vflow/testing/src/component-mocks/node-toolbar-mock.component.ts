import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Position, NodeToolbarComponent } from 'ngx-vflow';
import { AsInterface } from '../types';

@Component({
  selector: 'node-toolbar',
  template: '<ng-content />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeToolbarMockComponent implements AsInterface<NodeToolbarComponent> {
  public position = input<Position>('top');
}
