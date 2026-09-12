import { booleanAttribute, Directive, input } from '@angular/core';

export type VflowTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Application status: a semantic tone, your own text/icon and optional activity.
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

/**
 * Diagnostic about the model (validation, configuration): independent from selection and from
 * application status, so all three can be shown at once. Provide text; icon-only content needs an accessible name.
 */
@Directive({
  selector: '[vflowDiagnostic]',
  host: { class: 'vui-diagnostic', '[attr.data-tone]': 'vflowDiagnostic()' },
})
export class VflowDiagnostic {
  readonly vflowDiagnostic = input<'info' | 'warning' | 'danger'>('warning');
}
