import { Injectable, Signal, inject, untracked } from '@angular/core';
import type { EntityComponentType } from '../interfaces/node.interface';
import type { Curve } from '../interfaces/edge.interface';
import type { CurveFactory } from '../interfaces/curve-factory.interface';
import { BUILT_IN_CURVES, BuiltInCurve } from '../interfaces/curves.interface';
import {
  EntityComponentRegistry,
  VFLOW_EDGE_COMPONENTS,
  VFLOW_NODE_COMPONENTS,
} from '../features/with-entity-components';
import { CurveRegistry, VFLOW_CURVES } from '../features/with-curves';

/**
 * The registries a flow resolves keys through: the components and curves registered with `withNodeComponents()`,
 * `withEdgeComponents()` and `withCurves()` on the injector levels above it. `vflow` provides its own instance, so
 * the models neither know the tokens nor handle their absence; the root instance serves a model created outside a
 * flow, as in a unit test, with the registries of the root. A registry is read without tracking: it does not change
 * while the flow lives, and a key nobody registered is a programming error, like the missing component of a route.
 */
@Injectable({ providedIn: 'root' })
export class FlowRegistriesService {
  private readonly nodeComponents = inject(VFLOW_NODE_COMPONENTS, { optional: true });
  private readonly edgeComponents = inject(VFLOW_EDGE_COMPONENTS, { optional: true });
  private readonly curves = inject(VFLOW_CURVES, { optional: true });

  /** The component that draws a node: the class or factory as given, or the one registered under the key. */
  public nodeComponent(component: EntityComponentType | string | undefined): EntityComponentType | undefined {
    return resolveComponent(component, this.nodeComponents, 'node', 'withNodeComponents');
  }

  /** The component that draws an edge, as {@link nodeComponent}. */
  public edgeComponent(component: EntityComponentType | string | undefined): EntityComponentType | undefined {
    return resolveComponent(component, this.edgeComponents, 'edge', 'withEdgeComponents');
  }

  /** A curve ready to lay out: a built-in name or a factory, with a key replaced by the factory registered under it. */
  public curve(curve: Curve): BuiltInCurve | CurveFactory {
    if (typeof curve !== 'string' || (BUILT_IN_CURVES as readonly string[]).includes(curve)) {
      return curve as BuiltInCurve | CurveFactory;
    }
    const factory = untracked(() => this.curves?.()[curve]);
    if (!factory) {
      throw new Error(
        `[ngx-vflow] No curve is registered as "${curve}". Register it with provideVflow(withCurves({ ${curve}: … })).`,
      );
    }
    return factory;
  }
}

function resolveComponent(
  component: EntityComponentType | string | undefined,
  registry: Signal<EntityComponentRegistry> | null,
  kind: 'node' | 'edge',
  feature: 'withNodeComponents' | 'withEdgeComponents',
): EntityComponentType | undefined {
  if (typeof component !== 'string') return component;

  const resolved = untracked(() => registry?.()[component]);
  if (!resolved) {
    throw new Error(
      `[ngx-vflow] No ${kind} component is registered as "${component}". Register it with provideVflow(${feature}({ ${component}: … })).`,
    );
  }
  return resolved;
}

export type { CurveRegistry };
