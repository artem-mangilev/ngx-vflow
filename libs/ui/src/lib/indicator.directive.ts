import { booleanAttribute, Directive, input } from '@angular/core';

export type VflowTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Indicator with a semantic tone, your own text/icon and optional activity. Use one instance per
 * message: an application status and a model diagnostic are two indicators shown side by side.
 * Activity is presentation only; it never disables actions or changes graph interaction.
 */
@Directive({
  selector: '[vflowStatus]',
  host: {
    class: `vui-status vui:inline-flex vui:box-border vui:items-center vui:gap-1.5 vui:rounded-full vui:border vui:border-current vui:px-2 vui:py-0.5 vui:bg-surface vui:text-muted vui:text-xs vui:leading-normal vui:data-[tone=info]:text-info vui:data-[tone=success]:text-success vui:data-[tone=warning]:text-warning vui:data-[tone=danger]:text-danger vui:data-[busy=true]:before:content-[''] vui:data-[busy=true]:before:size-1.75 vui:data-[busy=true]:before:rounded-full vui:data-[busy=true]:before:bg-current vui:data-[busy=true]:before:animate-pulse vui:motion-reduce:before:animate-none`,
    '[attr.data-tone]': 'vflowStatus()',
    '[attr.data-busy]': 'vflowStatusBusy()',
  },
})
export class VflowStatus {
  readonly vflowStatus = input<VflowTone>('neutral');
  readonly vflowStatusBusy = input(false, { transform: booleanAttribute });
}
