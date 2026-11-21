import { InjectionToken, Signal } from '@angular/core';
import { MinimapNodeStyle, MinimapSettings } from '../interfaces/minimap.interface';
import { withDefaults } from '../utils/with-defaults';
import { VflowFeature, vflowFeature } from './feature';
import { FeatureValue, provideMergedFeatureValue } from './merged-feature-value';

/** The minimap settings given with `withMinimapSettings()`, merged over the levels above. */
export const VFLOW_MINIMAP_SETTINGS = new InjectionToken<Signal<Partial<MinimapSettings>>>('VFLOW_MINIMAP_SETTINGS');

/**
 * Sets how the minimaps of the flows below the injector draw the nodes of a component, by the key the component is
 * registered under with `withNodeComponents()`. A node overrides its component with `Node.minimap`. A
 * `withMinimapSettings()` closer to the flow adds its keys, and the keys of a style, to one further up.
 *
 * ```ts
 * provideVflow(
 *   withNodeComponents({ task: TaskNode, decision: DecisionNode }),
 *   withMinimapSettings({
 *     nodeStyles: {
 *       task: { background: 'var(--task)' },
 *       decision: { background: 'var(--decision)', borderRadius: 999 },
 *     },
 *   }),
 * );
 * ```
 */
export function withMinimapSettings(settings: FeatureValue<MinimapSettings>): VflowFeature<'minimap'> {
  return vflowFeature('minimap', [provideMergedFeatureValue(VFLOW_MINIMAP_SETTINGS, settings, mergeSettings)]);
}

function mergeSettings(below: Partial<MinimapSettings>, own: Partial<MinimapSettings>): Partial<MinimapSettings> {
  const nodeStyles: Partial<Record<string, MinimapNodeStyle>> = { ...below.nodeStyles };
  for (const [key, style] of Object.entries(own.nodeStyles ?? {})) {
    if (style) nodeStyles[key] = withDefaults(nodeStyles[key] ?? {}, style);
  }
  return { ...withDefaults(below, own), nodeStyles };
}
