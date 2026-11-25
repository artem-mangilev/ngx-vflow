import { Node, createNodes } from 'ngx-vflow';
import { createNodeAnimator } from './node-animator';
import { NodeTargets } from './position-writer';

describe('createNodeAnimator', () => {
  let nodes: Node[];

  beforeEach(() => {
    // Frames come every 16 ms of the fake clock, from the moment the timers are installed.
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    nodes = createNodes([
      { id: 'a', point: { x: 0, y: 0 } },
      { id: 'sized', point: { x: 0, y: 0 }, width: 100, height: 50 },
    ]);
  });

  afterEach(() => vi.useRealTimers());

  const at = (id: string) => nodes.find((node) => node.id === id)!;
  const frames = (count: number) => vi.advanceTimersByTimeAsync(16 * count);
  const toward = (x: number, size?: { width: number; height: number }): NodeTargets =>
    new Map([
      [at('a'), { point: { x, y: 0 } }],
      ...(size ? [[at('sized'), { point: { x, y: 0 }, size }] as const] : []),
    ]);

  it('moves a node halfway at the middle of the duration', async () => {
    createNodeAnimator({ duration: 96 }).animate(toward(100));

    await frames(4);

    expect(at('a').point()).toEqual({ x: 50, y: 0 });
  });

  it('eases the movement: slower at the start than the straight line', async () => {
    createNodeAnimator({ duration: 160 }).animate(toward(100));

    await frames(3);

    expect(at('a').point().x).toBeLessThan((100 * 2 * 16) / 160);
  });

  it('puts the node exactly on the target when the duration is over', async () => {
    createNodeAnimator({ duration: 96 }).animate(toward(33.3));

    await frames(10);

    expect(at('a').point()).toEqual({ x: 33.3, y: 0 });
  });

  it('resolves once the nodes arrive', async () => {
    const arrived = vi.fn();
    createNodeAnimator({ duration: 96 }).animate(toward(100)).then(arrived);

    await frames(3);
    expect(arrived).not.toHaveBeenCalled();
    await frames(5);

    expect(arrived).toHaveBeenCalledOnce();
  });

  it('animates the size of a node that has one', async () => {
    createNodeAnimator({ duration: 96 }).animate(toward(0, { width: 300, height: 150 }));

    await frames(4);

    expect([at('sized').width!(), at('sized').height!()]).toEqual([200, 100]);
  });

  it('ends on the target size', async () => {
    createNodeAnimator({ duration: 96 }).animate(toward(0, { width: 300, height: 150 }));

    await frames(10);

    expect([at('sized').width!(), at('sized').height!()]).toEqual([300, 150]);
  });

  it('leaves the size alone when the target has none', async () => {
    createNodeAnimator({ duration: 96 }).animate(toward(100));

    await frames(10);

    expect([at('sized').width!(), at('sized').height!()]).toEqual([100, 50]);
  });

  it('moves a node without an explicit size even when the target has one', async () => {
    const targets: NodeTargets = new Map([[at('a'), { point: { x: 40, y: 0 }, size: { width: 300, height: 150 } }]]);
    createNodeAnimator({ duration: 96 }).animate(targets);

    await frames(10);

    expect([at('a').point(), at('a').width, at('a').height]).toEqual([{ x: 40, y: 0 }, undefined, undefined]);
  });

  describe('duration', () => {
    /** Whether a node that travels `distance` has arrived after `ms` of the fake clock. */
    async function hasArrived(ms: number, distance: number, options = {}) {
      createNodeAnimator(options).animate(toward(distance));
      await frames(Math.round(ms / 16));
      return at('a').point().x === distance;
    }

    it('lasts at least the minimum for a short move', async () => {
      expect(await hasArrived(224, 1)).toBe(false);
    });

    it('is over soon after the minimum for a short move', async () => {
      expect(await hasArrived(304, 1)).toBe(true);
    });

    it('lasts up to the maximum for a long move', async () => {
      expect(await hasArrived(720, 100_000)).toBe(false);
    });

    it('is over soon after the maximum for a long move', async () => {
      expect(await hasArrived(800, 100_000)).toBe(true);
    });

    it('follows the distance between the limits', async () => {
      // 550 units at 1100 units per second take 500 ms.
      expect(await hasArrived(480, 550)).toBe(false);
    });

    it('is over soon after the time the distance takes', async () => {
      expect(await hasArrived(560, 550)).toBe(true);
    });

    it('follows the speed', async () => {
      // 550 units at 550 units per second take a second.
      expect(await hasArrived(960, 550, { speed: 550, maxDuration: 5000 })).toBe(false);
    });

    it('is over soon after the time the speed takes', async () => {
      expect(await hasArrived(1100, 550, { speed: 550, maxDuration: 5000 })).toBe(true);
    });

    it('takes a fixed duration over the distance', async () => {
      expect(await hasArrived(160, 100_000, { duration: 160 })).toBe(false);
    });

    it('is over soon after a fixed duration', async () => {
      expect(await hasArrived(224, 100_000, { duration: 160 })).toBe(true);
    });

    it('arrives on the first frame with a duration of 0', async () => {
      expect(await hasArrived(16, 100, { duration: 0 })).toBe(true);
    });
  });

  describe('replacing and cancelling', () => {
    it('resolves the first animation when a second one starts', async () => {
      const animator = createNodeAnimator({ duration: 160 });
      const first = vi.fn();
      animator.animate(toward(100)).then(first);

      animator.animate(toward(200));
      await vi.advanceTimersByTimeAsync(0);

      expect(first).toHaveBeenCalledOnce();
    });

    it('carries on from where the first animation was when a second one starts', async () => {
      const animator = createNodeAnimator({ duration: 96 });
      animator.animate(toward(100));
      await frames(4);

      animator.animate(toward(200));
      await frames(3);

      expect(at('a').point().x).toBeGreaterThan(50);
    });

    it('ends on the target of the second animation', async () => {
      const animator = createNodeAnimator({ duration: 96 });
      animator.animate(toward(100));
      await frames(2);
      animator.animate(toward(200));

      await frames(10);

      expect(at('a').point()).toEqual({ x: 200, y: 0 });
    });

    it('stops the nodes where they are on cancel', async () => {
      const animator = createNodeAnimator({ duration: 160 });
      animator.animate(toward(100));
      await frames(4);
      const stopped = at('a').point();

      animator.cancel();
      await frames(20);

      expect(at('a').point()).toEqual(stopped);
    });

    it('resolves the animation on cancel', async () => {
      const animator = createNodeAnimator({ duration: 160 });
      const done = vi.fn();
      animator.animate(toward(100)).then(done);
      await frames(2);

      animator.cancel();
      await vi.advanceTimersByTimeAsync(0);

      expect(done).toHaveBeenCalledOnce();
    });

    it('does nothing on cancel without an animation', () => {
      expect(() => createNodeAnimator().cancel()).not.toThrow();
    });
  });
});
