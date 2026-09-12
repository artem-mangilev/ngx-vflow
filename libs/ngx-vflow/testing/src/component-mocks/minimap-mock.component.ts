import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import type { MiniMapComponent, MiniMapPosition } from 'ngx-vflow';
import { AsInterface } from '../types';

@Component({
  selector: 'mini-map',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniMapMockComponent implements AsInterface<MiniMapComponent>, OnInit {
  public maskColor = input<string>();

  public strokeColor = input<string>();

  public position = input<MiniMapPosition>('bottom-right');

  public pannable = input(false);
  public zoomable = input(false);
  public zoomStep = input(0.1);

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit() {}
}
