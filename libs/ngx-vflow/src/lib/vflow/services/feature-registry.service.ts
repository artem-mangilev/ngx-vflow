import { DestroyRef, inject, Injectable, Injector, Type } from '@angular/core';
import { ConnectionPolicy } from '../features/connection-policy.interface';
import { VFLOW_CORE_GEOMETRY_TRANSFORMS } from '../features/core/core-geometry-transforms.token';
import { VFLOW_PROVIDE_MARKER } from '../features/feature';
import { GeometryTransform, IntentKind, IntentPhase } from '../features/geometry-intent.interface';
import { VFLOW_CONNECTION_POLICIES } from '../features/provide-connection-policy';
import { VFLOW_GEOMETRY_TRANSFORMS } from '../features/provide-geometry-transform';
import { resolveFeatureEntries } from '../utils/resolve-feature-entries';

/**
 * The entries features registered on this flow, in their resolved order. Classes are created in a child of the
 * flow's injector, which lives as long as the flow.
 */
@Injectable()
export class FeatureRegistryService {
  private readonly injector = inject(Injector);
  private readonly entryInjector = Injector.create({
    providers: this.classes(),
    parent: this.injector,
    name: 'vflow-features',
  });

  public readonly geometryTransforms: readonly GeometryTransform[] = resolveFeatureEntries([
    ...this.instances<GeometryTransform>(VFLOW_CORE_GEOMETRY_TRANSFORMS),
    ...this.instances<GeometryTransform>(VFLOW_GEOMETRY_TRANSFORMS),
  ]);
  public readonly connectionPolicies: readonly ConnectionPolicy[] = resolveFeatureEntries(
    this.instances(VFLOW_CONNECTION_POLICIES),
  );

  private readonly transformsByKindAndPhase = new Map<string, readonly GeometryTransform[]>();

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const calls = this.injector.get(VFLOW_PROVIDE_MARKER, [], { optional: true });
      if (calls.length > 1) {
        throw new Error('[ngx-vflow] provideVflow was called twice in one injector; pass every feature to one call.');
      }
    }
    inject(DestroyRef).onDestroy(() => this.entryInjector.destroy());
  }

  /** The transforms that see an intent of this kind in this phase, resolved once per pair. */
  public transformsFor(kind: IntentKind, phase: IntentPhase): readonly GeometryTransform[] {
    const key = `${kind}:${phase}`;
    let transforms = this.transformsByKindAndPhase.get(key);
    if (!transforms) {
      transforms = this.geometryTransforms.filter(
        (t) => (!t.kinds || t.kinds.includes(kind)) && (!t.phases || t.phases.includes(phase)),
      );
      this.transformsByKindAndPhase.set(key, transforms);
    }
    return transforms;
  }

  private classes(): Type<unknown>[] {
    const entries: unknown[] = [
      ...this.injector.get(VFLOW_CORE_GEOMETRY_TRANSFORMS, [], { optional: true }),
      ...this.injector.get(VFLOW_GEOMETRY_TRANSFORMS, [], { optional: true }),
      ...this.injector.get(VFLOW_CONNECTION_POLICIES, [], { optional: true }),
    ];
    return entries.filter(isClass);
  }

  private instances<T extends object>(
    token: typeof VFLOW_CORE_GEOMETRY_TRANSFORMS | typeof VFLOW_GEOMETRY_TRANSFORMS | typeof VFLOW_CONNECTION_POLICIES,
  ): T[] {
    return (this.injector.get(token, [], { optional: true }) as (T | Type<T>)[]).map((entry) =>
      isClass(entry) ? this.entryInjector.get(entry) : entry,
    );
  }
}

function isClass<T>(entry: T | Type<T>): entry is Type<T> {
  return typeof entry === 'function';
}
