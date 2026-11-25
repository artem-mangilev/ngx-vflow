import { Signal, computed } from '@angular/core';

/**
 * The properties of an application object as of the last change of `collection`. The application may add a signal
 * to an existing object and pass a new array, which a `computed` reading the object directly would never notice.
 * Dependents re-run only when a property of the object was added, removed or replaced.
 */
export function entitySnapshot<T extends object>(entity: T, collection: Signal<unknown>): Signal<T> {
  return computed(
    () => {
      collection();
      return { ...entity };
    },
    { equal: hasSameProperties },
  );
}

function hasSameProperties<T extends object>(a: T, b: T): boolean {
  const keys = Object.keys(a) as (keyof T)[];

  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}
