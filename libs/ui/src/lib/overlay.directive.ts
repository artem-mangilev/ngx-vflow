import { Directive } from '@angular/core';

/**
 * Surface for toolbar content, for example inside core `v-node-toolbar`. A floating layer: translucent material
 * with a blurred shadow, which is affordable for one toolbar but never used on nodes.
 */
@Directive({
  selector: '[vuiToolbar]',
  host: {
    class: `vui-toolbar
      inline-flex box-border items-center gap-vui-1 p-vui-1 rounded-vui-surface
      bg-vui-surface/85 backdrop-blur-vui-material backdrop-saturate-180 shadow-vui-floating
      text-vui-foreground font-vui-sans tracking-vui-normal text-vui-body
      forced-colors:border forced-colors:border-[CanvasText]`,
  },
})
export class VuiToolbar {}

/** A label placed outside a shape, below it by default; the shape element must be positioned. */
@Directive({
  selector: '[vuiExternalLabel]',
  host: {
    class: `vui-external-label
      absolute top-full left-1/2 -translate-x-1/2 mt-vui-2 whitespace-nowrap
      text-vui-foreground font-vui-sans tracking-vui-normal text-vui-caption`,
  },
})
export class VuiExternalLabel {}
