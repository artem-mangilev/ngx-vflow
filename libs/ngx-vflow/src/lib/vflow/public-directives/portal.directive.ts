import { DestroyRef, Directive, TemplateRef, inject, input } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { PortalEntry, PortalLayer, PortalService } from '../services/portal.service';

const ORIGIN: Point = { x: 0, y: 0 };

/**
 * Content of the application in flow space that is not a node or an edge: a note, an arrow, a region behind a part
 * of the graph. The flow renders the template in a layer of its viewport, so the content pans and zooms with the
 * nodes, at the given flow-space point of its top-left corner. The template closes over the place that declares it,
 * which may be anywhere inside `vflow`: its content, a component of the application in it, or a node component.
 *
 * ```html
 * <figure *vPortal="{ x: 0, y: 50 }">A note</figure>
 * <div *vPortal="lane.point; layer: 'below'" class="lane"></div>
 * <ng-template [vPortal]="point" vPortalLayer="below">…</ng-template>
 * ```
 *
 * Without a value the content is at the origin of the flow and may place itself. With `null` or `undefined` nothing
 * renders, so a point computed from `flow.getNodeRect(id)` shows the content once the node is measured.
 *
 * The content is not part of the graph: alignment guides, the minimap, `fitView()`, the node queries, culling,
 * selection and keyboard navigation do not see it. It lets the pointer through to what is under it; give
 * `pointer-events: auto` to the parts that take the pointer. A press on such a part pans the viewport and a click on
 * it clears the selection, as on the pane, unless the part is inside `vNoPan`, `vNoDrag` or `vNoWheel`.
 */
@Directive({
  standalone: true,
  selector: 'ng-template[vPortal]',
})
export class VflowPortalDirective {
  /** Flow-space point of the top-left corner of the content. Nothing renders while it is `null` or `undefined`. */
  public readonly vPortal = input<Point | null | undefined, Point | '' | null | undefined>(ORIGIN, {
    transform: (point) => (point === '' ? ORIGIN : point),
  });

  /** `above` the nodes, edges and edge labels, under the alignment guides and the connection line; or `below` them. */
  public readonly vPortalLayer = input<PortalLayer, PortalLayer | null | undefined>('above', {
    transform: (layer) => layer ?? 'above',
  });

  constructor() {
    const entry: PortalEntry = {
      templateRef: inject<TemplateRef<void>>(TemplateRef),
      point: this.vPortal,
      layer: this.vPortalLayer,
    };

    inject(DestroyRef).onDestroy(inject(PortalService).add(entry));
  }
}
