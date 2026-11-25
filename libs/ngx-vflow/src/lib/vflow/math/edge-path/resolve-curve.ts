import { CurveFactory, CurveFactoryParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { BuiltInCurve } from '../../interfaces/curves.interface';
import { getStraightPath } from './straigh-path';
import { getBezierPath } from './bezier-path';
import { getSmoothStepPath } from './smooth-step-path';

/**
 * Lays out a curve: a built-in one by name, or a factory with the full parameters. A registered key is replaced by
 * its factory before this, by `FlowRegistriesService`. The built-in curves take only the fields they need, so the
 * lazily resolved `nodeGeometries` stays untouched for them.
 */
export function resolveCurve(curve: BuiltInCurve | CurveFactory, params: CurveFactoryParams): CurveLayout {
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
      return curve(params);
  }
}
