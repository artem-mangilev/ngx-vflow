import { NodeTargets } from './position-writer';

export interface NodeAnimatorOptions {
  /** Speed of the node that travels farthest, in flow units per second; it sets the duration within the limits. */
  speed?: number;
  /** Shortest duration in milliseconds. */
  minDuration?: number;
  /** Longest duration in milliseconds. */
  maxDuration?: number;
  /** Fixed duration in milliseconds, instead of one from the distance. */
  duration?: number;
  /** Whether targets that arrive during an animation wait for it to end, instead of replacing it. */
  queued?: boolean;
}

export interface NodeAnimator {
  /** Moves the nodes to the targets; resolves once they arrive, or once a later animation or `cancel` replaced it. */
  animate(targets: NodeTargets): Promise<void>;
  /** Stops the animation where it is and drops the queue. */
  cancel(): void;
  running(): boolean;
}

const DEFAULTS: Required<Omit<NodeAnimatorOptions, 'duration'>> = {
  speed: 1100,
  minDuration: 250,
  maxDuration: 750,
  queued: false,
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const between = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Animates the `point`, `width` and `height` signals of nodes towards their targets with `requestAnimationFrame`,
 * over a duration that follows the longest distance, a change of size included. `VxLayoutAnimate` moves nodes into
 * a new layout with it; it works as well on its own.
 */
export function createNodeAnimator(options: NodeAnimatorOptions = {}): NodeAnimator {
  const settings = { ...DEFAULTS, ...options };
  const queue: { targets: NodeTargets; done: () => void }[] = [];
  let frame: number | null = null;
  let done: (() => void) | null = null;

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    done?.();
    done = null;
  };

  const start = (targets: NodeTargets, resolve: () => void) => {
    const moves = [...targets].map(([node, target]) => {
      // A size animates only where the node has one and the target gives one.
      const size =
        target.size && node.width && node.height
          ? { from: { width: node.width(), height: node.height() }, to: target.size }
          : null;
      return { node, from: node.point(), to: target.point, size };
    });
    const farthest = Math.max(
      0,
      ...moves.map(({ from, to, size }) =>
        Math.max(
          Math.hypot(to.x - from.x, to.y - from.y),
          size ? Math.hypot(size.to.width - size.from.width, size.to.height - size.from.height) : 0,
        ),
      ),
    );
    const duration =
      settings.duration ??
      Math.min(settings.maxDuration, Math.max(settings.minDuration, (farthest / settings.speed) * 1000));
    done = resolve;
    let startedAt: number | null = null;

    const step = (now: number) => {
      startedAt ??= now;
      const progress = duration > 0 ? Math.min(1, (now - startedAt) / duration) : 1;
      const eased = easeInOutCubic(progress);
      for (const { node, from, to, size } of moves) {
        node.point.set(progress === 1 ? to : { x: between(from.x, to.x, eased), y: between(from.y, to.y, eased) });
        if (size) {
          node.width?.set(progress === 1 ? size.to.width : between(size.from.width, size.to.width, eased));
          node.height?.set(progress === 1 ? size.to.height : between(size.from.height, size.to.height, eased));
        }
      }
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        stop();
        const next = queue.shift();
        if (next) start(next.targets, next.done);
      }
    };
    frame = requestAnimationFrame(step);
  };

  return {
    animate: (targets) =>
      new Promise((resolve) => {
        if (done && settings.queued) {
          queue.push({ targets, done: resolve });
          return;
        }
        stop();
        start(targets, resolve);
      }),
    cancel: () => {
      queue.splice(0).forEach((entry) => entry.done());
      stop();
    },
    running: () => done !== null,
  };
}
