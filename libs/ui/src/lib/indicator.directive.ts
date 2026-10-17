import { booleanAttribute, Directive, input } from '@angular/core';

export type VuiTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Indicator with a semantic tone, your own text/icon and optional activity. Use one instance per
 * message: an application status and a model diagnostic are two indicators shown side by side.
 * Activity is presentation only; it never disables actions or changes graph interaction.
 */
@Directive({
  selector: '[vuiStatus]',
  host: {
    class: `vui-status
      inline-flex box-border items-center gap-vui-1 min-h-vui-5 px-vui-2 rounded-full border border-current
      bg-vui-surface text-vui-muted font-vui-sans text-vui-caption
      data-[vui-tone=info]:text-vui-info data-[vui-tone=success]:text-vui-success
      data-[vui-tone=warning]:text-vui-warning data-[vui-tone=danger]:text-vui-danger
      data-[vui-busy=true]:before:content-[''] data-[vui-busy=true]:before:size-vui-2 data-[vui-busy=true]:before:rounded-full
      data-[vui-busy=true]:before:bg-current data-[vui-busy=true]:before:animate-vui-pulse motion-reduce:data-[vui-busy=true]:before:animate-none`,
    '[attr.data-vui-tone]': 'vuiStatus()',
    '[attr.data-vui-busy]': 'vuiStatusBusy()',
  },
})
export class VuiStatus {
  readonly vuiStatus = input<VuiTone>('neutral');
  readonly vuiStatusBusy = input(false, { transform: booleanAttribute });
}
