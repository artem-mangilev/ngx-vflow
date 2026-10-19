import { Directive } from '@angular/core';

/** Primary text of a card header, row or group header: takes the remaining width and wraps. */
@Directive({
  selector: '[vuiTitle]',
  host: { class: 'vui-title flex-1 min-w-vui-0 wrap-anywhere' },
})
export class VuiTitle {}

/** Secondary text such as a category, type, key or timestamp; regular weight even inside a header. */
@Directive({ selector: '[vuiMeta]', host: { class: 'vui-meta text-vui-muted text-xs font-normal' } })
export class VuiMeta {}

/**
 * Leading slot for an icon, an avatar or any other small view of an unknown size. It is at least four grid units wide
 * and one text line high and grows with its content. A zero-width text strut, centered in the slot like the content,
 * gives it the baseline of a line centered on it, so in a header the slot is centered on the first line of the title:
 * a 16px icon sits on that line, and a 28px avatar is centered on a one-line title. Put it on a wrapper element, not
 * on an `svg` or `img`: those render no strut. Mark purely decorative icons with `aria-hidden` yourself. The strut is
 * a zero-width space read from the host's `data-vui-strut` attribute: written as an escape in the class, it would differ
 * between the source Tailwind scans and the class at runtime.
 */
@Directive({
  selector: '[vuiIcon]',
  host: {
    class: `vui-icon inline-flex items-center justify-center flex-none min-w-vui-4 min-h-lh
      before:content-[attr(data-vui-strut)]`,
    'data-vui-strut': '\u200b',
  },
})
export class VuiIcon {}

/** Group of consumer controls in a card, label or toolbar; add `vNoDrag` to controls inside nodes. */
@Directive({
  selector: '[vuiActions]',
  host: { class: 'vui-actions inline-flex flex-wrap items-center gap-vui-2 ms-auto' },
})
export class VuiActions {}
