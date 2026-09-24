import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Marker } from '../../interfaces/marker.interface';
import { KeyValuePipe } from '@angular/common';
import { MARKER_DEFAULT_SIZE, MARKER_DEFAULT_TYPE, markerTipInset } from '../../utils/marker-inset';

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
  protected readonly defaultType = MARKER_DEFAULT_TYPE;
  protected readonly tipInset = markerTipInset;
}
