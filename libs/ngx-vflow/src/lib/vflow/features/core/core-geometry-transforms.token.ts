import { InjectionToken, Type } from '@angular/core';
import { GeometryTransform } from '../geometry-intent.interface';

/**
 * Transforms `<vflow>` registers itself for the semantics of entity fields and existing inputs. They carry the
 * reserved `core:` id prefix and resolve together with the feature entries, so a feature orders itself around them.
 */
export const VFLOW_CORE_GEOMETRY_TRANSFORMS = new InjectionToken<Type<GeometryTransform>[]>(
  'VFLOW_CORE_GEOMETRY_TRANSFORMS',
);
