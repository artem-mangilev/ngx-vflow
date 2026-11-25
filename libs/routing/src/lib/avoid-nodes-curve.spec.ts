import {
  ConnectionCurveFactoryParams,
  createEdge,
  EdgeCurveFactoryParams,
  getSmoothStepPath,
  NodeGeometry,
  Point,
  Position,
  Rect,
} from 'ngx-vflow';
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
): EdgeCurveFactoryParams {
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

/** The straight `L` segments of a path that are neither horizontal nor vertical. */
function diagonalLines(d: string): string[] {
  const diagonal: string[] = [];
  let current: Point = { x: 0, y: 0 };
  for (const [, command, args] of d.matchAll(/([MLQ])((?:\s+-?\d+(?:\.\d+)?)+)/g)) {
    const numbers = args.trim().split(/\s+/).map(Number);
    const end = { x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] };
    if (command === 'L' && end.x !== current.x && end.y !== current.y)
      diagonal.push(`${current.x} ${current.y} L ${end.x} ${end.y}`);
    current = end;
  }
  return diagonal;
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
    expect(avoidNodesCurve(edgeParams(source, target, [source, target])).path).toBe('M 100 125 L 500 125');
  });

  it('reports the bounds of a straight path', () => {
    expect(avoidNodesCurve(edgeParams(source, target, [source, target])).bounds).toEqual({
      x: 100,
      y: 125,
      width: 400,
      height: 0,
    });
  });

  it('places label points along a straight path', () => {
    const layout = avoidNodesCurve(edgeParams(source, target, [source, target]));

    expect(layout.labelPoints).toEqual({
      start: { x: 160, y: 125, angle: 0 },
      center: { x: 300, y: 125, angle: 0 },
      end: { x: 440, y: 125, angle: 0 },
    });
  });

  it('routes around a node between the ends, leaving and entering the handles straight', () => {
    const layout = avoidNodesCurve(edgeParams(source, target, [source, between, target]));

    expect(crosses(layout.path, between)).toBe(false);
    expect(layout.path).toMatch(/^M 100 125 L 2\d\d 125 Q /);
    expect(layout.path).toMatch(/L 500 125$/);
  });

  it('keeps the segments of a routed path orthogonal', () => {
    const { path } = avoidNodesCurve(edgeParams(source, target, [source, between, target]));

    expect(diagonalLines(path)).toEqual([]);
  });

  it('reports bounds that contain every point of a routed path', () => {
    const layout = avoidNodesCurve(edgeParams(source, target, [source, between, target]));
    const { x, y, width, height } = layout.bounds!;
    const outside = pathPoints(layout.path).filter(
      (point) => point.x < x || point.x > x + width || point.y < y || point.y > y + height,
    );

    expect(outside).toEqual([]);
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

  it('ignores the nodes far from the edge', () => {
    const far = Array.from({ length: 1000 }, (_, index) => geometry(`far-${index}`, 5000 + index * 150, 5000));
    const curve = createAvoidNodesCurve();

    expect(curve(edgeParams(source, target, [source, between, target, ...far])).path).toBe(
      curve(edgeParams(source, target, [source, between, target])).path,
    );
  });

  it('routes a connection preview without a target node', () => {
    const {
      sourcePoint,
      targetPoint,
      sourcePosition,
      targetPosition,
      markerInset,
      allEdges,
      allNodes,
      nodeGeometries,
    } = edgeParams(source, target, [source, between, target]);
    const params: ConnectionCurveFactoryParams = {
      mode: 'connection',
      sourceNode: source,
      sourcePoint,
      targetPoint,
      sourcePosition,
      targetPosition,
      markerInset,
      allEdges,
      allNodes,
      nodeGeometries,
    };
    const layout = avoidNodesCurve(params);

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

  it.each<[Position, Position]>([
    ['right', 'left'],
    ['right', 'top'],
  ])('routes a self-loop from %s to %s around its node', (...positions) => {
    const fallback = getSmoothStepPath({
      sourcePoint: { x: 100, y: 125 },
      targetPoint: { x: 0, y: 125 },
      sourcePosition: 'right',
      targetPosition: 'left',
      borderRadius: 8,
    }).path;
    const layout = avoidNodesCurve(edgeParams(source, source, [source, target], positions));
    // The node less a pixel on each side: a path that runs along its border does not cross it.
    const inside = { x: source.x + 1, y: source.y + 1, width: source.width - 2, height: source.height - 2 };

    expect(layout.path).not.toBe(fallback);
    expect(crosses(layout.path, inside)).toBe(false);
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

  describe('inertia', () => {
    const edge = createEdge({ id: 'a-b', source: 'source', target: 'target' });
    /** Whether the route of the edge passes above the line of the handles with a node at the given height. */
    const passesAbove = (curve: CurveFactory, nodeY: number) => {
      const params = edgeParams(source, target, [source, geometry('between', 250, nodeY), target]);
      const points = pathPoints(curve({ ...params, edge })!.path);
      return points[Math.floor(points.length / 2)].y < 125;
    };

    it('keeps the route of an edge while a node jitters around the line', () => {
      const curve = createAvoidNodesCurve();
      const first = passesAbove(curve, 99);

      expect([101, 99, 101, 99].map((y) => passesAbove(curve, y))).toEqual([first, first, first, first]);
    });

    it('changes the route once the other one is much shorter', () => {
      const curve = createAvoidNodesCurve();
      const first = passesAbove(curve, 99);

      expect(passesAbove(curve, first ? 80 : 120)).toBe(!first);
    });

    it('follows a jittering node with inertia 0', () => {
      const curve = createAvoidNodesCurve({ inertia: 0 });

      expect(passesAbove(curve, 99)).not.toBe(passesAbove(curve, 101));
    });
  });

  it('routes around the node between two columns of a dense grid', () => {
    const nodes: NodeGeometry[] = [];
    for (let row = 0; row < 6; row++) {
      for (let column = 0; column < 6; column++) nodes.push(geometry(`${row}-${column}`, column * 180, row * 120));
    }
    const crossed: string[] = [];

    for (let row = 0; row < 6; row++) {
      for (let column = 0; column < 4; column++) {
        const from = nodes[row * 6 + column];
        const to = nodes[row * 6 + column + 2];
        const { path } = avoidNodesCurve(edgeParams(from, to, nodes));
        const hit = nodes.filter((node) => node !== from && node !== to && crosses(path, node));
        crossed.push(...hit.map((node) => `${from.id}->${to.id} crosses ${node.id}`));
      }
    }

    expect(crossed).toEqual([]);
  });

  it('draws sharp corners with a corner radius of 0', () => {
    const sharp = createAvoidNodesCurve({ cornerRadius: 0 })(edgeParams(source, target, [source, between, target]));

    expect(sharp.path).not.toContain('Q');
  });

  it('keeps a larger clearance with a larger node padding', () => {
    const wide = createAvoidNodesCurve({ nodePadding: 40 })(edgeParams(source, target, [source, between, target]));
    const padded = { x: between.x - 30, y: between.y - 30, width: between.width + 60, height: between.height + 60 };

    expect(crosses(wide.path, padded)).toBe(false);
  });
});
