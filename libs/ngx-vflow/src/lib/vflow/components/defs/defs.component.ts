import { ChangeDetectionStrategy, Component, effect, input, isDevMode } from '@angular/core';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MARKER_DEFAULT_TYPE, Marker } from '../../interfaces/marker.interface';
import { MARKER_DEFAULT_SIZE, MarkerShapes, markerTipInset } from '../../utils/marker-inset';

const BUILT_IN_TYPES = new Set<string>(['arrow', 'arrow-closed']);

/**
 * Shared `<marker>` elements of the flow, one per distinct marker of its edges and connection line. The element is
 * the library's for every type: it sets the viewBox, size, orientation, `refX` from the inset of the shape, and the
 * stroke of the edge as inherited presentation attributes, which application CSS may override through the
 * `vflow-marker` and `vflow-marker--<type>` classes. Built-in shapes render inline; other types render the shape
 * the application declared with `ng-template[marker]`.
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

  protected readonly defaultSize = MARKER_DEFAULT_SIZE;
  protected readonly defaultType = MARKER_DEFAULT_TYPE;

  protected tipInset(marker: Marker): number {
    return markerTipInset(marker, this.shapes());
  }

  constructor() {
    if (isDevMode()) {
      const warned = new Set<string>();
      effect(() => {
        const shapes = this.shapes();
        this.markers().forEach((marker) => {
          const type = marker.type ?? MARKER_DEFAULT_TYPE;
          if (BUILT_IN_TYPES.has(type) || shapes.has(type) || warned.has(type)) {
            return;
          }
          warned.add(type);
          console.warn(
            `[ngx-vflow] Marker type "${type}" is not built in and no <ng-template marker="${type}"> declares its ` +
              'shape, so the marker renders empty.',
          );
        });
      });
    }
  }
}
