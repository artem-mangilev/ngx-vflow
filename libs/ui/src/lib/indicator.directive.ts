import { Directive, input } from '@angular/core';

export type VuiTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Indicator with a semantic tone, drawn as a tint of the tone with darker (lighter in dark themes) text of the same hue
 * and your own text and icon; for work in progress put your own spinner icon inside. Use one instance per message: an
 * application status and a model diagnostic are two indicators shown side by side.
 */
@Directive({
  selector: '[vuiStatus]',
  host: {
    class: `vui-status
      inline-flex box-border items-center gap-vui-1 min-h-vui-5 px-vui-2 rounded-vui-control border border-transparent
      bg-vui-tone/16 text-vui-tone-ink antialiased text-xs font-medium
      [--vui-tone:var(--v-muted)] data-[vui-tone=info]:[--vui-tone:var(--vui-info)]
      data-[vui-tone=success]:[--vui-tone:var(--vui-success)] data-[vui-tone=warning]:[--vui-tone:var(--vui-warning)]
      data-[vui-tone=danger]:[--vui-tone:var(--vui-danger)]
      forced-colors:border-[CanvasText]`,
    '[attr.data-vui-tone]': 'vuiStatus()',
  },
})
export class VuiStatus {
  readonly vuiStatus = input<VuiTone>('neutral');
}
