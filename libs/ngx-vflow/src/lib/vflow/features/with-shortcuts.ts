import { InjectionToken, Signal } from '@angular/core';
import { KeyboardShortcuts } from '../types/keyboard-shortcuts.type';
import { suppliedEntries } from '../utils/with-defaults';
import { VflowFeature, vflowFeature } from './feature';
import { FeatureValue, provideMergedFeatureValue } from './merged-feature-value';

/** The keys given with `withShortcuts()` for the flows below an injector, merged over the levels above. */
export const VFLOW_SHORTCUTS = new InjectionToken<Signal<KeyboardShortcuts>>('VFLOW_SHORTCUTS');

/** Lays the entries of `own` over those of `below`, section by section, as the flow lays them over the defaults. */
export function mergeShortcuts(below: KeyboardShortcuts, own: KeyboardShortcuts): KeyboardShortcuts {
  return {
    modifiers: { ...below.modifiers, ...suppliedEntries(own.modifiers) },
    commands: { ...below.commands, ...suppliedEntries(own.commands) },
  };
}

/**
 * Binds the keys of the flows below the injector: `modifiers` stay active while held and change pointer gestures,
 * `commands` run on a press. An entry replaces the whole list of its command or modifier, an empty list disables
 * it, and an omitted entry keeps its default; a `withShortcuts()` closer to the flow adds its entries to one further
 * up. The value may be a factory run in the injector, returning the shortcuts or a signal of them:
 *
 * ```ts
 * provideVflow(withShortcuts({ modifiers: { panActivation: ['Space'] }, commands: { delete: ['x'] } }));
 * provideVflow(withShortcuts(() => inject(Preferences).shortcuts));
 * ```
 */
export function withShortcuts(shortcuts: FeatureValue<KeyboardShortcuts>): VflowFeature<'shortcuts'> {
  return vflowFeature('shortcuts', [provideMergedFeatureValue(VFLOW_SHORTCUTS, shortcuts, mergeShortcuts)]);
}
