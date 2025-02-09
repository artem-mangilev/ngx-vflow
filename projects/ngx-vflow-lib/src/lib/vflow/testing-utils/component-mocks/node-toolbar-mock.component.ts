import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Position } from '../../types/position.type';

@Component({
  selector: 'node-toolbar',
  template: '<ng-content />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeToolbarMockComponent {
  public position = input<Position>('top');
}
