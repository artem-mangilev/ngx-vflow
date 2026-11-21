import { Directive, input } from '@angular/core';

/** A corner or the middle of a side of the flow. */
export type PanelPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Places an element of the flow content against a corner or a side of the flow, above the pane: a minimap, viewport
 * controls, a legend. It only positions: the look, the size and the content are the element's own.
 *
 * ```html
 * <vflow [nodes]="nodes">
 *   <v-minimap vPanel="bottom-right" />
 *   <app-controls vPanel="bottom-left" />
 *   <div [vPanel]="legendCorner()">…</div>
 * </vflow>
 * ```
 *
 * The gap to the edge is `--v-panel-offset`, 10px by default. The rules have no specificity, so any CSS of the
 * application adjusts the placement. Elements at the same position overlap: wrap them in one element that carries
 * `vPanel` and lay them out there. An element without the directive is positioned by the application.
 */
@Directive({
  standalone: true,
  selector: '[vPanel]',
  host: { '[attr.data-v-panel]': 'vPanel()' },
})
export class VflowPanelDirective {
  public readonly vPanel = input.required<PanelPosition>();
}
