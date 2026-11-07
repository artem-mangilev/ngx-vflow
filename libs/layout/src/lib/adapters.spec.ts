import { firstValueFrom, isObservable, lastValueFrom, take, toArray } from 'rxjs';
import { dagreLayout } from '@vflow/layout/dagre';
import { elkLayout } from '@vflow/layout/elk';
import { forceLayout } from '@vflow/layout/d3-force';
import { LayoutAlgorithm, LayoutGraph, LayoutResult } from './layout.types';

/** The result of a one-shot algorithm. */
async function once(algorithm: LayoutAlgorithm, graph: LayoutGraph): Promise<LayoutResult> {
  const produced = algorithm(graph);
  if (isObservable(produced)) throw new Error('expected a one-shot layout');
  return produced;
}

function graph(): LayoutGraph {
  const node = (id: string, parentId: string | null = null, width = 100, height = 50) => ({
    id,
    parentId,
    width,
    height,
    x: 0,
    y: 0,
  });
  return {
    nodes: [node('a'), node('b'), node('c'), node('group', null, 300, 200), node('d', 'group'), node('e', 'group')],
    edges: [
      { id: 'a-b', source: 'a', target: 'b' },
      { id: 'a-c', source: 'a', target: 'c' },
      { id: 'b-d', source: 'b', target: 'd' },
      { id: 'd-e', source: 'd', target: 'e' },
      { id: 'loop', source: 'c', target: 'c' },
      { id: 'dangling', source: 'c', target: 'missing' },
    ],
  };
}

function inside(result: LayoutResult, childId: string, parentId: string, childWidth = 100, childHeight = 50) {
  const child = result.positions.get(childId)!;
  const parent = result.positions.get(parentId)!;
  const size = result.sizes!.get(parentId)!;
  return (
    child.x >= parent.x &&
    child.y >= parent.y &&
    child.x + childWidth <= parent.x + size.width &&
    child.y + childHeight <= parent.y + size.height
  );
}

describe('layout adapters', () => {
  it('dagre ranks the graph in the given direction and sizes the parents around their children', async () => {
    const lr = await once(dagreLayout({ rankdir: 'LR', ranksep: 80 }), graph());
    const a = lr.positions.get('a')!;
    const b = lr.positions.get('b')!;
    const c = lr.positions.get('c')!;
    expect(b.x).toBeGreaterThanOrEqual(a.x + 100 + 80);
    expect(c.x).toBe(b.x);
    expect(c.y).not.toBe(b.y);
    expect(inside(lr, 'd', 'group')).toBe(true);
    expect(inside(lr, 'e', 'group')).toBe(true);
    expect(lr.sizes!.has('a')).toBe(false);

    const tb = await once(dagreLayout(), graph());
    expect(tb.positions.get('b')!.y).toBeGreaterThan(tb.positions.get('a')!.y + 50);
    expect(tb.positions.get('e')!.y).toBeGreaterThan(tb.positions.get('d')!.y + 50);
  });

  it('elk lays the graph out in the main thread with absolute positions for nested nodes', async () => {
    const result = await once(elkLayout({ direction: 'right', nodeSpacing: 30, padding: 24 }), graph());
    expect(result.positions.size).toBe(6);
    const a = result.positions.get('a')!;
    const b = result.positions.get('b')!;
    expect(b.x).toBeGreaterThan(a.x + 100);
    expect(inside(result, 'd', 'group')).toBe(true);
    expect(inside(result, 'e', 'group')).toBe(true);
    expect(result.positions.get('e')!.x).toBeGreaterThan(result.positions.get('d')!.x + 100);
  });

  it('force emits the positions on every tick, stops on unsubscribe and completes when it settles', async () => {
    const produced = forceLayout({ linkDistance: 60, alphaDecay: 0.2 })(graph());
    expect(isObservable(produced)).toBe(true);
    if (!isObservable(produced)) return;

    const first = await firstValueFrom(produced);
    expect(first.positions.size).toBe(6);
    const ticks = await lastValueFrom(produced.pipe(take(3), toArray()));
    expect(ticks).toHaveLength(3);
    expect(ticks[2].positions.get('a')).not.toEqual(ticks[0].positions.get('a'));

    const settled = await lastValueFrom(produced);
    const a = settled.positions.get('a')!;
    const b = settled.positions.get('b')!;
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(30);
  });
});
