import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Marker } from '../../interfaces/marker.interface';
import { KeyValuePipe } from '@angular/common';
import { MARKER_DEFAULT_SIZE, MARKER_TIP_INSET } from '../../utils/marker-inset';

@Component({
  selector: 'defs[flowDefs]',
  templateUrl: './defs.component.html',
  styleUrls: ['./defs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe],
})
export class DefsComponent {
  public markers = input.required<Map<number, Marker>>();

  protected readonly defaultSize = MARKER_DEFAULT_SIZE;
  protected readonly tipInset = MARKER_TIP_INSET;
}
