import { Node, Point } from 'ngx-vflow';

/** Node-space target positions, by node. */
export type NodePositionTargets = ReadonlyMap<Node, Point>;

export interface NodePositionAnimatorOptions {
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

export interface NodePositionAnimator {
  /** Moves the nodes to the targets; resolves once they arrive, or once a later animation or `cancel` replaced it. */
  animate(targets: NodePositionTargets): Promise<void>;
  /** Stops the animation where it is and drops the queue. */
  cancel(): void;
  running(): boolean;
}

const DEFAULTS: Required<Omit<NodePositionAnimatorOptions, 'duration'>> = {
  speed: 1100,
  minDuration: 250,
  maxDuration: 750,
  queued: false,
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Animates the `point` signals of nodes towards target positions with `requestAnimationFrame`, over a duration that
 * follows the longest distance. `VxLayoutAnimate` moves nodes into a new layout with it; it works as well on its own.
 */
export function createNodePositionAnimator(options: NodePositionAnimatorOptions = {}): NodePositionAnimator {
  const settings = { ...DEFAULTS, ...options };
  const queue: { targets: NodePositionTargets; done: () => void }[] = [];
  let frame: number | null = null;
  let done: (() => void) | null = null;

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    done?.();
    done = null;
  };

  const start = (targets: NodePositionTargets, resolve: () => void) => {
    const moves = [...targets].map(([node, target]) => ({ node, start: node.point(), target }));
    const farthest = Math.max(
      0,
      ...moves.map(({ start, target }) => Math.hypot(target.x - start.x, target.y - start.y)),
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
      for (const { node, start, target } of moves) {
        node.point.set(
          progress === 1
            ? target
            : { x: start.x + (target.x - start.x) * eased, y: start.y + (target.y - start.y) * eased },
        );
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
