import { InjectionToken, Signal } from '@angular/core';
import { MinimapSettings } from '../interfaces/minimap.interface';
import type { Node } from '../interfaces/node.interface';
import { withDefaults } from '../utils/with-defaults';
import { VflowFeature, vflowFeature } from './feature';
import { FeatureValue, provideMergedFeatureValue } from './merged-feature-value';

/** The minimap settings given with `withMinimapSettings()`, merged over the levels above. */
export const VFLOW_MINIMAP_SETTINGS = new InjectionToken<Signal<Partial<MinimapSettings>>>('VFLOW_MINIMAP_SETTINGS');

/**
 * Sets how the minimaps of the flows below the injector draw the nodes of a component, by the key the component is
 * registered under with `withNodeComponents()`: a style, or a function that derives one from the node. Every node is
 * drawn by the `--v-minimap-*` tokens below that, so the graph holds nothing about the minimap.
 *
 * ```ts
 * provideVflow(
 *   withNodeComponents({ task: TaskNode, decision: DecisionNode }),
 *   withMinimapSettings<Node<Task>>({
 *     nodeStyles: {
 *       task: (node) => (node.data?.().failed ? FAILED : undefined),
 *       decision: { background: 'var(--decision)', borderRadius: 999 },
 *     },
 *   }),
 * );
 * ```
 *
 * A `withMinimapSettings()` closer to the flow adds its keys to one further up; a key it sets replaces the style of
 * that key above.
 */
export function withMinimapSettings<N extends Node = Node>(
  settings: FeatureValue<MinimapSettings<N>>,
): VflowFeature<'minimap'> {
  return vflowFeature('minimap', [
    // The token is not generic: a rule takes the node of the application, whatever its data.
    provideMergedFeatureValue(VFLOW_MINIMAP_SETTINGS, settings as FeatureValue<MinimapSettings>, mergeSettings),
  ]);
}

function mergeSettings(below: Partial<MinimapSettings>, own: Partial<MinimapSettings>): Partial<MinimapSettings> {
  return { ...withDefaults(below, own), nodeStyles: withDefaults(below.nodeStyles ?? {}, own.nodeStyles) };
}
