import { InjectionToken, Provider, Signal, computed, inject, isSignal, signal } from '@angular/core';
import { withDefaults } from '../utils/with-defaults';

/**
 * The value of a feature: the object itself, a signal of it, or a factory run in the injector that returns either.
 * A factory can `inject()` a service; a signal keeps the flow following the value.
 */
export type FeatureValue<T extends object> = Partial<T> | Signal<Partial<T>> | (() => Partial<T> | Signal<Partial<T>>);

/**
 * Provides `token` as a signal of `value` laid over the value of the same token from the injector levels above, so a
 * feature on a component adds to one at the root instead of replacing it. By default omitted and `undefined` keys
 * fall through to the level above; `merge` replaces that rule. The library default is applied by the reader.
 */
export function provideMergedFeatureValue<T extends object>(
  token: InjectionToken<Signal<Partial<T>>>,
  value: FeatureValue<T>,
  merge: (below: Partial<T>, own: Partial<T>) => Partial<T> = withDefaults,
): Provider {
  return {
    provide: token,
    useFactory: () => {
      const parent = inject(token, { skipSelf: true, optional: true });
      const own = ownSignal(value);
      return computed(() => merge(parent?.() ?? {}, own()));
    },
  };
}

function ownSignal<T extends object>(value: FeatureValue<T>): Signal<Partial<T>> {
  if (isSignal(value)) return value;
  if (typeof value === 'function') {
    const produced = value();
    return isSignal(produced) ? produced : signal(produced).asReadonly();
  }
  return signal(value).asReadonly();
}
