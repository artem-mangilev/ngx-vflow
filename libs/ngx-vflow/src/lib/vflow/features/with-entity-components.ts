import { InjectionToken, Signal } from '@angular/core';
import type { EntityComponentType } from '../interfaces/node.interface';
import { EdgeComponentKey, NodeComponentKey } from '../interfaces/entity-components.interface';
import { VflowFeature, vflowFeature } from './feature';
import { provideMergedFeatureValue } from './merged-feature-value';

/** Components by key, as a `with*Components()` call registers them. */
export type EntityComponentRegistry = Partial<Record<string, EntityComponentType>>;

/** The node components registered for the flows below an injector, merged over the levels above. */
export const VFLOW_NODE_COMPONENTS = new InjectionToken<Signal<EntityComponentRegistry>>('VFLOW_NODE_COMPONENTS');

/** The edge components registered for the flows below an injector, merged over the levels above. */
export const VFLOW_EDGE_COMPONENTS = new InjectionToken<Signal<EntityComponentRegistry>>('VFLOW_EDGE_COMPONENTS');

/**
 * Registers node components under keys, so a node names its component as `component: 'task'` instead of importing
 * the class. A value is a component class or a `() => import(...)` factory, as in `component` itself. A
 * `withNodeComponents()` closer to the flow adds its keys to one further up. A key no level registers is an error
 * when the node is created.
 *
 * ```ts
 * provideVflow(withNodeComponents({ task: TaskNode, decision: () => import('./decision').then((m) => m.DecisionNode) }));
 * ```
 */
export function withNodeComponents(
  components: Partial<Record<NodeComponentKey, EntityComponentType>>,
): VflowFeature<'node-components'> {
  return vflowFeature('node-components', [provideMergedFeatureValue(VFLOW_NODE_COMPONENTS, components)]);
}

/** Registers edge components under keys for `Edge.component`, like {@link withNodeComponents}. */
export function withEdgeComponents(
  components: Partial<Record<EdgeComponentKey, EntityComponentType>>,
): VflowFeature<'edge-components'> {
  return vflowFeature('edge-components', [provideMergedFeatureValue(VFLOW_EDGE_COMPONENTS, components)]);
}
