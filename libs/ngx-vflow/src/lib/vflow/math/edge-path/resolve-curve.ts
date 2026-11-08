import { Curve } from '../../interfaces/edge.interface';
import { CurveFactory, CurveFactoryParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { getStraightPath } from './straigh-path';
import { getBezierPath } from './bezier-path';
import { getSmoothStepPath } from './smooth-step-path';
import type { CurveRegistry } from '../../features/with-curves';

/**
 * Lays out a curve: a built-in one by name, a factory with the full parameters, or a factory registered under the
 * given key with `withCurves()`. The built-in curves take only the fields they need, so the lazily resolved
 * `nodeGeometries` stays untouched for them.
 */
export function resolveCurve(
  curve: Curve,
  params: CurveFactoryParams,
  registry: CurveRegistry | undefined,
): CurveLayout {
  switch (curve) {
    case 'straight':
      return getStraightPath(params);
    case 'bezier':
      return getBezierPath(params);
    case 'smooth-step':
      return getSmoothStepPath(params);
    case 'step': {
      const { sourcePoint, targetPoint, sourcePosition, targetPosition } = params;
      return getSmoothStepPath({ sourcePoint, targetPoint, sourcePosition, targetPosition, borderRadius: 0 });
    }
    default:
      return typeof curve === 'string' ? registeredCurve(curve, registry)(params) : curve(params);
  }
}

function registeredCurve(key: string, registry: CurveRegistry | undefined): CurveFactory {
  const factory = registry?.[key];
  if (!factory) {
    throw new Error(
      `[ngx-vflow] No curve is registered as "${key}". Register it with provideVflow(withCurves({ ${key}: … })).`,
    );
  }
  return factory;
}
