import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';

export type AlignmentAxis = 'x' | 'y';

/** A node the moving selection may align with. An ancestor of the selection offers only its center axes. */
export interface AlignmentTarget {
  rect: Rect;
  centerOnly: boolean;
}

/** Free space between two targets side by side on `axis` that overlap on the other axis, with no target between. */
export interface AlignmentGap {
  axis: AlignmentAxis;
  start: Rect;
  end: Rect;
  length: number;
}

/**
 * An edge between a handle that moves with the selection and a fixed handle, both on sides that face along the other
 * axis. The edge is straight when both points share the coordinate on `axis`.
 */
export interface AlignmentHandlePair {
  axis: AlignmentAxis;
  /** The moving handle point relative to the selection origin. */
  offset: Point;
  fixed: Point;
}

/** What the moving selection may align with, collected once when a drag starts. */
export interface AlignmentScene {
  targets: AlignmentTarget[];
  gaps: AlignmentGap[];
  handles: AlignmentHandlePair[];
}

export interface AlignmentLine {
  from: Point;
  to: Point;
  /** The aligned points on the line. */
  points: Point[];
  center: boolean;
}

/** One of equal gaps: a segment along `axis` from `from` to `to`, drawn at `at` on the other axis. */
export interface AlignmentGapMark {
  axis: AlignmentAxis;
  from: number;
  to: number;
  at: number;
}

export interface AlignmentGuides {
  lines: AlignmentLine[];
  gaps: AlignmentGapMark[];
}

export const NO_GUIDES: AlignmentGuides = { lines: [], gaps: [] };

/** How far from exact a position still counts as aligned when guides are drawn, in flow units. */
export const ALIGNMENT_EPSILON = 0.01;

/** How much farther than the nearest alignment a straight edge may be and still win, in flow units. */
const HANDLE_PREFERENCE = 1;

interface Span {
  start: number;
  end: number;
}

type Match =
  | { kind: 'anchor'; offset: number; value: number; target: Rect; center: boolean; parent: boolean }
  | { kind: 'gap-center' | 'gap-after' | 'gap-before'; offset: number; gap: AlignmentGap }
  | { kind: 'handle'; offset: number; pair: AlignmentHandlePair };

const cross = (axis: AlignmentAxis): AlignmentAxis => (axis === 'x' ? 'y' : 'x');

function span(rect: Rect, axis: AlignmentAxis): Span {
  return axis === 'x' ? { start: rect.x, end: rect.x + rect.width } : { start: rect.y, end: rect.y + rect.height };
}

const middle = (s: Span) => (s.start + s.end) / 2;

const overlaps = (a: Span, b: Span) => a.start < b.end && b.start < a.end;

function intersection(a: Span, b: Span): Span {
  return { start: Math.max(a.start, b.start), end: Math.min(a.end, b.end) };
}

function point(axis: AlignmentAxis, along: number, across: number): Point {
  return axis === 'x' ? { x: along, y: across } : { x: across, y: along };
}

/**
 * Gaps between neighbours on each axis. A pair qualifies when the second target starts after the first ends, they
 * overlap on the other axis, and no target starting between them crosses their common band.
 */
export function findAlignmentGaps(rects: Rect[]): AlignmentGap[] {
  return [...axisGaps(rects, 'x'), ...axisGaps(rects, 'y')];
}

function axisGaps(rects: Rect[], axis: AlignmentAxis): AlignmentGap[] {
  const sorted = [...rects].sort((a, b) => span(a, axis).start - span(b, axis).start);
  const gaps: AlignmentGap[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    const startSpan = span(start, axis);
    const startBreadth = span(start, cross(axis));
    // Targets after `start` that overlap its breadth: only these can stand in a gap of `start`.
    const passed: Rect[] = [];

    for (let j = i + 1; j < sorted.length; j++) {
      const end = sorted[j];
      const endSpan = span(end, axis);
      const endBreadth = span(end, cross(axis));
      if (endSpan.start <= startSpan.end || !overlaps(startBreadth, endBreadth)) continue;

      const band = intersection(startBreadth, endBreadth);
      const blocked = passed.some(
        (other) => span(other, axis).start < endSpan.start && overlaps(span(other, cross(axis)), band),
      );
      passed.push(end);

      if (!blocked) gaps.push({ axis, start, end, length: endSpan.start - startSpan.end });
    }
  }

  return gaps;
}

/** Every way `rect` can align on `axis` by moving at most `tolerance`. */
function matches(scene: AlignmentScene, rect: Rect, axis: AlignmentAxis, tolerance: number): Match[] {
  const found: Match[] = [];
  const moving = span(rect, axis);
  const breadth = span(rect, cross(axis));
  const add = (match: Match) => {
    if (Math.abs(match.offset) <= tolerance) found.push(match);
  };

  for (const { rect: target, centerOnly } of scene.targets) {
    const other = span(target, axis);
    const value = middle(other);
    add({ kind: 'anchor', offset: value - middle(moving), value, target, center: true, parent: centerOnly });
    if (centerOnly) continue;

    for (const from of [moving.start, moving.end]) {
      for (const to of [other.start, other.end]) {
        add({ kind: 'anchor', offset: to - from, value: to, target, center: false, parent: false });
      }
    }
  }

  for (const gap of scene.gaps) {
    if (gap.axis !== axis) continue;
    if (!overlaps(breadth, intersection(span(gap.start, cross(axis)), span(gap.end, cross(axis))))) continue;

    const before = span(gap.start, axis);
    const after = span(gap.end, axis);
    if (gap.length > moving.end - moving.start) {
      add({ kind: 'gap-center', offset: (before.end + after.start) / 2 - middle(moving), gap });
    }
    add({ kind: 'gap-after', offset: after.end + gap.length - moving.start, gap });
    add({ kind: 'gap-before', offset: before.start - gap.length - moving.end, gap });
  }

  for (const pair of scene.handles) {
    if (pair.axis !== axis) continue;
    add({ kind: 'handle', offset: pair.fixed[axis] - (moving.start + pair.offset[axis]), pair });
  }

  return found;
}

function nearestOffset(scene: AlignmentScene, rect: Rect, axis: AlignmentAxis, tolerance: number): number | null {
  const found = matches(scene, rect, axis, tolerance);
  let nearest: number | null = null;
  for (const { offset } of found) {
    if (nearest === null || Math.abs(offset) < Math.abs(nearest)) nearest = offset;
  }

  // A measured handle rarely sits exactly where a node center or edge is, and a straight edge is the one alignment a
  // sub-pixel miss spoils visibly, so it wins over a slightly nearer alignment.
  let straight: number | null = null;
  for (const match of found) {
    if (match.kind !== 'handle' || nearest === null || Math.abs(match.offset - nearest) > HANDLE_PREFERENCE) continue;
    if (straight === null || Math.abs(match.offset - nearest) < Math.abs(straight - nearest)) straight = match.offset;
  }

  return straight ?? nearest;
}

/** The shift on each axis that aligns `rect` with the nearest match within `tolerance`, or `null` for none. */
export function alignmentOffset(
  scene: AlignmentScene,
  rect: Rect,
  tolerance: number,
): { x: number | null; y: number | null } {
  return { x: nearestOffset(scene, rect, 'x', tolerance), y: nearestOffset(scene, rect, 'y', tolerance) };
}

/** Guides for every alignment of `rect` that holds exactly. */
export function alignmentGuides(scene: AlignmentScene, rect: Rect): AlignmentGuides {
  const lines: AlignmentLine[] = [];
  const gaps = new Map<string, AlignmentGapMark>();

  for (const axis of ['x', 'y'] as const) {
    const found = matches(scene, rect, axis, ALIGNMENT_EPSILON);
    lines.push(...anchorLines(found, rect, axis), ...handleLines(found, rect));
    for (const mark of gapMarks(scene, found, rect, axis)) {
      gaps.set(`${mark.axis}:${mark.from}:${mark.to}:${mark.at}`, mark);
    }
  }

  return lines.length || gaps.size ? { lines, gaps: [...gaps.values()] } : NO_GUIDES;
}

/** A line through every target aligned with the same anchor of `rect`, marked at the anchor points. */
function anchorLines(found: Match[], rect: Rect, axis: AlignmentAxis): AlignmentLine[] {
  const groups = new Map<string, { value: number; center: boolean; targets: Map<Rect, boolean> }>();
  for (const match of found) {
    if (match.kind !== 'anchor') continue;
    // Matched anchors are within the epsilon of each other; the one of `rect` names the line.
    const key = `${match.center}:${Math.round((match.value - match.offset) / ALIGNMENT_EPSILON)}`;
    const group = groups.get(key) ?? { value: match.value, center: match.center, targets: new Map<Rect, boolean>() };
    group.targets.set(match.target, match.parent);
    groups.set(key, group);
  }

  return [...groups.values()].map(({ value, center, targets }) => {
    const points = [
      ...anchorPoints(rect, axis, value, center, false),
      ...[...targets].flatMap(([target, parent]) => anchorPoints(target, axis, value, center, parent)),
    ];
    const across = points.map((p) => p[cross(axis)]);
    return {
      from: point(axis, value, Math.min(...across)),
      to: point(axis, value, Math.max(...across)),
      points,
      center,
    };
  });
}

/**
 * The center of `rect`, or the two corners on its edge at `value`. The center line of a parent crosses the whole
 * parent, so it shows even when the node sits exactly at the parent's center.
 */
function anchorPoints(rect: Rect, axis: AlignmentAxis, value: number, center: boolean, parent: boolean): Point[] {
  const breadth = span(rect, cross(axis));
  return center && !parent
    ? [point(axis, value, middle(breadth))]
    : [point(axis, value, breadth.start), point(axis, value, breadth.end)];
}

function handleLines(found: Match[], rect: Rect): AlignmentLine[] {
  return found.flatMap((match) => {
    if (match.kind !== 'handle') return [];
    const moving = { x: rect.x + match.pair.offset.x, y: rect.y + match.pair.offset.y };
    return [{ from: moving, to: match.pair.fixed, points: [moving, match.pair.fixed], center: false }];
  });
}

/** The two equal gaps of each gap match, and every gap of the same length chained to them through shared targets. */
function gapMarks(scene: AlignmentScene, found: Match[], rect: Rect, axis: AlignmentAxis): AlignmentGapMark[] {
  const marks: AlignmentGapMark[] = [];

  for (const match of found) {
    if (match.kind === 'anchor' || match.kind === 'handle') continue;
    const { start, end } = match.gap;
    const [first, second] = gapNeighbours(match.kind, start, end, rect);
    const length = span(first[1], axis).start - span(first[0], axis).end;

    marks.push(gapMark(first, axis), gapMark(second, axis));
    for (const gap of chainedGaps(scene, axis, length, [start, end])) marks.push(gapMark([gap.start, gap.end], axis));
  }

  return marks;
}

/** The two pairs of neighbours whose gaps the match makes equal, in axis order. */
function gapNeighbours(kind: 'gap-center' | 'gap-after' | 'gap-before', start: Rect, end: Rect, rect: Rect) {
  switch (kind) {
    case 'gap-center':
      return [[start, rect] as const, [rect, end] as const];
    case 'gap-after':
      return [[start, end] as const, [end, rect] as const];
    case 'gap-before':
      return [[rect, start] as const, [start, end] as const];
  }
}

function chainedGaps(scene: AlignmentScene, axis: AlignmentAxis, length: number, from: Rect[]): AlignmentGap[] {
  const equal = scene.gaps.filter((gap) => gap.axis === axis && Math.abs(gap.length - length) <= ALIGNMENT_EPSILON);
  const reached = new Set(from);
  const chained = new Set<AlignmentGap>();

  for (let grew = true; grew;) {
    grew = false;
    for (const gap of equal) {
      if (chained.has(gap) || (!reached.has(gap.start) && !reached.has(gap.end))) continue;
      chained.add(gap);
      reached.add(gap.start);
      reached.add(gap.end);
      grew = true;
    }
  }

  return [...chained];
}

/** Drawn a quarter into the shared band rather than at its middle, where ports and their edges usually run. */
function gapMark([a, b]: readonly [Rect, Rect], axis: AlignmentAxis): AlignmentGapMark {
  const band = intersection(span(a, cross(axis)), span(b, cross(axis)));
  return { axis, from: span(a, axis).end, to: span(b, axis).start, at: band.start + (band.end - band.start) / 4 };
}
