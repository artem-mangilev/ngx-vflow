import { InjectionToken, Provider, Type } from '@angular/core';
import { GeometryTransform } from './geometry-intent.interface';

/** Registered geometry transforms: instances, or classes the flow instantiates in its own injector. */
export const VFLOW_GEOMETRY_TRANSFORMS = new InjectionToken<(GeometryTransform | Type<GeometryTransform>)[]>(
  'VFLOW_GEOMETRY_TRANSFORMS',
);

/**
 * The providers that register one transform on the geometry intent pipeline, for the provider list of a feature. A
 * class is created by the `<vflow>` injector, so it can `inject()` the flow's services; a value is used as given.
 */
export function provideGeometryTransform(entry: GeometryTransform | Type<GeometryTransform>): Provider[] {
  return [{ provide: VFLOW_GEOMETRY_TRANSFORMS, useValue: entry, multi: true }];
}
