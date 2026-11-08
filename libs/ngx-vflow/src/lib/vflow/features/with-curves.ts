import { InjectionToken, Signal } from '@angular/core';
import type { CurveFactory } from '../interfaces/curve-factory.interface';
import { BUILT_IN_CURVES, CurveKey } from '../interfaces/curves.interface';
import { VflowFeature, vflowFeature } from './feature';
import { provideMergedFeatureValue } from './merged-feature-value';

/** Curve factories by key, as a `withCurves()` call registers them. */
export type CurveRegistry = Partial<Record<string, CurveFactory>>;

/** The curves registered for the flows below an injector, merged over the levels above. */
export const VFLOW_CURVES = new InjectionToken<Signal<CurveRegistry>>('VFLOW_CURVES');

/**
 * Registers curve factories under keys, so an edge names its curve as `curve: 'avoid'` next to the built-in
 * `'bezier'` or `'smooth-step'`, and the graph holds no functions. A `withCurves()` closer to the flow adds its keys
 * to one further up; the built-in names cannot be registered. A key no level registers is an error when the edge
 * lays out its path.
 *
 * ```ts
 * provideVflow(withCurves({ avoid: avoidNodesCurve, loose: createAvoidNodesCurve({ nodePadding: 24 }) }));
 * ```
 */
export function withCurves(curves: Partial<Record<CurveKey, CurveFactory>>): VflowFeature<'curves'> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    for (const key of Object.keys(curves)) {
      if ((BUILT_IN_CURVES as readonly string[]).includes(key)) {
        throw new Error(`[ngx-vflow] "${key}" is a built-in curve; withCurves() cannot replace it.`);
      }
    }
  }
  return vflowFeature('curves', [provideMergedFeatureValue(VFLOW_CURVES, curves)]);
}
