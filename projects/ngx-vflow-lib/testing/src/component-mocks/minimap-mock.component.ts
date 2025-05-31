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
  public maskColor = input(`rgba(215, 215, 215, 0.6)`);

  public strokeColor = input(`rgb(200, 200, 200)`);

  public position = input<MiniMapPosition>('bottom-right');

  public scaleOnHover = input(false);

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit() {}
}
