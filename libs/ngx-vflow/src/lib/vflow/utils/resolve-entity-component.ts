import { Signal, untracked } from '@angular/core';
import type { EntityComponentType } from '../interfaces/node.interface';
import type { EntityComponentRegistry } from '../features/with-entity-components';

/**
 * The component of an entity: the class or factory as given, or the one registered under a key. Read once, when the
 * model is created: a registry does not change while a flow lives. A key nobody registered is a programming error,
 * like the missing component of a route.
 */
export function resolveEntityComponent(
  kind: 'node' | 'edge',
  component: EntityComponentType | string | undefined,
  registry: Signal<EntityComponentRegistry> | null,
): EntityComponentType | undefined {
  if (typeof component !== 'string') return component;

  const resolved = untracked(() => registry?.()[component]);
  if (!resolved) {
    const feature = kind === 'node' ? 'withNodeComponents' : 'withEdgeComponents';
    throw new Error(
      `[ngx-vflow] No ${kind} component is registered as "${component}". Register it with provideVflow(${feature}({ ${component}: … })).`,
    );
  }
  return resolved;
}
