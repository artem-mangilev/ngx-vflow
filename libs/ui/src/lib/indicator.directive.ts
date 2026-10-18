import { booleanAttribute, Directive, input } from '@angular/core';

export type VuiTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Indicator with a semantic tone, drawn as a tint of the tone with darker (lighter in dark themes) text of the same hue, your own text/icon and optional activity. Use one instance per
 * message: an application status and a model diagnostic are two indicators shown side by side.
 * Activity is presentation only; it never disables actions or changes graph interaction.
 */
@Directive({
  selector: '[vuiStatus]',
  host: {
    class: `vui-status
      inline-flex box-border items-center gap-vui-1 min-h-vui-5 px-vui-2 rounded-vui-control border border-transparent
      bg-vui-tone/16 text-vui-tone-ink tracking-vui-normal antialiased text-vui-caption font-vui-medium
      [--vui-tone:var(--vui-muted)] data-[vui-tone=info]:[--vui-tone:var(--vui-info)]
      data-[vui-tone=success]:[--vui-tone:var(--vui-success)] data-[vui-tone=warning]:[--vui-tone:var(--vui-warning)]
      data-[vui-tone=danger]:[--vui-tone:var(--vui-danger)]
      data-[vui-busy=true]:before:content-[''] data-[vui-busy=true]:before:size-vui-2 data-[vui-busy=true]:before:rounded-full
      data-[vui-busy=true]:before:bg-vui-tone data-[vui-busy=true]:before:animate-vui-pulse motion-reduce:data-[vui-busy=true]:before:animate-none
      forced-colors:border-[CanvasText]`,
    '[attr.data-vui-tone]': 'vuiStatus()',
    '[attr.data-vui-busy]': 'vuiStatusBusy()',
  },
})
export class VuiStatus {
  readonly vuiStatus = input<VuiTone>('neutral');
  readonly vuiStatusBusy = input(false, { transform: booleanAttribute });
}
