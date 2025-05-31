import { ChangeDetectionStrategy, Component, input, OnInit, OnDestroy } from '@angular/core';
import { Position } from '../../types/position.type';
import type { NodeToolbarComponent } from '../../public-components/node-toolbar/node-toolbar.component';
import { AsInterface } from '../types';

@Component({
  selector: 'node-toolbar',
  template: '<ng-content />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeToolbarMockComponent implements AsInterface<NodeToolbarComponent>, OnInit, OnDestroy {
  public position = input<Position>('top');

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnDestroy() {}
}
