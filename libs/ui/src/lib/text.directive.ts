import { Directive } from '@angular/core';

/** Primary text of a card header, field row or container: takes the remaining width and wraps. */
@Directive({ selector: '[vflowTitle]', host: { class: 'vui-title' } })
export class VflowTitle {}

/** Secondary text such as a category, type, key or timestamp. */
@Directive({ selector: '[vflowMeta]', host: { class: 'vui-meta' } })
export class VflowMeta {}

/** Fixed-size icon slot; mark purely decorative icons with `aria-hidden` yourself. */
@Directive({ selector: '[vflowIcon]', host: { class: 'vui-icon' } })
export class VflowIcon {}

/** Group of consumer controls in a card, label or toolbar; add `vflowNoDrag` to controls inside nodes. */
@Directive({ selector: '[vflowActions]', host: { class: 'vui-actions' } })
export class VflowActions {}
