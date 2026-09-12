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
    class: 'vui-status',
    '[attr.data-tone]': 'vflowStatus()',
    '[attr.data-busy]': 'vflowStatusBusy()',
  },
})
export class VflowStatus {
  readonly vflowStatus = input<VflowTone>('neutral');
  readonly vflowStatusBusy = input(false, { transform: booleanAttribute });
}
