import { WritableSignal, computed, untracked } from '@angular/core';

/**
 * A writable signal that reads and writes the signal `target` currently returns. The cast adds the writable brand,
 * which is private to Angular.
 */
export function forwardSignal<T>(target: () => WritableSignal<T>): WritableSignal<T> {
  const read = computed(() => target()());

  return Object.assign(read, {
    set: (value: T) => untracked(target).set(value),
    update: (updateFn: (value: T) => T) => untracked(target).update(updateFn),
    asReadonly: () => read,
  }) as WritableSignal<T>;
}
