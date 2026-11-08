import { InjectionToken, Signal } from '@angular/core';
import { AriaLabelConfig } from '../interfaces/aria-label-config.interface';
import { VflowFeature, vflowFeature } from './feature';
import { FeatureValue, provideMergedFeatureValue } from './merged-feature-value';

/** The labels given with `withAccessibility()` for the flows below an injector, merged over the levels above. */
export const VFLOW_ARIA_LABELS = new InjectionToken<Signal<Partial<AriaLabelConfig>>>('VFLOW_ARIA_LABELS');

/**
 * Localizes the names, descriptions and announcements of the flows below the injector. Omitted keys keep their
 * English defaults, `DEFAULT_ARIA_LABEL_CONFIG`; a `withAccessibility()` closer to the flow adds its keys to one
 * further up. The value may be a factory run in the injector, returning the labels or a signal of them, so the
 * labels can come from a translation service and follow a change of language:
 *
 * ```ts
 * provideVflow(withAccessibility({ flowLabel: 'Граф согласования', selected: 'Выбран.' }));
 * provideVflow(withAccessibility(() => inject(Translations).vflowLabels));
 * ```
 */
export function withAccessibility(labels: FeatureValue<AriaLabelConfig>): VflowFeature<'accessibility'> {
  return vflowFeature('accessibility', [provideMergedFeatureValue(VFLOW_ARIA_LABELS, labels)]);
}
