import { Directive } from '@angular/core';

/**
 * Card shell. Its border is the edge of the surface; the separators inside (header, footer, field rows) are half as
 * strong so the card reads as one surface. Dimensions, content, semantics and interaction belong to the consumer and core. The resting shadow has
 * no blur: a blurred shadow is rasterized again on every zoom step and pan of every visible node, which on a large
 * flow at a high pixel ratio costs more GPU time than the rest of the node.
 */
@Directive({
  selector: '[vuiNode]',
  host: {
    class: `vui-node
      relative box-border rounded-vui-surface border border-vui-border
      bg-vui-surface text-vui-foreground font-vui-sans tracking-vui-normal text-vui-body shadow-vui-node
      data-[vui-selected=true]:outline-2 data-[vui-selected=true]:outline-offset-2 data-[vui-selected=true]:outline-vui-selection
      forced-colors:data-[vui-selected=true]:outline-[Highlight]`,
  },
})
export class VuiNode {}

/** Header row: items share the baseline of the title's first line, so an icon, meta or badge stays beside it when it wraps. */
@Directive({
  selector: '[vuiNodeHeader]',
  host: {
    class: `vui-node-header
      flex items-baseline gap-vui-2 p-vui-3 border-b border-vui-border/50
      font-vui-strong`,
  },
})
export class VuiNodeHeader {}

@Directive({ selector: '[vuiNodeBody]', host: { class: 'vui-node-body p-vui-3' } })
export class VuiNodeBody {}

@Directive({
  selector: '[vuiNodeFooter]',
  host: {
    class: `vui-node-footer
      flex flex-wrap items-center gap-vui-2 p-vui-3 border-t border-vui-border/50`,
  },
})
export class VuiNodeFooter {}
