import { Directive } from '@angular/core';

/** SVG presentation only. Compose with core customTemplateEdge/selectable for interaction. */
@Directive({
  selector: 'path[vflowEdge]',
  host: {
    class:
      'vui-edge vui:fill-none vui:stroke-muted vui:stroke-2 vui:[stroke-linejoin:round] vui:data-[vui-selected=true]:stroke-accent vui:forced-colors:stroke-[CanvasText] vui:forced-colors:data-[vui-selected=true]:stroke-[Highlight]',
  },
})
export class VflowEdge {}

/** HTML label surface for an edge label template. */
@Directive({
  selector: '[vflowEdgeLabel]',
  host: {
    class:
      'vui-edge-label vui:inline-flex vui:box-border vui:items-center vui:gap-1.5 vui:px-2.25 vui:py-1 vui:rounded-sm vui:border vui:border-border vui:bg-surface vui:text-foreground vui:font-sans vui:text-xs vui:leading-normal',
  },
})
export class VflowEdgeLabel {}
