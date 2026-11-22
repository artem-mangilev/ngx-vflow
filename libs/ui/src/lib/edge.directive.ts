import { Directive } from '@angular/core';

/**
 * SVG presentation only. Core draws the hit area of the edge, and the selection is read from the core edge host
 * (`data-v-selected`).
 */
@Directive({
  selector: 'path[vuiEdge]',
  host: {
    class: `vui-edge
      fill-none stroke-2 [stroke-linejoin:round]
      stroke-vui-muted [[data-v-selected]_&]:stroke-vui-accent
      forced-colors:stroke-[CanvasText] forced-colors:[[data-v-selected]_&]:stroke-[Highlight]`,
  },
})
export class VuiEdge {}

/** HTML label surface for an edge label template. */
@Directive({
  selector: '[vuiEdgeLabel]',
  host: {
    class: `vui-edge-label
      inline-flex items-center gap-vui-1 px-vui-2 py-vui-1 rounded-vui-control border border-vui-border
      bg-vui-surface text-vui-foreground text-xs`,
  },
})
export class VuiEdgeLabel {}
