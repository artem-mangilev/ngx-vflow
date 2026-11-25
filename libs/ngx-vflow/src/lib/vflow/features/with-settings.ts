import { InjectionToken, Signal } from '@angular/core';
import { VflowSettings } from '../interfaces/vflow-settings.interface';
import { VflowFeature, vflowFeature } from './feature';
import { FeatureValue, provideMergedFeatureValue } from './merged-feature-value';

/** The settings given with `withSettings()` for the flows below an injector, merged over the levels above. */
export const VFLOW_SETTINGS = new InjectionToken<Signal<Partial<VflowSettings>>>('VFLOW_SETTINGS');

/**
 * Sets the settings of the flows below the injector, by the names of the `vflow` inputs. A bound input still wins;
 * a `withSettings()` closer to the flow adds its keys to one further up. The value may be a factory run in the
 * injector, returning the settings or a signal of them:
 *
 * ```ts
 * provideVflow(withSettings({ minZoom: 0.2, zoomOnDoubleClick: true }));
 * provideVflow(withSettings(() => inject(Preferences).flowSettings));
 * ```
 */
export function withSettings(settings: FeatureValue<VflowSettings>): VflowFeature<'settings'> {
  return vflowFeature('settings', [provideMergedFeatureValue(VFLOW_SETTINGS, settings)]);
}
