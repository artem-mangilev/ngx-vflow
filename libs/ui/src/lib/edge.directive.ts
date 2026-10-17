import { Directive } from '@angular/core';

/** SVG presentation only. Put it inside a core `vEdgeInteraction` group for the hit area and selection. */
@Directive({
  selector: 'path[vuiEdge]',
  host: {
    class: `vui-edge
      fill-none stroke-2 [stroke-linejoin:round]
      stroke-vui-muted data-[vui-selected=true]:stroke-vui-selection
      forced-colors:stroke-[CanvasText] forced-colors:data-[vui-selected=true]:stroke-[Highlight]`,
  },
})
export class VuiEdge {}

/** HTML label surface for an edge label template. */
@Directive({
  selector: '[vuiEdgeLabel]',
  host: {
    class: `vui-edge-label
      inline-flex box-border items-center gap-vui-1 px-vui-2 py-vui-1 rounded-vui-control border border-vui-border
      bg-vui-surface text-vui-foreground font-vui-sans tracking-vui-normal text-vui-caption antialiased`,
  },
})
export class VuiEdgeLabel {}
