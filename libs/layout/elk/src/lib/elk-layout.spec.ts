import { LayoutResult } from '@vflow/layout';
import { isInside, layoutNode, once, sampleGraph } from '../../../src/lib/layout.testing';
import { ElkLayoutOptions, elkLayout } from './elk-layout';

/** The distances between a child of `group` and the four sides of the group. */
function offsets(result: LayoutResult, childId: string) {
  const child = result.positions.get(childId)!;
  const parent = result.positions.get('group')!;
  const size = result.sizes!.get('group')!;
  return {
    top: child.y - parent.y,
    left: child.x - parent.x,
    bottom: parent.y + size.height - (child.y + 50),
    right: parent.x + size.width - (child.x + 100),
  };
}

describe('elkLayout', () => {
  it('lays out every node of the graph', async () => {
    const result = await once(elkLayout(), sampleGraph());

    expect([...result.positions.keys()].sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'group']);
  });

  it('places the layers to the right of each other by default', async () => {
    const { positions } = await once(elkLayout(), sampleGraph());

    expect(positions.get('b')!.x).toBeGreaterThan(positions.get('a')!.x + 100);
  });

  it('places the layers below each other going down', async () => {
    const { positions } = await once(elkLayout({ direction: 'down' }), sampleGraph());

    expect(positions.get('b')!.y).toBeGreaterThan(positions.get('a')!.y + 50);
  });

  it('keeps the space between the nodes of a layer', async () => {
    const { positions } = await once(elkLayout({ nodeSpacing: 70 }), {
      nodes: [layoutNode('a'), layoutNode('b'), layoutNode('c')],
      edges: [
        { id: 'a-b', source: 'a', target: 'b' },
        { id: 'a-c', source: 'a', target: 'c' },
      ],
    });

    expect(Math.abs(positions.get('b')!.y - positions.get('c')!.y)).toBeGreaterThanOrEqual(50 + 70);
  });

  it.each(['d', 'e'])('returns the position of the child %s in flow space, inside the parent', async (child) => {
    expect(isInside(await once(elkLayout(), sampleGraph()), child, 'group')).toBe(true);
  });

  it('lays the children of a parent out in layers of their own', async () => {
    const { positions } = await once(elkLayout(), sampleGraph());

    expect(positions.get('e')!.x).toBeGreaterThan(positions.get('d')!.x + 100);
  });

  it('gives sizes only to the parents', async () => {
    const { sizes } = await once(elkLayout(), sampleGraph());

    expect([...sizes!.keys()]).toEqual(['group']);
  });

  describe('padding of a parent', () => {
    it('leaves room for a header at the top by default', async () => {
      expect(offsets(await once(elkLayout(), sampleGraph()), 'd').top).toBeGreaterThanOrEqual(40);
    });

    it.each(['left', 'right', 'bottom'] as const)('keeps 20 units on the %s side by default', async (side) => {
      const result = await once(elkLayout(), sampleGraph());

      expect(Math.min(offsets(result, 'd')[side], offsets(result, 'e')[side])).toBeGreaterThanOrEqual(20);
    });

    it.each([
      ['top', 64],
      ['left', 32],
    ] as const)('takes the %s side it is given', async (side, value) => {
      const result = await once(elkLayout({ padding: { top: 64, left: 32 } }), sampleGraph());

      expect(offsets(result, 'd')[side]).toBeGreaterThanOrEqual(value);
    });

    it('keeps the default of the sides it is not given', async () => {
      const result = await once(elkLayout({ padding: { top: 64, left: 32 } }), sampleGraph());

      expect(offsets(result, 'e').right).toBeGreaterThanOrEqual(20);
    });

    it('takes one value for every side', async () => {
      const result = await once(elkLayout({ padding: 8 }), sampleGraph());

      expect(offsets(result, 'd').top).toBeLessThan(40);
    });
  });

  it('spaces the layers inside a parent like the layers of the root', async () => {
    const { positions } = await once(elkLayout({ layerSpacing: 90 }), sampleGraph());

    expect(positions.get('e')!.x - (positions.get('d')!.x + 100)).toBeGreaterThanOrEqual(90);
  });

  it('lays out an empty graph without positions', async () => {
    const result = await once(elkLayout(), { nodes: [], edges: [] });

    expect([...result.positions]).toEqual([]);
  });

  it('places every node of a cycle', async () => {
    const { positions } = await once(elkLayout(), {
      nodes: [layoutNode('a'), layoutNode('b'), layoutNode('c')],
      edges: [
        { id: 'a-b', source: 'a', target: 'b' },
        { id: 'b-c', source: 'b', target: 'c' },
        { id: 'c-a', source: 'c', target: 'a' },
      ],
    });

    expect(new Set([...positions.values()].map((point) => point.x)).size).toBeGreaterThanOrEqual(2);
  });

  it('lays out a tree with the mrtree algorithm', async () => {
    const { positions } = await once(elkLayout({ algorithm: 'mrtree', direction: 'down' }), {
      nodes: [layoutNode('root'), layoutNode('left'), layoutNode('right')],
      edges: [
        { id: '1', source: 'root', target: 'left' },
        { id: '2', source: 'root', target: 'right' },
      ],
    });

    expect(positions.get('left')!.y).toBeGreaterThan(positions.get('root')!.y);
  });

  it.each<[string, ElkLayoutOptions]>([
    ['edgeNodeSpacing', { edgeNodeSpacing: 30 }],
    ['nodePlacement', { nodePlacement: 'simple' }],
    ['edgeRouting', { edgeRouting: 'polyline' }],
    ['separateConnectedComponents', { separateConnectedComponents: false }],
    ['aspectRatio', { aspectRatio: 2 }],
  ])('accepts the option %s and still places every node', async (_name, options) => {
    const { positions } = await once(elkLayout(options), sampleGraph());

    expect(positions.size).toBe(6);
  });
});
