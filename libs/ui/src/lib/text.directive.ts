import { Directive } from '@angular/core';

/** Primary text of a card header, field row or container header: takes the remaining width and wraps. */
@Directive({
  selector: '[vuiTitle]',
  host: { class: 'vui-title flex-1 min-w-vui-0 wrap-anywhere' },
})
export class VuiTitle {}

/** Secondary text such as a category, type, key or timestamp; regular weight even inside a header. */
@Directive({ selector: '[vuiMeta]', host: { class: 'vui-meta text-vui-muted text-vui-caption font-vui-normal' } })
export class VuiMeta {}

/**
 * Icon slot: four grid units wide and one text line high. A zero-width text strut gives it the baseline of that line, so
 * in a header it sits on the first line of a wrapped title, and a 16px SVG is centered on that line. Mark purely decorative icons with `aria-hidden` yourself.
 */
@Directive({
  selector: '[vuiIcon]',
  host: {
    class: `vui-icon inline-flex items-center justify-center flex-none w-vui-4 h-lh
      before:content-vui-strut`,
  },
})
export class VuiIcon {}

/** Group of consumer controls in a card, label or toolbar; add `vNoDrag` to controls inside nodes. */
@Directive({
  selector: '[vuiActions]',
  host: { class: 'vui-actions inline-flex flex-wrap items-center gap-vui-2 ms-auto' },
})
export class VuiActions {}
