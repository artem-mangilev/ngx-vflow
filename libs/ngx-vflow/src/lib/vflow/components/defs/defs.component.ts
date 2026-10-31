import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MARKER_DEFAULT_TYPE, Marker } from '../../interfaces/marker.interface';
import { MarkerShapes, markerSize, markerStrokeWidth, markerTipInset } from '../../utils/marker-inset';

/**
 * Shared `<marker>` elements of the flow, one per distinct marker of its edges and connection line. The element is
 * the library's for every type: it sets the viewBox, size, orientation, `refX` from the inset of the shape, and the
 * stroke of the edge as inherited presentation attributes, `strokeWidth` flow units wide whatever the marker
 * size; application CSS may override them through the `v-marker` and `v-marker--<type>` classes. Built-in shapes
 * render inline; other types render the shape the application declared with `ng-template[vMarker]`, and a type
 * without a declared shape renders empty.
 */
@Component({
  selector: 'defs[flowDefs]',
  templateUrl: './defs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe, NgTemplateOutlet],
})
export class DefsComponent {
  public markers = input.required<Map<number, Marker>>();

  public shapes = input.required<MarkerShapes>();

  protected readonly defaultType = MARKER_DEFAULT_TYPE;

  protected readonly size = markerSize;

  protected tipInset(marker: Marker): number {
    return markerTipInset(marker, this.shapes());
  }

  protected readonly strokeWidth = markerStrokeWidth;
}
