import { Directive } from '@angular/core';

/** Primary text of a card header, row or group header: takes the remaining width and wraps. */
@Directive({
  selector: '[vuiTitle]',
  host: { class: 'vui-title flex-1 min-w-0 wrap-anywhere' },
})
export class VuiTitle {}

/** Secondary text such as a category, type, key or timestamp; regular weight even inside a header. */
@Directive({ selector: '[vuiMeta]', host: { class: 'vui-meta text-vui-muted text-xs font-normal' } })
export class VuiMeta {}
