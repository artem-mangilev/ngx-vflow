import { Directive } from '@angular/core';

/** Primary text of a card header, field row or container: takes the remaining width and wraps. */
@Directive({
  selector: '[vuiTitle]',
  host: {
    class: `vui-title
      flex-1 min-w-vui-0 wrap-anywhere in-[.vui-node-header]:font-vui-strong
      [.vui-container>&]:block [.vui-container>&]:py-vui-2 [.vui-container>&]:px-vui-3
      [.vui-container>&]:font-vui-strong [.vui-container>&]:text-vui-title
      [.vui-container>&]:border-b [.vui-container>&]:border-dashed [.vui-container>&]:border-vui-border`,
  },
})
export class VuiTitle {}

/** Secondary text such as a category, type, key or timestamp. */
@Directive({ selector: '[vuiMeta]', host: { class: 'vui-meta text-vui-muted text-vui-caption' } })
export class VuiMeta {}

/**
 * Icon slot: four grid units wide and one text line high, so a glyph shares the baseline of the text next to it
 * and a 16px SVG is centered on that line. Mark purely decorative icons with `aria-hidden` yourself.
 */
@Directive({
  selector: '[vuiIcon]',
  host: { class: 'vui-icon inline-flex items-center justify-center flex-none w-vui-4 h-lh' },
})
export class VuiIcon {}

/** Group of consumer controls in a card, label or toolbar; add `vNoDrag` to controls inside nodes. */
@Directive({
  selector: '[vuiActions]',
  host: { class: 'vui-actions inline-flex flex-wrap items-center gap-vui-2 ms-auto' },
})
export class VuiActions {}
