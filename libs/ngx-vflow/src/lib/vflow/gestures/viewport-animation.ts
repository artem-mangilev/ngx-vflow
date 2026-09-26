import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';
import { easeCubicInOut, interpolateViewport } from './zoom-interpolation';

export interface ViewportAnimationOptions {
  duration: number;
  /** Read on the first frame, together with {@link target}, {@link anchor} and {@link size}. */
  current: () => ViewportState;
  target: (from: ViewportState) => ViewportState;
  anchor: () => Point;
  size: () => number;
  onStart: () => void;
  onFrame: (state: ViewportState) => void;
  onEnd: () => void;
}

export interface ViewportAnimation {
  /** Stops the animation; `onEnd` runs when it had started. */
  interrupt(): void;
}

/**
 * Animates the viewport on animation frames. Time counts from the call; the start and end values are read on the
 * first frame, so that an animation requested during another one continues from wherever the viewport is by then.
 */
export function animateViewport(options: ViewportAnimationOptions): ViewportAnimation {
  const startTime = performance.now();
  let frame: number | null = null;
  let started = false;
  let done = false;
  let interpolate: (t: number) => ViewportState;

  const finish = () => {
    done = true;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (started) options.onEnd();
  };

  const tick = () => {
    frame = null;
    if (done) return;
    if (!started) {
      const from = options.current();
      interpolate = interpolateViewport(from, options.target(from), options.anchor(), options.size());
      started = true;
      options.onStart();
      if (done) return;
    }
    const elapsed = performance.now() - startTime;
    const last = elapsed >= options.duration;
    options.onFrame(interpolate(last ? 1 : easeCubicInOut(Math.max(0, elapsed) / options.duration)));
    if (done) return;
    if (last) finish();
    else frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return {
    interrupt: () => {
      if (!done) finish();
    },
  };
}
