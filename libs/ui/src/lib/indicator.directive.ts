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
    class: `vui-status vui:inline-flex vui:box-border vui:items-center vui:gap-1.5 vui:rounded-full vui:border vui:border-current vui:px-2 vui:py-0.5 vui:bg-surface vui:text-muted vui:text-xs vui:leading-normal vui:data-[vui-tone=info]:text-info vui:data-[vui-tone=success]:text-success vui:data-[vui-tone=warning]:text-warning vui:data-[vui-tone=danger]:text-danger vui:data-[vui-busy=true]:before:content-[''] vui:data-[vui-busy=true]:before:size-1.75 vui:data-[vui-busy=true]:before:rounded-full vui:data-[vui-busy=true]:before:bg-current vui:data-[vui-busy=true]:before:animate-pulse vui:data-[vui-busy=true]:motion-reduce:before:animate-none`,
    '[attr.data-vui-tone]': 'vuiStatus()',
    '[attr.data-vui-busy]': 'vuiStatusBusy()',
  },
})
export class VuiStatus {
  readonly vuiStatus = input<VuiTone>('neutral');
  readonly vuiStatusBusy = input(false, { transform: booleanAttribute });
}
