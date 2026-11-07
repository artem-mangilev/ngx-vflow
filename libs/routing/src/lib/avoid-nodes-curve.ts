import {
  CurveFactory,
  CurveFactoryParams,
  CurveLayout,
  EdgeLabelPoint,
  NodeGeometry,
  Point,
  Position,
  Rect,
  getSmoothStepPath,
} from 'ngx-vflow';

/** Options of {@link createAvoidNodesCurve}; every distance is in flow units. */
export interface AvoidNodesCurveOptions {
  /** Clearance kept between the path and the nodes it routes around. */
  nodePadding?: number;
  /** Length of the straight segment leaving a handle before the first bend, in addition to `nodePadding`. */
  approachDistance?: number;
  /** Radius of the rounded corners; `0` draws sharp corners. */
  cornerRadius?: number;
  /** Distance of the routing lanes from the sides of the obstacles. */
  gridSpacing?: number;
  /** Cost of a bend relative to one unit of path length: higher values prefer fewer corners. */
  bendPenalty?: number;
  /** Nodes farther than this from the rectangle spanned by the handles are not obstacles. */
  obstacleMargin?: number;
  /** Whether a node is an obstacle. The ancestors of the nodes of the edge never are. */
  isObstacle?: (node: NodeGeometry) => boolean;
  /**
   * How much the curve keeps to the route it had, as a discount on the length of the segments along it: with `0.3`
   * the route changes only when another one is about 30% shorter, so a dragged node does not make the curve flip
   * between two sides of an obstacle. `0` recomputes the route from scratch every time.
   */
  inertia?: number;
}

const DEFAULT_OPTIONS: Required<AvoidNodesCurveOptions> = {
  nodePadding: 14,
  approachDistance: 24,
  cornerRadius: 8,
  gridSpacing: 20,
  bendPenalty: 50,
  obstacleMargin: 280,
  isObstacle: () => true,
  inertia: 0.3,
};

/** Nodes nearer to the route than this many flow units push its interior points away. */
const RELAX_CLEARANCE = 6;
/** The first route considers the obstacles this close to the handles; the ones it still crosses are added after. */
const ROUTE_ENVELOPE_MARGIN = 160;
/** Reroutes with the crossed obstacles added, at most this many times. */
const MAX_REROUTES = 3;

/**
 * Creates a curve factory that routes an edge around the nodes between its ends with an orthogonal path of
 * rounded corners. Obstacles come from `nodeGeometries`, the rendered rectangles of the flow, less the nodes of the
 * edge and their ancestors, so an edge inside a parent routes within it.
 *
 * ```ts
 * createEdges([{ id: 'a-b', source: 'a', target: 'b', curve: createAvoidNodesCurve({ nodePadding: 20 }) }]);
 * ```
 */
export function createAvoidNodesCurve(options: AvoidNodesCurveOptions = {}): CurveFactory {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  /** The last route of each edge, which the next route of the edge keeps to. */
  const previousRoutes = new WeakMap<object, Point[]>();

  return (params) => {
    const edge = params.mode === 'edge' ? params.edge : null;
    const previous = edge && settings.inertia > 0 ? previousRoutes.get(edge) : undefined;
    const { layout, points } = route(params, settings, previous);
    if (edge) {
      if (points) previousRoutes.set(edge, points);
      else previousRoutes.delete(edge);
    }

    return layout;
  };
}

/** The curve of {@link createAvoidNodesCurve} with the default options: `curve: avoidNodesCurve`. */
export const avoidNodesCurve: CurveFactory = createAvoidNodesCurve();

type Direction = 'H' | 'V' | null;

interface Obstacle extends Rect {
  id?: string;
}

interface Grid {
  xCoords: number[];
  yCoords: number[];
  xIndexByCoord: Map<number, number>;
  yIndexByCoord: Map<number, number>;
  isPointFree(point: Point): boolean;
}

interface AStarNode {
  x: number;
  y: number;
  dir: Direction;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

type SegmentClearChecker = (start: Point, end: Point) => boolean;

/** The layout, and the polyline of the route when there is one, for the inertia of the next route. */
function route(
  params: CurveFactoryParams,
  settings: Required<AvoidNodesCurveOptions>,
  previous: Point[] | undefined,
): { layout: CurveLayout; points: Point[] | null } {
  const { sourcePoint, targetPoint, sourcePosition, targetPosition, sourceNode, targetNode } = params;
  const candidates = collectObstacleNodes(params, settings);

  // The straight exit from a handle shortens when a neighbour sits closer than the usual approach.
  const approach = (point: Point, side: Position, end: 'source' | 'target') =>
    findApproachPoint(point, side, settings.nodePadding + settings.approachDistance, candidates, end);
  const sourceApproach = approach(sourcePoint, sourcePosition, 'source');
  const targetApproach = approach(targetPoint, targetPosition, 'target');
  if (!sourceApproach || !targetApproach) return { layout: fallback(params, settings), points: null };

  const nodeObstacles = inflateObstacles(candidates, settings.nodePadding, {
    source: [sourcePoint, sourceApproach],
    target: [targetPoint, targetApproach],
  });
  const exitBlockers = [
    buildExitBlocker(sourceApproach, sourcePosition, sourceNode, settings.nodePadding, settings.gridSpacing),
    targetNode &&
      buildExitBlocker(targetApproach, targetPosition, targetNode, settings.nodePadding, settings.gridSpacing),
  ].filter((rect): rect is Obstacle => !!rect);

  const nearby = dedupeRects(
    filterObstaclesByBounds([...nodeObstacles, ...exitBlockers], sourcePoint, targetPoint, settings.obstacleMargin),
  );
  const routed = computeRoute(
    sourceApproach,
    targetApproach,
    nearby,
    initialDirection(sourcePosition),
    settings,
    previous,
  );
  if (!routed) return { layout: fallback(params, settings), points: null };

  const points = finalizePath(sourcePoint, sourceApproach, routed, targetApproach, targetPoint, nearby);

  return {
    layout: {
      path: pathToSvg(points, settings.cornerRadius),
      bounds: getBoundsOfPoints(points),
      labelPoints: points.length >= 2 ? getLabelPoints(points) : undefined,
    },
    points,
  };
}

/** A smooth step between the handles when no route exists, for example between overlapping nodes. */
function fallback(params: CurveFactoryParams, settings: Required<AvoidNodesCurveOptions>): CurveLayout {
  const { sourcePoint, targetPoint, sourcePosition, targetPosition } = params;

  return getSmoothStepPath({
    sourcePoint,
    targetPoint,
    sourcePosition,
    targetPosition,
    borderRadius: settings.cornerRadius,
  });
}

interface ObstacleNode {
  node: NodeGeometry;
  /** Which end of the edge the node is, if any. */
  end: 'source' | 'target' | null;
}

/**
 * The rendered nodes to route around. The ancestors of the nodes of the edge are left out, so an edge inside a parent
 * routes within it. The nodes of the edge stay: the path may not run through the node it leaves.
 */
function collectObstacleNodes(params: CurveFactoryParams, settings: Required<AvoidNodesCurveOptions>): ObstacleNode[] {
  const geometries = params.nodeGeometries;
  const byId = new Map(geometries.map((node) => [node.id, node]));
  const ends = { source: params.sourceNode.id, target: params.targetNode?.id };
  const ancestors = new Set<string>();
  for (const id of [ends.source, ends.target]) {
    for (let current = id ? byId.get(id) : undefined; current?.parentId && !ancestors.has(current.parentId);) {
      ancestors.add(current.parentId);
      current = byId.get(current.parentId);
    }
  }

  return geometries
    .filter((node) => !ancestors.has(node.id) && settings.isObstacle(node))
    .map((node) => ({ node, end: node.id === ends.source ? 'source' : node.id === ends.target ? 'target' : null }));
}

/**
 * Inflates the obstacles by the padding, less where a handle or approach point would end up inside: a neighbour
 * closer to a handle than the padding keeps the points outside its rectangle. A node drawn over a point of the other
 * end, such as an overlapping node, is not an obstacle at all. A node of the edge keeps its own handle point, which
 * lies on its side, out of the account.
 */
function inflateObstacles(
  candidates: ObstacleNode[],
  padding: number,
  points: { source: Point[]; target: Point[] },
): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (const { node, end } of candidates) {
    const keepOutside = [
      ...(end === 'source' ? points.source.slice(1) : points.source),
      ...(end === 'target' ? points.target.slice(1) : points.target),
    ];
    const rect = inflateKeepingOutside(node, padding, keepOutside);
    if (rect) obstacles.push({ ...rect, id: node.id });
  }

  return obstacles;
}

/**
 * The rectangle inflated by `padding`, less on the side a point is nearest to, so that every point stays outside;
 * `null` when a point lies inside the rectangle itself.
 */
function inflateKeepingOutside(rect: Rect, padding: number, points: Point[]): Rect | null {
  const sides = { left: padding, right: padding, top: padding, bottom: padding };
  for (const point of points) {
    if (pointInsideRect(point, rect)) return null;
    const left = rect.x - point.x;
    const right = point.x - (rect.x + rect.width);
    const top = rect.y - point.y;
    const bottom = point.y - (rect.y + rect.height);
    const gap = Math.max(left, right, top, bottom);
    const side = left === gap ? 'left' : right === gap ? 'right' : top === gap ? 'top' : 'bottom';
    sides[side] = Math.min(sides[side], Math.max(0, gap - 1));
  }

  return {
    x: rect.x - sides.left,
    y: rect.y - sides.top,
    width: rect.width + sides.left + sides.right,
    height: rect.height + sides.top + sides.bottom,
  };
}

/** Clearance a shortened approach keeps from the neighbour that shortens it. */
const APPROACH_CLEARANCE = 2;

/**
 * The point the path reaches straight from the handle: as far as `distance`, as near as the other nodes allow with a
 * small clearance. The straight segment to it crosses no node.
 */
function findApproachPoint(
  point: Point,
  side: Position,
  distance: number,
  candidates: ObstacleNode[],
  own: 'source' | 'target',
): Point | null {
  // A node under the point that is not an end of the edge, such as the one a connection pointer touches, does not
  // count; an end node under the other handle, as with overlapping nodes, leaves no exit and the curve falls back.
  const others = candidates
    .filter(({ end }) => end !== own)
    .map(({ node, end }) => ({ rect: inflateRect(node, APPROACH_CLEARANCE), end }))
    .filter(({ rect, end }) => end !== null || !pointInsideRect(point, rect))
    .map(({ rect }) => rect);
  for (let d = distance; d >= 2; d -= 2) {
    const candidate = getApproachPoint(point, side, d);
    if (!others.some((rect) => segmentIntersectsRect(point, candidate, rect))) return candidate;
  }

  return null;
}

/**
 * Routes through the obstacles near the handles first, then adds the ones the route still crosses and routes again,
 * so a detour never runs through a node that lay outside the first guess.
 */
function computeRoute(
  source: Point,
  target: Point,
  nearby: Obstacle[],
  initialDir: Direction,
  settings: Required<AvoidNodesCurveOptions>,
  previous: Point[] | undefined,
): Point[] | null {
  const selected = new Set(filterObstaclesByBounds(nearby, source, target, ROUTE_ENVELOPE_MARGIN));
  const costs: StepCosts = {
    bendPenalty: settings.bendPenalty,
    discount: previous ? settings.inertia : 0,
    alongPrevious: previous ? createPreviousRouteMatcher(previous, settings.gridSpacing) : () => false,
  };
  for (let attempt = 0; ; attempt++) {
    const obstacles = [...selected];
    const grid = buildGrid(source, target, obstacles, settings.gridSpacing);
    const segmentIsClear = createSegmentClearChecker(obstacles);
    const routed = aStarRoute(source, target, grid, segmentIsClear, initialDir, costs);
    if (!routed) return null;

    const crossed = nearby.filter(
      (rect) =>
        !selected.has(rect) && routed.some((point, i) => i > 0 && segmentIntersectsRect(routed[i - 1], point, rect)),
    );
    if (crossed.length === 0 || attempt === MAX_REROUTES) return routed;
    crossed.forEach((rect) => selected.add(rect));
  }
}

/** Joins the handle points, the approach points and the route into one orthogonal path without detours. */
function finalizePath(
  sourcePoint: Point,
  sourceApproach: Point,
  routed: Point[],
  targetApproach: Point,
  targetPoint: Point,
  obstacles: Obstacle[],
): Point[] {
  const raw = buildFullPath(sourcePoint, sourceApproach, routed, targetApproach, targetPoint);
  const segmentIsClear = createSegmentClearChecker(obstacles);
  const simplified = removeDuplicatesAndCollinear(raw);
  const shortcut = applyOrthogonalShortcuts(simplified, segmentIsClear);
  const relaxed = pushInteriorPointsOutOfObstacles(shortcut, obstacles, RELAX_CLEARANCE);

  return ensureOrthogonalPath(relaxed);
}

function filterObstaclesByBounds(obstacles: Obstacle[], source: Point, target: Point, margin: number): Obstacle[] {
  const minX = Math.min(source.x, target.x) - margin;
  const maxX = Math.max(source.x, target.x) + margin;
  const minY = Math.min(source.y, target.y) - margin;
  const maxY = Math.max(source.y, target.y) + margin;

  return obstacles.filter(
    (rect) => rect.x < maxX && rect.x + rect.width > minX && rect.y < maxY && rect.y + rect.height > minY,
  );
}

function inflateRect(rect: Rect, padding: number): Rect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function dedupeRects(rects: Obstacle[]): Obstacle[] {
  const result: Obstacle[] = [];
  const seen = new Set<string>();

  for (const rect of rects) {
    const key = `${rect.x},${rect.y},${rect.width},${rect.height}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(rect);
  }

  return result;
}

/** The routing lanes: the sides of every obstacle, one lane outside each, and the two ends. */
function buildGrid(source: Point, target: Point, obstacles: Obstacle[], spacing: number): Grid {
  const xCoords = new Set<number>([source.x, target.x]);
  const yCoords = new Set<number>([source.y, target.y]);
  const lane = (rect: Obstacle) => {
    // The lane distance matches the exit blocker buffer, so a lane never runs along a blocked side.
    xCoords.add(rect.x - spacing);
    xCoords.add(rect.x);
    xCoords.add(rect.x + rect.width);
    xCoords.add(rect.x + rect.width + spacing);
    yCoords.add(rect.y - spacing);
    yCoords.add(rect.y);
    yCoords.add(rect.y + rect.height);
    yCoords.add(rect.y + rect.height + spacing);
  };
  obstacles.forEach(lane);

  const xSorted = Array.from(xCoords).sort((a, b) => a - b);
  const ySorted = Array.from(yCoords).sort((a, b) => a - b);
  const xIndexByCoord = new Map(xSorted.map((x, i) => [x, i]));
  const yIndexByCoord = new Map(ySorted.map((y, i) => [y, i]));

  const freePointCache = new Map<string, boolean>();
  const isPointFree = (point: Point): boolean => {
    const key = pointKey(point);
    const cached = freePointCache.get(key);
    if (cached !== undefined) return cached;
    const free = !obstacles.some((rect) => pointInsideRect(point, rect));
    freePointCache.set(key, free);
    return free;
  };

  return { xCoords: xSorted, yCoords: ySorted, xIndexByCoord, yIndexByCoord, isPointFree };
}

/** The costs of a step of the route: its length, discounted along the previous route, plus a bend. */
interface StepCosts {
  bendPenalty: number;
  /** Share of the length a step along the previous route does not cost. */
  discount: number;
  alongPrevious: (from: Point, to: Point) => boolean;
}

function aStarRoute(
  source: Point,
  target: Point,
  grid: Grid,
  segmentIsClear: SegmentClearChecker,
  initialDir: Direction,
  costs: StepCosts,
): Point[] | null {
  if (!grid.isPointFree(source) || !grid.isPointFree(target)) return null;

  // The remaining distance may be discounted, so the estimate stays below the cost.
  const estimate = (point: Point) => heuristic(point, target) * (1 - costs.discount);
  const start: AStarNode = {
    x: source.x,
    y: source.y,
    dir: initialDir,
    g: 0,
    h: estimate(source),
    f: estimate(source),
    parent: null,
  };
  const open = new MinHeap<AStarNode>((a, b) => a.f - b.f);
  open.push(start);
  const best = new Map<string, number>([[nodeKey(start), 0]]);

  for (let current = open.pop(); current; current = open.pop()) {
    const bestKnown = best.get(nodeKey(current));
    if (bestKnown !== undefined && current.g > bestKnown) continue;
    if (current.x === target.x && current.y === target.y) return reconstructPath(current);

    for (const neighbor of getNeighbors(current, grid)) {
      if (!grid.isPointFree(neighbor) || !segmentIsClear(current, neighbor)) continue;

      const dir: Direction = neighbor.x !== current.x ? 'H' : 'V';
      const bendCost = current.dir && current.dir !== dir ? costs.bendPenalty : 0;
      const length = Math.abs(neighbor.x - current.x) + Math.abs(neighbor.y - current.y);
      const stepCost = costs.alongPrevious(current, neighbor) ? length * (1 - costs.discount) : length;
      const g = current.g + stepCost + bendCost;
      const h = estimate(neighbor);
      const next: AStarNode = { ...neighbor, dir, g, h, f: g + h, parent: current };
      const key = nodeKey(next);
      const known = best.get(key);
      if (known !== undefined && known <= g) continue;

      best.set(key, g);
      open.push(next);
    }
  }

  return null;
}

/**
 * Whether a step runs along a segment of the previous route: same orientation, within `tolerance` of its line and
 * overlapping its extent. The lanes of a moving node shift a little between frames, which the tolerance covers.
 */
function createPreviousRouteMatcher(previous: Point[], tolerance: number): (from: Point, to: Point) => boolean {
  const horizontal: { at: number; min: number; max: number }[] = [];
  const vertical: { at: number; min: number; max: number }[] = [];
  for (let i = 1; i < previous.length; i++) {
    const a = previous[i - 1];
    const b = previous[i];
    if (a.y === b.y && a.x !== b.x) horizontal.push({ at: a.y, min: Math.min(a.x, b.x), max: Math.max(a.x, b.x) });
    if (a.x === b.x && a.y !== b.y) vertical.push({ at: a.x, min: Math.min(a.y, b.y), max: Math.max(a.y, b.y) });
  }

  return (from, to) => {
    const lanes = from.y === to.y ? horizontal : vertical;
    const at = from.y === to.y ? from.y : from.x;
    const min = from.y === to.y ? Math.min(from.x, to.x) : Math.min(from.y, to.y);
    const max = from.y === to.y ? Math.max(from.x, to.x) : Math.max(from.y, to.y);

    return lanes.some((lane) => Math.abs(lane.at - at) <= tolerance && min < lane.max && max > lane.min);
  };
}

function getNeighbors(node: Point, grid: Grid): Point[] {
  const neighbors: Point[] = [];
  const xIndex = grid.xIndexByCoord.get(node.x) ?? -1;
  const yIndex = grid.yIndexByCoord.get(node.y) ?? -1;

  if (xIndex > 0) neighbors.push({ x: grid.xCoords[xIndex - 1], y: node.y });
  if (xIndex >= 0 && xIndex < grid.xCoords.length - 1) neighbors.push({ x: grid.xCoords[xIndex + 1], y: node.y });
  if (yIndex > 0) neighbors.push({ x: node.x, y: grid.yCoords[yIndex - 1] });
  if (yIndex >= 0 && yIndex < grid.yCoords.length - 1) neighbors.push({ x: node.x, y: grid.yCoords[yIndex + 1] });

  return neighbors;
}

function removeDuplicatesAndCollinear(points: Point[]): Point[] {
  if (points.length <= 2) return points;

  const cleaned: Point[] = [];
  for (const point of points) {
    const last = cleaned[cleaned.length - 1];
    if (!last || !pointsEqual(last, point)) cleaned.push(point);
  }
  if (cleaned.length <= 2) return cleaned;

  const result: Point[] = [cleaned[0]];
  for (let i = 1; i < cleaned.length - 1; i++) {
    const prev = cleaned[i - 1];
    const curr = cleaned[i];
    const next = cleaned[i + 1];
    const collinear = (prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y);
    if (!collinear) result.push(curr);
  }
  result.push(cleaned[cleaned.length - 1]);

  return result;
}

/** Drops a corner whose neighbours lie on one line with a clear segment between them. */
function applyOrthogonalShortcuts(points: Point[], segmentIsClear: SegmentClearChecker): Point[] {
  if (points.length <= 2) return points;

  const result = [...points];
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 1; i < result.length - 1; i++) {
      const prev = result[i - 1];
      const next = result[i + 1];
      if (prev.x !== next.x && prev.y !== next.y) continue;
      if (segmentIsClear(prev, next)) {
        result.splice(i, 1);
        changed = true;
        break;
      }
    }
  }

  return result;
}

function pushInteriorPointsOutOfObstacles(points: Point[], obstacles: Obstacle[], clearance: number): Point[] {
  return points.map((point, index) =>
    index === 0 || index === points.length - 1
      ? point
      : nudgePointOut(point, points[index - 1], points[index + 1], obstacles, clearance),
  );
}

function nudgePointOut(point: Point, prev: Point, next: Point, obstacles: Obstacle[], clearance: number): Point {
  let adjusted = { ...point };
  for (const rect of obstacles) {
    if (!pointInsideRect(adjusted, rect)) continue;

    const left = rect.x - clearance;
    const right = rect.x + rect.width + clearance;
    const top = rect.y - clearance;
    const bottom = rect.y + rect.height + clearance;
    const candidates = [
      { dx: left - adjusted.x, dy: 0, dist: Math.abs(left - adjusted.x) },
      { dx: right - adjusted.x, dy: 0, dist: Math.abs(right - adjusted.x) },
      { dx: 0, dy: top - adjusted.y, dist: Math.abs(top - adjusted.y) },
      { dx: 0, dy: bottom - adjusted.y, dist: Math.abs(bottom - adjusted.y) },
    ].sort((a, b) => a.dist - b.dist);
    const preserving = candidates.find((candidate) =>
      preservesOrthogonality(prev, { x: adjusted.x + candidate.dx, y: adjusted.y + candidate.dy }, next),
    );
    const best = preserving ?? candidates[0];
    adjusted = { x: adjusted.x + best.dx, y: adjusted.y + best.dy };
  }

  return adjusted;
}

function preservesOrthogonality(prev: Point, current: Point, next: Point): boolean {
  return isOrthogonalSegment(prev, current) && isOrthogonalSegment(current, next);
}

function buildFullPath(
  source: Point,
  sourceApproach: Point,
  routed: Point[],
  targetApproach: Point,
  target: Point,
): Point[] {
  const path: Point[] = [source];
  const append = (point: Point) => {
    if (!pointsEqual(point, path[path.length - 1])) path.push(point);
  };

  append(sourceApproach);
  routed.forEach(append);
  append(targetApproach);
  append(target);

  return orthogonalize(path);
}

/** Replaces each diagonal segment by a horizontal one followed by a vertical one. */
function orthogonalize(points: Point[]): Point[] {
  if (points.length <= 2) return points;

  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const next = points[i];
    if (prev.x !== next.x && prev.y !== next.y) result.push({ x: next.x, y: prev.y });
    result.push(next);
  }

  return result;
}

function ensureOrthogonalPath(points: Point[]): Point[] {
  const simplified = removeDuplicatesAndCollinear(orthogonalize(points));

  return hasDiagonalSegments(simplified) ? orthogonalize(simplified) : simplified;
}

function hasDiagonalSegments(points: Point[]): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    if (!isOrthogonalSegment(points[i], points[i + 1])) return true;
  }

  return false;
}

/** The SVG `d` of the polyline, with each corner replaced by a quadratic curve of the given radius. */
function pathToSvg(points: Point[], radius: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;

  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  let cursor = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len1 = Math.abs(dx1) + Math.abs(dy1);
    const len2 = Math.abs(dx2) + Math.abs(dy2);
    const r = Math.min(radius, len1 / 2, len2 / 2);
    if (len1 === 0 || len2 === 0 || r < 2) {
      d += ` L ${fmt(curr.x)} ${fmt(curr.y)}`;
      cursor = curr;
      continue;
    }

    const before = { x: curr.x - Math.sign(dx1) * r, y: curr.y - Math.sign(dy1) * r };
    const after = { x: curr.x + Math.sign(dx2) * r, y: curr.y + Math.sign(dy2) * r };
    // Two corners a diameter apart meet without a line between them.
    if (!pointsEqual(before, cursor)) d += ` L ${fmt(before.x)} ${fmt(before.y)}`;
    d += ` Q ${fmt(curr.x)} ${fmt(curr.y)} ${fmt(after.x)} ${fmt(after.y)}`;
    cursor = after;
  }
  const last = points[points.length - 1];

  return `${d} L ${fmt(last.x)} ${fmt(last.y)}`;
}

/** Points at 15%, 50% and 85% of the path length, each with the direction of its segment, like the core curves. */
function getLabelPoints(points: Point[]): Partial<Record<'start' | 'center' | 'end', EdgeLabelPoint>> {
  const segments: { start: Point; end: Point; length: number }[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const length = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    segments.push({ start, end, length });
    total += length;
  }

  const at = (fraction: number): EdgeLabelPoint => {
    let remaining = total * fraction;
    for (const segment of segments) {
      if (remaining <= segment.length && segment.length > 0) {
        const ratio = remaining / segment.length;
        return {
          x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
          y: segment.start.y + (segment.end.y - segment.start.y) * ratio,
          angle: directionAngle(segment.start, segment.end),
        };
      }
      remaining -= segment.length;
    }
    const last = segments[segments.length - 1];
    return { ...last.end, angle: directionAngle(last.start, last.end) };
  };

  return { start: at(0.15), center: at(0.5), end: at(0.85) };
}

/** Direction of a segment in degrees of flow space: `0` points right, `90` points down. */
function directionAngle(from: Point, to: Point): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function getBoundsOfPoints(points: Point[]): Rect {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { x, y } of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function initialDirection(position: Position): Direction {
  return position === 'left' || position === 'right' ? 'H' : 'V';
}

function getApproachPoint(point: Point, position: Position, distance: number): Point {
  switch (position) {
    case 'left':
      return { x: point.x - distance, y: point.y };
    case 'right':
      return { x: point.x + distance, y: point.y };
    case 'top':
      return { x: point.x, y: point.y - distance };
    case 'bottom':
      return { x: point.x, y: point.y + distance };
  }
}

/**
 * An obstacle between the side of the node and its approach point, with flanks of `buffer` beyond the padded node:
 * the route reaches the approach point from the far side only, so it never crosses the straight exit segment or
 * hugs the side the edge leaves from.
 */
function buildExitBlocker(
  approach: Point,
  side: Position,
  node: Rect,
  padding: number,
  buffer: number,
): Obstacle | null {
  const flank = inflateRect(node, padding);
  let rect: Rect;
  switch (side) {
    case 'right':
      rect = {
        x: node.x + node.width,
        y: flank.y - buffer,
        width: approach.x - (node.x + node.width),
        height: flank.height + buffer * 2,
      };
      break;
    case 'left':
      rect = { x: approach.x, y: flank.y - buffer, width: node.x - approach.x, height: flank.height + buffer * 2 };
      break;
    case 'bottom':
      rect = {
        x: flank.x - buffer,
        y: node.y + node.height,
        width: flank.width + buffer * 2,
        height: approach.y - (node.y + node.height),
      };
      break;
    case 'top':
      rect = { x: flank.x - buffer, y: approach.y, width: flank.width + buffer * 2, height: node.y - approach.y };
      break;
  }

  return rect.width > 0 && rect.height > 0 ? rect : null;
}

function pointInsideRect(point: Point, rect: Rect): boolean {
  return point.x > rect.x && point.x < rect.x + rect.width && point.y > rect.y && point.y < rect.y + rect.height;
}

function createSegmentClearChecker(obstacles: Obstacle[]): SegmentClearChecker {
  const cache = new Map<string, boolean>();

  return (start, end) => {
    if (!isOrthogonalSegment(start, end)) return false;
    const key = segmentKey(start, end);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const clear = !obstacles.some((rect) => segmentIntersectsRect(start, end, rect));
    cache.set(key, clear);
    return clear;
  };
}

function segmentIntersectsRect(start: Point, end: Point, rect: Rect): boolean {
  if (start.x === end.x) {
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    return start.x > rect.x && start.x < rect.x + rect.width && maxY > rect.y && minY < rect.y + rect.height;
  }
  if (start.y === end.y) {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    return start.y > rect.y && start.y < rect.y + rect.height && maxX > rect.x && minX < rect.x + rect.width;
  }

  return false;
}

function heuristic(point: Point, goal: Point): number {
  return Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y);
}

function nodeKey(node: { x: number; y: number; dir: Direction }): string {
  return `${node.x},${node.y},${node.dir ?? 'n'}`;
}

function pointKey(point: Point): string {
  return `${point.x},${point.y}`;
}

function segmentKey(start: Point, end: Point): string {
  const startKey = pointKey(start);
  const endKey = pointKey(end);

  return startKey <= endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`;
}

function reconstructPath(node: AStarNode): Point[] {
  const points: Point[] = [];
  for (let current: AStarNode | null = node; current; current = current.parent) {
    points.push({ x: current.x, y: current.y });
  }

  return points.reverse();
}

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function isOrthogonalSegment(start: Point, end: Point): boolean {
  return start.x === end.x || start.y === end.y;
}

function fmt(value: number): number {
  return Math.round(value * 100) / 100;
}

class MinHeap<T> {
  private readonly values: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  push(value: T): void {
    this.values.push(value);
    this.siftUp(this.values.length - 1);
  }

  pop(): T | undefined {
    if (this.values.length === 0) return undefined;
    const root = this.values[0];
    const last = this.values.pop() as T;
    if (this.values.length > 0) {
      this.values[0] = last;
      this.siftDown(0);
    }

    return root;
  }

  private siftUp(index: number): void {
    for (let current = index; current > 0;) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.values[current], this.values[parent]) >= 0) break;
      this.swap(current, parent);
      current = parent;
    }
  }

  private siftDown(index: number): void {
    for (let current = index; ;) {
      const left = current * 2 + 1;
      const right = left + 1;
      let best = current;
      if (left < this.values.length && this.compare(this.values[left], this.values[best]) < 0) best = left;
      if (right < this.values.length && this.compare(this.values[right], this.values[best]) < 0) best = right;
      if (best === current) break;
      this.swap(current, best);
      current = best;
    }
  }

  private swap(a: number, b: number): void {
    [this.values[a], this.values[b]] = [this.values[b], this.values[a]];
  }
}
