import { DestroyRef, EnvironmentInjector, Signal, effect, untracked } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * `toObservable` for an observable created on demand. The current value is read when the observable is created,
 * so a change made before its effect first runs still emits; `toObservable` would report the changed value as the
 * initial one.
 */
export function observeSignal<T>(source: Signal<T>, injector: EnvironmentInjector): Observable<T> {
  const subject = new BehaviorSubject(untracked(source));
  const ref = effect(
    () => {
      const value = source();
      untracked(() => subject.next(value));
    },
    { injector, manualCleanup: true },
  );
  injector.get(DestroyRef).onDestroy(() => {
    ref.destroy();
    subject.complete();
  });
  // The first run of the effect repeats the value read at creation.
  return subject.pipe(distinctUntilChanged());
}
