import { Rect, createEdges, createNodes } from 'ngx-vflow';
import { toLayoutGraph, toNodeSpaceTargets } from './layout-graph';

const rects: Record<string, Rect> = {
  a: { x: 0, y: 0, width: 100, height: 50 },
  group: { x: 400, y: 0, width: 300, height: 200 },
  c: { x: 420, y: 20, width: 100, height: 50 },
};
const rectOf = (id: string) => rects[id];

const nodes = createNodes([
  { id: 'a', point: { x: 0, y: 0 } },
  { id: 'unmeasured', point: { x: 0, y: 0 } },
  { id: 'group', point: { x: 400, y: 0 }, width: 300, height: 200 },
  { id: 'c', point: { x: 20, y: 20 }, parentId: 'group' },
]);
const edges = createEdges([
  { id: 'a-c', source: 'a', target: 'c' },
  { id: 'a-x', source: 'a', target: 'unmeasured' },
]);

describe('layout graph', () => {
  it('describes the measured nodes with their rectangles and parents, and the edges by their ends', () => {
    const graph = toLayoutGraph(nodes, edges, rectOf);

    expect(graph.nodes).toEqual([
      { id: 'a', parentId: null, x: 0, y: 0, width: 100, height: 50 },
      { id: 'group', parentId: null, x: 400, y: 0, width: 300, height: 200 },
      { id: 'c', parentId: 'group', x: 420, y: 20, width: 100, height: 50 },
    ]);
    expect(graph.edges).toEqual([
      { id: 'a-c', source: 'a', target: 'c' },
      { id: 'a-x', source: 'a', target: 'unmeasured' },
    ]);
  });

  it('turns flow-space positions into node space, relative to the laid-out or rendered parent, with the sizes', () => {
    const laidOutParent = toNodeSpaceTargets(
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
    expect(laidOutParent.get(nodes[2])).toEqual({ point: { x: 300, y: 300 }, size: { width: 320, height: 220 } });
    expect(laidOutParent.get(nodes[3])).toEqual({ point: { x: 150, y: 0 } });

    const renderedParent = toNodeSpaceTargets(
      { positions: new Map([['c', { x: 450, y: 100 }]]) },
      nodes,
      rectOf,
      new Set(),
    );
    expect(renderedParent.get(nodes[3])).toEqual({ point: { x: 50, y: 100 } });
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
