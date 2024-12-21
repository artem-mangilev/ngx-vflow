import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Marker } from '../../interfaces/marker.interface';
import { KeyValuePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'defs[flowDefs]',
  templateUrl: './defs.component.html',
  styleUrls: ['./defs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe],
})
export class DefsComponent {
  public markers = input.required<Map<number, Marker>>();

  protected readonly defaultColor = 'rgb(177, 177, 183)';
}
