import * as rxjs from 'rxjs';
import { Observable, defer, animationFrameScheduler } from 'rxjs';
import { map } from 'rxjs/operators';

// A backport of RxJS 7 animationFrames for RxJS 6.
function customAnimationFrames() {
  return defer(() => {
    const start = animationFrameScheduler.now();

    return new Observable<number>((subscriber) =>
      // Create a recursive scheduling action
      animationFrameScheduler.schedule(function () {
        subscriber.next(animationFrameScheduler.now());
        // Reschedule the next tick
        if (!subscriber.closed) {
          this.schedule();
        }
      }),
    ).pipe(map((timestamp) => ({ timestamp, elapsed: timestamp - start })));
  });
}

export const animationFrames =
  typeof rxjs.animationFrames === 'function' ? rxjs.animationFrames : customAnimationFrames;
