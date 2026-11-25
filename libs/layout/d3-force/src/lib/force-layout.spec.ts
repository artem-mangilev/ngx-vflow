import { LayoutDragEvent, LayoutResult } from '@vflow/layout';
import { Subject, Subscription } from 'rxjs';
import { layoutNode, sampleGraph } from '../../../src/lib/layout.testing';
import { ForceLayoutOptions, forceLayout } from './force-layout';

describe('forceLayout', () => {
  const drags = new Subject<LayoutDragEvent>();
  const ticks: LayoutResult[] = [];
  let completed = false;
  let subscription: Subscription;

  /** Starts the layout; `alphaDecay: 1` makes the simulation settle after its first tick. */
  function run(options: ForceLayoutOptions = { alphaDecay: 1 }, graph = sampleGraph()) {
    subscription = forceLayout(options)(graph, { drags }).subscribe({
      next: (result) => ticks.push(result),
      complete: () => (completed = true),
    });
  }

  const waitForTicks = (count: number) => vi.waitFor(() => expect(ticks.length).toBeGreaterThanOrEqual(count));
  const lastPositionOf = (id: string) => ticks.at(-1)!.positions.get(id);
  const dragged = (id: string, x: number, y: number) => ({ ...layoutNode(id), x, y });

  beforeEach(() => {
    ticks.length = 0;
    completed = false;
  });

  afterEach(() => subscription.unsubscribe());

  it('emits the position of every node on a tick', async () => {
    run();
    await waitForTicks(1);

    expect([...ticks[0].positions.keys()].sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'group']);
  });

  it('moves the nodes apart from where they start', async () => {
    run({ alphaDecay: 0.5 });
    await waitForTicks(3);

    expect(ticks.at(-1)!.positions.get('a')).not.toEqual(ticks[0].positions.get('a'));
  });

  it('does not complete when the simulation settles', async () => {
    run();
    await waitForTicks(1);
    drags.next({ type: 'start', nodes: [dragged('a', 0, 0)] });
    await waitForTicks(2);

    expect(completed).toBe(false);
  });

  it('emits positions of the nodes of a graph with a cycle', async () => {
    run(undefined, {
      nodes: [layoutNode('a'), layoutNode('b')],
      edges: [
        { id: 'a-b', source: 'a', target: 'b' },
        { id: 'b-a', source: 'b', target: 'a' },
      ],
    });
    await waitForTicks(1);

    expect(ticks[0].positions.size).toBe(2);
  });

  it('emits an empty result for an empty graph', async () => {
    run(undefined, { nodes: [], edges: [] });
    await waitForTicks(1);

    expect(ticks[0].positions.size).toBe(0);
  });

  it('emits positions with collision turned off', async () => {
    run({ alphaDecay: 1, collide: false });
    await waitForTicks(1);

    expect(ticks[0].positions.size).toBe(6);
  });

  it('gathers the nodes around the center', async () => {
    run({ alphaDecay: 0.1, center: { x: 1000, y: 1000 } });
    await waitForTicks(20);
    const centers = [...ticks.at(-1)!.positions.values()].map((point) => ({ x: point.x + 50, y: point.y + 25 }));
    const mean = {
      x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
      y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
    };

    expect(Math.hypot(mean.x - 1000, mean.y - 1000)).toBeLessThan(100);
  });

  describe('dragging a node', () => {
    it('warms the settled simulation up again', async () => {
      run();
      await waitForTicks(1);
      const settled = ticks.length;

      drags.next({ type: 'start', nodes: [dragged('a', 700, 700)] });

      await waitForTicks(settled + 1);
    });

    it('pins the node where the pointer puts it', async () => {
      run();
      await waitForTicks(1);

      drags.next({ type: 'start', nodes: [dragged('a', 700, 700)] });
      drags.next({ type: 'move', nodes: [dragged('a', 700, 700)] });

      await vi.waitFor(() => expect(lastPositionOf('a')).toEqual({ x: 700, y: 700 }));
    });

    it('follows the pointer while the node moves', async () => {
      run();
      await waitForTicks(1);

      drags.next({ type: 'start', nodes: [dragged('a', 700, 700)] });
      drags.next({ type: 'move', nodes: [dragged('a', 900, 650)] });

      await vi.waitFor(() => expect(lastPositionOf('a')).toEqual({ x: 900, y: 650 }));
    });

    it('lets the node go when the drag ends', async () => {
      run({ alphaDecay: 0.05 });
      await waitForTicks(1);
      drags.next({ type: 'start', nodes: [dragged('a', 700, 700)] });
      await vi.waitFor(() => expect(lastPositionOf('a')).toEqual({ x: 700, y: 700 }));

      drags.next({ type: 'end', nodes: [dragged('a', 700, 700)] });

      await vi.waitFor(() => expect(lastPositionOf('a')).not.toEqual({ x: 700, y: 700 }));
    });

    it('ignores a node the graph does not have', async () => {
      run();
      await waitForTicks(1);

      drags.next({ type: 'start', nodes: [dragged('unknown', 5, 5)] });
      await waitForTicks(2);

      expect(lastPositionOf('unknown')).toBeUndefined();
    });
  });

  it('stops listening to drags on unsubscribe', () => {
    run();

    subscription.unsubscribe();

    expect(drags.observed).toBe(false);
  });

  it('stops emitting on unsubscribe', async () => {
    run({ alphaDecay: 0.01 });
    await waitForTicks(2);

    subscription.unsubscribe();
    const emitted = ticks.length;
    for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);

    expect(ticks.length).toBe(emitted);
  });
});
