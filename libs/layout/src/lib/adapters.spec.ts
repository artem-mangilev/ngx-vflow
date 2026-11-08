import { Subject, lastValueFrom } from 'rxjs';
import { dagreLayout } from '@vflow/layout/dagre';
import { elkLayout } from '@vflow/layout/elk';
import { forceLayout } from '@vflow/layout/d3-force';
import { radialTreeLayout, treeLayout } from '@vflow/layout/d3-hierarchy';
import { LayoutAlgorithm, LayoutDragEvent, LayoutGraph, LayoutResult } from './layout.types';

/** The result of a one-shot algorithm. */
function once(algorithm: LayoutAlgorithm, graph: LayoutGraph): Promise<LayoutResult> {
  return lastValueFrom(algorithm(graph, { drags: new Subject<LayoutDragEvent>() }));
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
    // The padding keeps the children off the sides of their parent.
    expect(lr.positions.get('d')!.x - lr.positions.get('group')!.x).toBeGreaterThanOrEqual(20);
    expect(lr.positions.get('d')!.y - lr.positions.get('group')!.y).toBeGreaterThanOrEqual(20);

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

  it('force emits the positions on every tick, pins a dragged node and stops on unsubscribe', async () => {
    const drags = new Subject<LayoutDragEvent>();
    // alphaDecay 0.5 settles the simulation within about ten ticks.
    const produced = forceLayout({ linkDistance: 60, alphaDecay: 0.5 })(graph(), { drags });

    const ticks: LayoutResult[] = [];
    const subscription = produced.subscribe((result) => ticks.push(result));
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(ticks.length).toBeGreaterThan(2);
    expect(ticks[0].positions.size).toBe(6);
    expect(ticks.at(-1)!.positions.get('a')).not.toEqual(ticks[0].positions.get('a'));
    // The simulation has settled: no more ticks, but no completion either.
    const settled = ticks.length;
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(ticks.length).toBe(settled);
    expect(subscription.closed).toBe(false);

    // A drag pins the node at the pointer and warms the simulation up again.
    const dragged = { id: 'a', parentId: null, width: 100, height: 50, x: 700, y: 700 };
    drags.next({ type: 'start', nodes: [dragged] });
    drags.next({ type: 'move', nodes: [dragged] });
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(ticks.length).toBeGreaterThan(settled);
    expect(ticks.at(-1)!.positions.get('a')).toEqual({ x: 700, y: 700 });
    drags.next({ type: 'end', nodes: [dragged] });

    subscription.unsubscribe();
    const afterUnsubscribe = ticks.length;
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(ticks.length).toBe(afterUnsubscribe);
  });

  it('tree places children under their parent, level by level, each node with its own size', async () => {
    const org = (): LayoutGraph => ({
      nodes: [
        { id: 'ceo', parentId: null, width: 120, height: 50, x: 0, y: 0 },
        { id: 'cto', parentId: null, width: 100, height: 50, x: 0, y: 0 },
        { id: 'cfo', parentId: null, width: 100, height: 80, x: 0, y: 0 },
        { id: 'dev', parentId: null, width: 200, height: 50, x: 0, y: 0 },
        { id: 'ops', parentId: null, width: 100, height: 50, x: 0, y: 0 },
        { id: 'lone', parentId: null, width: 100, height: 50, x: 0, y: 0 },
      ],
      edges: [
        { id: '1', source: 'ceo', target: 'cto' },
        { id: '2', source: 'ceo', target: 'cfo' },
        { id: '3', source: 'cto', target: 'dev' },
        { id: '4', source: 'cto', target: 'ops' },
        // A second parent and a cycle change nothing: the first incoming edge is the one that counts.
        { id: '5', source: 'cfo', target: 'dev' },
        { id: '6', source: 'dev', target: 'ceo' },
      ],
    });
    const down = await once(treeLayout({ nodeSpacing: 20, levelSpacing: 30 }), org());
    const at = (id: string) => down.positions.get(id)!;
    expect(down.positions.size).toBe(6);
    // Levels start after the deepest node of the level before, plus the spacing.
    expect(at('cto').y).toBe(50 + 30);
    expect(at('cfo').y).toBe(at('cto').y);
    expect(at('dev').y).toBe(50 + 30 + 80 + 30);
    // Siblings keep the spacing between their edges, and a parent is centered over its children.
    expect(at('ops').x - (at('dev').x + 200)).toBeCloseTo(20);
    expect(at('cto').x + 50).toBeCloseTo((at('dev').x + 100 + at('ops').x + 50) / 2);
    // A lone node is a root of its own, beside the tree.
    expect(at('lone').y).toBe(at('ceo').y);
    expect(at('lone').x).not.toBe(at('ceo').x);

    const right = await once(treeLayout({ direction: 'right', levelSpacing: 30 }), org());
    expect(right.positions.get('cto')!.x).toBe(120 + 30);
    expect(right.positions.get('dev')!.x).toBe(120 + 30 + 100 + 30);
    const up = await once(treeLayout({ direction: 'up', levelSpacing: 30 }), org());
    // Upwards the second level ends where the first one starts, less the spacing.
    expect(up.positions.get('cto')!.y).toBe(-(50 + 30 + 50));
  });

  it('radial tree puts the root at the center and the levels on rings around it', async () => {
    const star: LayoutGraph = {
      nodes: ['root', 'a', 'b', 'c', 'd'].map((id) => ({ id, parentId: null, width: 40, height: 40, x: 0, y: 0 })),
      edges: ['a', 'b', 'c', 'd'].map((id) => ({ id, source: 'root', target: id })),
    };
    const result = await once(radialTreeLayout({ levelSpacing: 100, center: { x: 500, y: 500 } }), star);
    const centerOf = (id: string) => {
      const { x, y } = result.positions.get(id)!;
      return { x: x + 20, y: y + 20 };
    };
    expect(centerOf('root')).toEqual({ x: 500, y: 500 });
    for (const id of ['a', 'b', 'c', 'd']) {
      const { x, y } = centerOf(id);
      expect(Math.hypot(x - 500, y - 500)).toBeCloseTo(100);
    }
    // Four children a quarter turn apart: the first and the last are not on top of each other.
    const a = centerOf('a');
    const d = centerOf('d');
    expect(Math.hypot(a.x - d.x, a.y - d.y)).toBeGreaterThan(100);
  });
});
