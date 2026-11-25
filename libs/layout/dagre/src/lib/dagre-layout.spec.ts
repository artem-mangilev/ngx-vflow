import { LayoutResult } from '@vflow/layout';
import { isInside, layoutNode, once, sampleGraph } from '../../../src/lib/layout.testing';
import { dagreLayout } from './dagre-layout';

type Box = { x: number; y: number; width: number; height: number };

describe('dagreLayout', () => {
  it('ranks the graph from top to bottom by default', async () => {
    const result = await once(dagreLayout(), sampleGraph());

    expect(result.positions.get('b')!.y).toBeGreaterThan(result.positions.get('a')!.y + 50);
  });

  it('ranks the nodes of a parent from top to bottom as well', async () => {
    const result = await once(dagreLayout(), sampleGraph());

    expect(result.positions.get('e')!.y).toBeGreaterThan(result.positions.get('d')!.y + 50);
  });

  it('ranks the graph from left to right with the space between the ranks', async () => {
    const result = await once(dagreLayout({ rankdir: 'LR', ranksep: 80 }), sampleGraph());

    expect(result.positions.get('b')!.x).toBeGreaterThanOrEqual(result.positions.get('a')!.x + 100 + 80);
  });

  it('puts the nodes of one rank in a line, apart from each other', async () => {
    const { positions } = await once(dagreLayout({ rankdir: 'LR' }), sampleGraph());

    expect(positions.get('c')!.x).toBe(positions.get('b')!.x);
    expect(positions.get('c')!.y).not.toBe(positions.get('b')!.y);
  });

  it.each(['d', 'e'])('sizes the parent around the child %s', async (child) => {
    expect(isInside(await once(dagreLayout(), sampleGraph()), child, 'group')).toBe(true);
  });

  it('gives no size to a node without children', async () => {
    const { sizes } = await once(dagreLayout(), sampleGraph());

    expect(sizes!.has('a')).toBe(false);
  });

  it.each(['x', 'y'] as const)(
    'keeps the padding between the children and the %s side of their parent',
    async (axis) => {
      const { positions } = await once(dagreLayout({ padding: 30 }), sampleGraph());

      expect(positions.get('d')![axis] - positions.get('group')![axis]).toBeGreaterThanOrEqual(30);
    },
  );

  it('lays out every node of a graph with edges to and from a parent', async () => {
    const graph = sampleGraph();
    graph.edges.push({ id: 'a-group', source: 'a', target: 'group' }, { id: 'd-group', source: 'd', target: 'group' });

    expect((await once(dagreLayout(), graph)).positions.size).toBe(6);
  });

  it('keeps the children of a parent inside it when edges touch the parent', async () => {
    const graph = sampleGraph();
    graph.edges.push({ id: 'a-group', source: 'a', target: 'group' });

    expect(isInside(await once(dagreLayout(), graph), 'd', 'group')).toBe(true);
  });

  describe('neighbouring parents', () => {
    const box = (result: LayoutResult, id: string): Box => ({
      ...result.positions.get(id)!,
      ...result.sizes!.get(id)!,
    });
    const apart = (a: Box, b: Box) =>
      a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;

    it.each([20, 40, 80])('keeps sibling parents from overlapping with a padding of %s', async (padding) => {
      const result = await once(dagreLayout({ padding }), {
        nodes: [layoutNode('root'), layoutNode('g1'), layoutNode('g2'), layoutNode('a', 'g1'), layoutNode('b', 'g2')],
        edges: [
          { id: 'root-a', source: 'root', target: 'a' },
          { id: 'root-b', source: 'root', target: 'b' },
        ],
      });

      expect(apart(box(result, 'g1'), box(result, 'g2'))).toBe(true);
    });

    it.each([20, 40, 80])('keeps stacked parents from overlapping with a padding of %s', async (padding) => {
      const result = await once(dagreLayout({ padding }), {
        nodes: [layoutNode('g1'), layoutNode('g2'), layoutNode('a', 'g1'), layoutNode('b', 'g2')],
        edges: [{ id: 'a-b', source: 'a', target: 'b' }],
      });

      expect(apart(box(result, 'g1'), box(result, 'g2'))).toBe(true);
    });
  });

  it('lays out an empty graph without positions', async () => {
    const result = await once(dagreLayout(), { nodes: [], edges: [] });

    expect([...result.positions]).toEqual([]);
  });

  it('places a graph without edges, every node apart', async () => {
    const { positions } = await once(dagreLayout(), {
      nodes: [layoutNode('a'), layoutNode('b')],
      edges: [],
    });

    expect(positions.get('a')).not.toEqual(positions.get('b'));
  });

  it('breaks a cycle and still places every node on its own rank', async () => {
    const { positions } = await once(dagreLayout(), {
      nodes: [layoutNode('a'), layoutNode('b'), layoutNode('c')],
      edges: [
        { id: 'a-b', source: 'a', target: 'b' },
        { id: 'b-c', source: 'b', target: 'c' },
        { id: 'c-a', source: 'c', target: 'a' },
      ],
    });

    expect(new Set([...positions.values()].map((point) => point.y)).size).toBe(3);
  });
});
