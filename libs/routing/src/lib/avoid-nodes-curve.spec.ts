import { createEdge, CurveFactoryParams, getSmoothStepPath, NodeGeometry, Point, Position, Rect } from 'ngx-vflow';
import { avoidNodesCurve, createAvoidNodesCurve } from './avoid-nodes-curve';
import type { CurveFactory } from 'ngx-vflow';

function geometry(
  id: string,
  x: number,
  y: number,
  width = 100,
  height = 50,
  parentId: string | null = null,
): NodeGeometry {
  return { id, parentId, x, y, width, height };
}

/** Handles at the middle of the right side of the source and the left side of the target. */
function edgeParams(
  source: NodeGeometry,
  target: NodeGeometry,
  nodeGeometries: NodeGeometry[],
  positions: [Position, Position] = ['right', 'left'],
): CurveFactoryParams {
  return {
    mode: 'edge',
    edge: createEdge({ id: `${source.id}-${target.id}`, source: source.id, target: target.id }),
    sourcePoint: handlePoint(source, positions[0]),
    targetPoint: handlePoint(target, positions[1]),
    sourcePosition: positions[0],
    targetPosition: positions[1],
    markerInset: { start: 0, end: 0 },
    sourceNode: source,
    targetNode: target,
    allEdges: [],
    allNodes: [],
    nodeGeometries,
  };
}

function handlePoint(node: Rect, position: Position): Point {
  switch (position) {
    case 'left':
      return { x: node.x, y: node.y + node.height / 2 };
    case 'right':
      return { x: node.x + node.width, y: node.y + node.height / 2 };
    case 'top':
      return { x: node.x + node.width / 2, y: node.y };
    case 'bottom':
      return { x: node.x + node.width / 2, y: node.y + node.height };
  }
}

/** Every point of the path: the ends of its segments and the control points of its corners. */
function pathPoints(d: string): Point[] {
  const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const points: Point[] = [];
  for (let i = 0; i < numbers.length; i += 2) points.push({ x: numbers[i], y: numbers[i + 1] });
  return points;
}

function segmentCrosses(a: Point, b: Point, rect: Rect): boolean {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return maxX > rect.x && minX < rect.x + rect.width && maxY > rect.y && minY < rect.y + rect.height;
}

function crosses(d: string, rect: Rect): boolean {
  const points = pathPoints(d);
  return points.some((point, i) => i > 0 && segmentCrosses(points[i - 1], point, rect));
}

describe('avoidNodesCurve', () => {
  const source = geometry('source', 0, 100);
  const target = geometry('target', 500, 100);
  const between = geometry('between', 250, 75);

  it('draws a straight orthogonal path when nothing is in the way', () => {
    const layout = avoidNodesCurve(edgeParams(source, target, [source, target]));

    expect(layout.path).toBe('M 100 125 L 500 125');
    expect(layout.bounds).toEqual({ x: 100, y: 125, width: 400, height: 0 });
    expect(layout.labelPoints).toEqual({
      start: { x: 160, y: 125, angle: 0 },
      center: { x: 300, y: 125, angle: 0 },
      end: { x: 440, y: 125, angle: 0 },
    });
  });

  it('routes around a node between the ends with orthogonal segments and rounded corners', () => {
    const layout = avoidNodesCurve(edgeParams(source, target, [source, between, target]));

    expect(crosses(layout.path, between)).toBe(false);
    expect(layout.path).toMatch(/^M 100 125 L 2\d\d 125 Q /);
    expect(layout.path).toMatch(/L 500 125$/);
    const points = pathPoints(layout.path);
    for (let i = 1; i < points.length; i++) {
      expect(points[i].x === points[i - 1].x || points[i].y === points[i - 1].y).toBe(true);
    }
    const bounds = layout.bounds!;
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(bounds.x);
      expect(point.x).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(point.y).toBeGreaterThanOrEqual(bounds.y);
      expect(point.y).toBeLessThanOrEqual(bounds.y + bounds.height);
    }
  });

  it('leaves the nodes of the edge and their ancestors out of the obstacles', () => {
    const group = geometry('group', -50, 0, 700, 300);
    const innerSource = geometry('a', 0, 100, 100, 50, 'group');
    const innerTarget = geometry('b', 500, 100, 100, 50, 'group');
    const layout = avoidNodesCurve(edgeParams(innerSource, innerTarget, [group, innerSource, innerTarget]));

    // The edge runs inside its parent instead of around it.
    expect(layout.path).toBe('M 100 125 L 500 125');
  });

  it('skips the nodes an isObstacle option declines', () => {
    const curve = createAvoidNodesCurve({ isObstacle: (node) => node.id !== 'between' });

    expect(curve(edgeParams(source, target, [source, between, target])).path).toBe('M 100 125 L 500 125');
  });

  it('routes a connection preview without a target node', () => {
    const params = edgeParams(source, target, [source, between, target]);
    const layout = avoidNodesCurve({ ...params, mode: 'connection', edge: undefined, targetNode: undefined } as never);

    expect(crosses(layout.path, between)).toBe(false);
    expect(layout.path).toMatch(/L 500 125$/);
  });

  it('keeps the path out of the nodes of the edge, so a handle facing away is reached around its node', () => {
    const below = geometry('below', 60, 190);
    const layout = avoidNodesCurve(edgeParams(source, below, [source, below]));

    expect(crosses(layout.path, below)).toBe(false);
    expect(crosses(layout.path, source)).toBe(false);
    expect(layout.path).toMatch(/L 60 215$/);
  });

  it('shortens the exit when a neighbour sits closer to a handle than the usual approach', () => {
    const neighbour = geometry('neighbour', 110, 90);
    const layout = avoidNodesCurve(edgeParams(source, target, [source, neighbour, target]));

    expect(crosses(layout.path, neighbour)).toBe(false);
    // The exit is shorter than the usual approach but still leaves the handle straight.
    expect(layout.path).toMatch(/^M 100 125 L 10[2-9](\.\d+)? 125 Q /);
  });

  it('falls back to a smooth step between overlapping nodes', () => {
    const overlapping = geometry('overlapping', 60, 120);
    const layout = avoidNodesCurve(edgeParams(source, overlapping, [source, overlapping]));

    expect(layout.path).toBe(
      getSmoothStepPath({
        sourcePoint: { x: 100, y: 125 },
        targetPoint: { x: 60, y: 145 },
        sourcePosition: 'right',
        targetPosition: 'left',
        borderRadius: 8,
      }).path,
    );
  });

  it('keeps the route of an edge while a node jitters, and changes it once another route is much shorter', () => {
    const edge = createEdge({ id: 'a-b', source: 'source', target: 'target' });
    const at = (curve: CurveFactory, y: number) => {
      const params = edgeParams(source, target, [source, geometry('between', 250, y), target]);
      return pathPoints(curve({ ...params, edge })!.path);
    };
    const above = (points: Point[]) => points[Math.floor(points.length / 2)].y < 125;

    const steady = createAvoidNodesCurve();
    const first = above(at(steady, 99));
    for (const y of [101, 99, 101, 99]) expect(above(at(steady, y))).toBe(first);
    // With the node well across the line the other side is much shorter: the route follows.
    expect(above(at(steady, first ? 80 : 120))).toBe(!first);

    const restless = createAvoidNodesCurve({ inertia: 0 });
    expect(above(at(restless, 99))).not.toBe(above(at(restless, 101)));
  });

  it('keeps the clearance and the corner radius configurable', () => {
    const sharp = createAvoidNodesCurve({ cornerRadius: 0 })(edgeParams(source, target, [source, between, target]));
    expect(sharp.path).not.toContain('Q');

    const wide = createAvoidNodesCurve({ nodePadding: 40 })(edgeParams(source, target, [source, between, target]));
    const padded = { x: between.x - 30, y: between.y - 30, width: between.width + 60, height: between.height + 60 };
    expect(crosses(wide.path, padded)).toBe(false);
  });

  it('routes a column of nodes in bounded time', () => {
    const nodes: NodeGeometry[] = [];
    for (let row = 0; row < 20; row++) {
      for (let column = 0; column < 10; column++) {
        nodes.push(geometry(`${row}-${column}`, column * 180, row * 120));
      }
    }
    const started = performance.now();
    let edges = 0;
    for (let row = 0; row < 20; row++) {
      for (let column = 0; column < 9; column++) {
        // Two columns over: the edge has to route around the node between.
        const from = nodes[row * 10 + column];
        const to = nodes[row * 10 + Math.min(column + 2, 9)];
        if (from === to) continue;
        avoidNodesCurve(edgeParams(from, to, nodes));
        edges++;
      }
    }
    const elapsed = performance.now() - started;

    expect(edges).toBe(180);
    console.info(`avoidNodesCurve: ${(elapsed / edges).toFixed(2)} ms per edge over 200 nodes`);
    // About 1 ms per edge on a laptop: a full relayout of a few hundred edges stays within a frame or two.
    expect(elapsed / edges).toBeLessThan(10);
  });
});
