import { ChangeDetectionStrategy, Component, computed, effect, input, isDevMode } from '@angular/core';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MARKER_DEFAULT_TYPE, Marker } from '../../interfaces/marker.interface';
import { MarkerShapes, markerSize, markerStrokeWidth, markerTipInset } from '../../utils/marker-inset';

const BUILT_IN_TYPES = new Set<string>(['arrow', 'arrow-closed']);

/**
 * Shared `<marker>` elements of the flow, one per distinct marker of its edges and connection line. The element is
 * the library's for every type: it sets the viewBox, size, orientation, `refX` from the inset of the shape, and the
 * stroke of the edge as inherited presentation attributes, `strokeWidth` flow units wide whatever the marker
 * size; application CSS may override them through the `v-marker` and `v-marker--<type>` classes. Built-in shapes render inline; other types render the shape
 * the application declared with `ng-template[vMarker]`.
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

  constructor() {
    if (isDevMode()) {
      // The effect follows the set of types, not the markers, so it warns when the set changes.
      const typesWithoutShape = computed(
        () => {
          const shapes = this.shapes();
          const types = new Set<string>();
          this.markers().forEach((marker) => {
            const type = marker.type ?? MARKER_DEFAULT_TYPE;
            if (!BUILT_IN_TYPES.has(type) && !shapes.has(type)) {
              types.add(type);
            }
          });
          return [...types];
        },
        { equal: (a, b) => a.length === b.length && a.every((type, index) => type === b[index]) },
      );
      effect(() => {
        for (const type of typesWithoutShape()) {
          console.warn(
            `[ngx-vflow] Marker type "${type}" is not built in and no <ng-template vMarker="${type}"> declares its ` +
              'shape, so the marker renders empty.',
          );
        }
      });
    }
  }
}
