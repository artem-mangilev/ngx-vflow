import { Directive } from '@angular/core';

/** Primary text of a card header, field row or container: takes the remaining width and wraps. */
@Directive({
  selector: '[vflowTitle]',
  host: {
    class:
      'vui-title vui:flex-1 vui:min-w-0 vui:wrap-anywhere vui:in-[.vui-node-header]:font-semibold vui:[.vui-container>&]:block vui:[.vui-container>&]:py-2 vui:[.vui-container>&]:px-3.5 vui:[.vui-container>&]:font-semibold vui:[.vui-container>&]:border-b vui:[.vui-container>&]:border-dashed vui:[.vui-container>&]:border-border',
  },
})
export class VflowTitle {}

/** Secondary text such as a category, type, key or timestamp. */
@Directive({ selector: '[vflowMeta]', host: { class: 'vui-meta vui:text-muted vui:text-xs vui:leading-snug' } })
export class VflowMeta {}

/** Fixed-size icon slot; mark purely decorative icons with `aria-hidden` yourself. */
@Directive({
  selector: '[vflowIcon]',
  host: { class: 'vui-icon vui:inline-grid vui:place-items-center vui:flex-none vui:size-5' },
})
export class VflowIcon {}

/** Group of consumer controls in a card, label or toolbar; add `vflowNoDrag` to controls inside nodes. */
@Directive({
  selector: '[vflowActions]',
  host: { class: 'vui-actions vui:inline-flex vui:flex-wrap vui:items-center vui:gap-1.5 vui:ms-auto' },
})
export class VflowActions {}
