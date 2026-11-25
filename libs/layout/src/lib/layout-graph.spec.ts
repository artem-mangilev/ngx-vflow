import { Rect, createEdges, createNodes } from 'ngx-vflow';
import { toLayoutGraph, toNodeSpaceTargets } from './layout-graph';

const rects: Record<string, Rect> = {
  a: { x: 0, y: 0, width: 100, height: 50 },
  group: { x: 400, y: 0, width: 300, height: 200 },
  c: { x: 420, y: 20, width: 100, height: 50 },
  orphan: { x: 0, y: 100, width: 100, height: 50 },
};
const rectOf = (id: string) => rects[id];

const nodes = createNodes([
  { id: 'a', point: { x: 0, y: 0 } },
  { id: 'unmeasured', point: { x: 0, y: 0 } },
  { id: 'group', point: { x: 400, y: 0 }, width: 300, height: 200 },
  { id: 'c', point: { x: 20, y: 20 }, parentId: 'group' },
  { id: 'orphan', point: { x: 0, y: 100 }, parentId: 'unmeasured' },
]);
const edges = createEdges([
  { id: 'a-c', source: 'a', target: 'c' },
  { id: 'a-x', source: 'a', target: 'unmeasured' },
]);

describe('layout graph', () => {
  it('describes the measured nodes with their rectangles and parents', () => {
    const graph = toLayoutGraph(nodes, edges, rectOf);

    expect(graph.nodes).toEqual([
      { id: 'a', parentId: null, x: 0, y: 0, width: 100, height: 50 },
      { id: 'group', parentId: null, x: 400, y: 0, width: 300, height: 200 },
      { id: 'c', parentId: 'group', x: 420, y: 20, width: 100, height: 50 },
      // An unmeasured parent is no parent.
      { id: 'orphan', parentId: null, x: 0, y: 100, width: 100, height: 50 },
    ]);
  });

  it('leaves out an edge to an unmeasured node', () => {
    expect(toLayoutGraph(nodes, edges, rectOf).edges).toEqual([{ id: 'a-c', source: 'a', target: 'c' }]);
  });

  describe('node-space targets', () => {
    const laidOutParent = () =>
      toNodeSpaceTargets(
        {
          positions: new Map([
            ['group', { x: 300, y: 300 }],
            ['c', { x: 450, y: 300 }],
          ]),
          sizes: new Map([['group', { width: 320, height: 220 }]]),
        },
        nodes,
        rectOf,
        new Set(),
      );

    it('carries the position and the size of a parent the layout sized', () => {
      expect(laidOutParent().get(nodes[2])).toEqual({
        point: { x: 300, y: 300 },
        size: { width: 320, height: 220 },
      });
    });

    it('places a child relative to the laid-out position of its parent', () => {
      expect(laidOutParent().get(nodes[3])).toEqual({ point: { x: 150, y: 0 } });
    });

    it('places a child relative to the rendered position of a parent the layout left out', () => {
      const targets = toNodeSpaceTargets({ positions: new Map([['c', { x: 450, y: 100 }]]) }, nodes, rectOf, new Set());

      expect(targets.get(nodes[3])).toEqual({ point: { x: 50, y: 100 } });
    });
  });

  it('places a child of an unmeasured parent in flow space', () => {
    const targets = toNodeSpaceTargets({ positions: new Map([['orphan', { x: 7, y: 9 }]]) }, nodes, rectOf, new Set());

    expect(targets.get(nodes[4])).toEqual({ point: { x: 7, y: 9 } });
  });

  it('leaves out unknown and skipped nodes', () => {
    const targets = toNodeSpaceTargets(
      {
        positions: new Map([
          ['a', { x: 1, y: 1 }],
          ['missing', { x: 2, y: 2 }],
          ['group', { x: 3, y: 3 }],
        ]),
      },
      nodes,
      rectOf,
      new Set(['group']),
    );

    expect([...targets.keys()].map((node) => node.id)).toEqual(['a']);
  });
});
