import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MiniMapPosition } from '../../public-components/minimap/minimap.component';

@Component({
  selector: 'mini-map',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniMapMockComponent {
  public maskColor = input(`rgba(215, 215, 215, 0.6)`);

  public strokeColor = input(`rgb(200, 200, 200)`);

  public position = input<MiniMapPosition>('bottom-right');

  public scaleOnHover = input(false);
}
