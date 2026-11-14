import { Directive } from '@angular/core';

/**
 * SVG presentation only. Put it inside a core `vEdgeInteractionArea` group for the hit area and selection, which is read
 * from the core edge host (`data-v-selected`, `data-v-preselected`).
 */
@Directive({
  selector: 'path[vuiEdge]',
  host: {
    class: `vui-edge
      fill-none stroke-2 [stroke-linejoin:round]
      stroke-vui-muted [&:is([data-v-selected]_*,[data-v-preselected]_*)]:stroke-vui-accent
      forced-colors:stroke-[CanvasText] forced-colors:[&:is([data-v-selected]_*,[data-v-preselected]_*)]:stroke-[Highlight]`,
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
