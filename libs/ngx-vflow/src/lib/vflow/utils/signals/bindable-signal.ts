import { Signal, computed, signal } from '@angular/core';

/** A read-only signal that reads `initial` until a source signal is bound to it. */
export interface BindableSignal<T> extends Signal<T> {
  /** Reads `source` from now on; readers that already hold this signal follow the switch. */
  bind(source: Signal<T>): void;
}

export function bindableSignal<T>(initial: T): BindableSignal<T> {
  const source = signal<Signal<T>>(signal(initial));
  const read = computed(() => source()());

  return Object.assign(read, { bind: (next: Signal<T>) => source.set(next) });
}
