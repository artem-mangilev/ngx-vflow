import { LayoutGraph } from '@vflow/layout';
import { layoutNode, once } from '../../../src/lib/layout.testing';
import { radialTreeLayout, treeLayout } from './tree-layout';

/** ceo → cto → dev, ops; ceo → cfo; plus a node without edges. Every node has its own size. */
function organization(): LayoutGraph {
  return {
    nodes: [
      layoutNode('ceo', null, 120, 50),
      layoutNode('cto'),
      layoutNode('cfo', null, 100, 80),
      layoutNode('dev', null, 200, 50),
      layoutNode('ops'),
      layoutNode('lone'),
    ],
    edges: [
      { id: '1', source: 'ceo', target: 'cto' },
      { id: '2', source: 'ceo', target: 'cfo' },
      { id: '3', source: 'cto', target: 'dev' },
      { id: '4', source: 'cto', target: 'ops' },
    ],
  };
}

describe('treeLayout', () => {
  const place = async (options = {}, graph = organization()) =>
    (await once(treeLayout({ nodeSpacing: 20, levelSpacing: 30, ...options }), graph)).positions;

  it('places every node', async () => {
    expect((await place()).size).toBe(6);
  });

  it('starts a level after the deepest node of the level before, plus the spacing', async () => {
    const positions = await place();

    expect([positions.get('cto')!.y, positions.get('dev')!.y]).toEqual([50 + 30, 50 + 30 + 80 + 30]);
  });

  it('puts siblings on the same level', async () => {
    const positions = await place();

    expect(positions.get('cfo')!.y).toBe(positions.get('cto')!.y);
  });

  it('keeps the spacing between the edges of neighbouring siblings', async () => {
    const positions = await place();

    expect(positions.get('ops')!.x - (positions.get('dev')!.x + 200)).toBeCloseTo(20);
  });

  it('centers a parent over its children', async () => {
    const positions = await place();
    const dev = positions.get('dev')!;
    const ops = positions.get('ops')!;

    expect(positions.get('cto')!.x + 50).toBeCloseTo((dev.x + 100 + ops.x + 50) / 2);
  });

  it('puts a node without edges on the level of the roots', async () => {
    const positions = await place();

    expect(positions.get('lone')!.y).toBe(positions.get('ceo')!.y);
  });

  it('puts a node without edges beside the tree', async () => {
    const positions = await place();

    expect(positions.get('lone')!.x).not.toBe(positions.get('ceo')!.x);
  });

  it('follows the first incoming edge of a node with two parents', async () => {
    const graph = organization();
    graph.edges.push({ id: 'second parent', source: 'cfo', target: 'dev' });

    const positions = await place({}, graph);

    expect(positions.get('dev')!.y).toBe(50 + 30 + 80 + 30);
    expect(positions.get('dev')!.x).toBeLessThan(positions.get('ops')!.x);
  });

  it('places every node of a cycle', async () => {
    const graph = organization();
    graph.edges.push({ id: 'back', source: 'dev', target: 'ceo' });

    expect((await place({}, graph)).size).toBe(6);
  });

  it('ignores a self-loop', async () => {
    const graph = organization();
    graph.edges.push({ id: 'loop', source: 'cto', target: 'cto' });

    expect(await place({}, graph)).toEqual(await place());
  });

  it('places nothing for an empty graph', async () => {
    expect([...(await place({}, { nodes: [], edges: [] }))]).toEqual([]);
  });

  it('places a graph without edges as separate roots on one level', async () => {
    const positions = await place({}, { nodes: [layoutNode('a'), layoutNode('b')], edges: [] });

    expect([positions.get('a')!.y, positions.get('b')!.y]).toEqual([0, 0]);
  });

  it('places the next level to the right going right, after the widest node of the level before', async () => {
    const positions = await place({ direction: 'right' });

    expect([positions.get('cto')!.x, positions.get('dev')!.x]).toEqual([120 + 30, 120 + 30 + 100 + 30]);
  });

  it('places the next level to the left going left', async () => {
    const positions = await place({ direction: 'left' });

    expect(positions.get('cto')!.x).toBe(-(120 + 30 + 100));
  });

  it('places the next level above going up, ending where the first level starts less the spacing', async () => {
    const positions = await place({ direction: 'up' });

    expect(positions.get('cto')!.y).toBe(-(50 + 30 + 50));
  });
});

describe('radialTreeLayout', () => {
  const star: LayoutGraph = {
    nodes: ['root', 'a', 'b', 'c', 'd'].map((id) => layoutNode(id, null, 40, 40)),
    edges: ['a', 'b', 'c', 'd'].map((id) => ({ id, source: 'root', target: id })),
  };

  async function centers(graph = star, options = { levelSpacing: 100, center: { x: 500, y: 500 } }) {
    const { positions } = await once(radialTreeLayout(options), graph);
    return new Map([...positions].map(([id, { x, y }]) => [id, { x: x + 20, y: y + 20 }]));
  }

  it('puts the root at the center', async () => {
    expect((await centers()).get('root')).toEqual({ x: 500, y: 500 });
  });

  it.each(['a', 'b', 'c', 'd'])('puts the child %s on the first ring', async (id) => {
    const { x, y } = (await centers()).get(id)!;

    expect(Math.hypot(x - 500, y - 500)).toBeCloseTo(100);
  });

  it('spreads the children over the whole circle', async () => {
    const all = await centers();
    const a = all.get('a')!;
    const d = all.get('d')!;

    expect(Math.hypot(a.x - d.x, a.y - d.y)).toBeGreaterThan(100);
  });

  it('puts a grandchild on the second ring', async () => {
    const all = await centers(
      {
        nodes: ['root', 'a', 'b'].map((id) => layoutNode(id, null, 40, 40)),
        edges: [
          { id: '1', source: 'root', target: 'a' },
          { id: '2', source: 'a', target: 'b' },
        ],
      },
      { levelSpacing: 100, center: { x: 0, y: 0 } },
    );
    const { x, y } = all.get('b')!;

    expect(Math.hypot(x, y)).toBeCloseTo(200);
  });

  it('shares the rings of a forest around an empty center', async () => {
    const all = await centers(
      { nodes: ['a', 'b'].map((id) => layoutNode(id, null, 40, 40)), edges: [] },
      { levelSpacing: 100, center: { x: 0, y: 0 } },
    );

    expect([...all.values()].map(({ x, y }) => Math.round(Math.hypot(x, y)))).toEqual([100, 100]);
  });

  it('places nothing for an empty graph', async () => {
    expect([...(await centers({ nodes: [], edges: [] })).keys()]).toEqual([]);
  });

  it('places every node of a cycle', async () => {
    const all = await centers({
      nodes: ['a', 'b'].map((id) => layoutNode(id, null, 40, 40)),
      edges: [
        { id: '1', source: 'a', target: 'b' },
        { id: '2', source: 'b', target: 'a' },
      ],
    });

    expect(all.size).toBe(2);
  });
});
