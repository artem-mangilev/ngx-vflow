import { Observable, OperatorFunction, asyncScheduler } from 'rxjs';

/**
 * Collects the changes of one synchronous pass, such as one flush of effects, into a single array and delivers it
 * after `delay` ms: one timer for the pass, not one for every change.
 */
export function batchChanges<T>(delay = 0): OperatorFunction<T[], T[]> {
  return (source) =>
    new Observable<T[]>((subscriber) => {
      let batch: T[] | undefined;

      const subscription = source.subscribe({
        next: (changes) => {
          if (batch) {
            batch.push(...changes);
            return;
          }

          const collected = (batch = [...changes]);
          queueMicrotask(() => {
            batch = undefined;
            subscription.add(asyncScheduler.schedule(() => subscriber.next(collected), delay));
          });
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      });

      return subscription;
    });
}
