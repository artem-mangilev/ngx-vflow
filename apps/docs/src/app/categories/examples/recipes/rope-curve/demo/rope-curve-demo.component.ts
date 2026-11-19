import { ChangeDetectionStrategy, Component, DestroyRef, Signal, inject, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { CurveFactory, Edge, Point, Vflow, createEdges, createNodes, getStraightPath } from 'ngx-vflow';

const ROPE = {
  /** The rope is a chain of this many segments. */
  segments: 16,
  /** How much longer the rope is than the straight line between its ends, in flow units. */
  slack: 28,
  /** Downward acceleration, in flow units per second squared. */
  gravity: 1700,
  /** The share of its speed a point keeps from one step to the next. */
  damping: 0.965,
  /** How many times per step the segments are pulled back to their length; more makes a stiffer rope. */
  iterations: 6,
  /** Seconds per step. Steps of one length keep the rope the same at every refresh rate. */
  step: 1 / 60,
  /** A rope whose fastest point moves less than this in a step, in flow units, is at rest. */
  rest: 0.01,
};

/** A point of the chain with its place one step ago: the difference is its speed (Verlet integration). */
interface RopePoint extends Point {
  previousX: number;
  previousY: number;
}

/** A chain of points between two pinned ends. */
class Rope {
  private readonly points: RopePoint[];

  constructor(source: Point, target: Point) {
    this.points = Array.from({ length: ROPE.segments + 1 }, (_, index) => {
      const x = source.x + ((target.x - source.x) * index) / ROPE.segments;
      const y = source.y + ((target.y - source.y) * index) / ROPE.segments;

      return { x, y, previousX: x, previousY: y };
    });

    // The rope is created straight and hangs at rest before it is first drawn.
    for (let steps = 0; steps < 600 && this.step() > ROPE.rest; steps++);
  }

  /** Moves the ends to the handles; tells whether they moved. */
  pin(source: Point, target: Point): boolean {
    const first = this.points[0];
    const last = this.points[ROPE.segments];
    const moved = first.x !== source.x || first.y !== source.y || last.x !== target.x || last.y !== target.y;

    Object.assign(first, { x: source.x, y: source.y, previousX: source.x, previousY: source.y });
    Object.assign(last, { x: target.x, y: target.y, previousX: target.x, previousY: target.y });

    return moved;
  }

  /** Advances the chain by one step; returns how far its fastest point moved. */
  step(): number {
    const points = this.points;
    const first = points[0];
    const last = points[ROPE.segments];

    // Every point between the ends keeps its speed, less the damping, and falls.
    for (const point of points.slice(1, -1)) {
      const speedX = (point.x - point.previousX) * ROPE.damping;
      const speedY = (point.y - point.previousY) * ROPE.damping;

      point.previousX = point.x;
      point.previousY = point.y;
      point.x += speedX;
      point.y += speedY + ROPE.gravity * ROPE.step ** 2;
    }

    // Then every segment is pulled back to its length, both of its points halfway; the ends stay pinned. One pass
    // disturbs the neighbouring segments, so a few passes follow each other.
    const length = (Math.hypot(last.x - first.x, last.y - first.y) + ROPE.slack) / ROPE.segments;

    for (let pass = 0; pass < ROPE.iterations; pass++) {
      for (let index = 0; index < ROPE.segments; index++) {
        const a = points[index];
        const b = points[index + 1];
        const distance = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const shift = (distance - length) / distance / 2;
        const shiftX = (b.x - a.x) * shift;
        const shiftY = (b.y - a.y) * shift;

        if (a !== first) {
          a.x += shiftX;
          a.y += shiftY;
        }
        if (b !== last) {
          b.x -= shiftX;
          b.y -= shiftY;
        }
      }
    }

    return Math.max(...points.map((point) => Math.hypot(point.x - point.previousX, point.y - point.previousY)));
  }

  /** A smooth line through the chain: a quadratic curve around every point, joined at the middles of the segments. */
  path(): string {
    const points = this.points;
    let path = `M${points[0].x},${points[0].y}`;

    for (let index = 1; index < ROPE.segments; index++) {
      const { x, y } = points[index];
      const next = points[index + 1];

      path += ` Q${x},${y} ${(x + next.x) / 2},${(y + next.y) / 2}`;
    }

    return `${path} L${points[ROPE.segments].x},${points[ROPE.segments].y}`;
  }

  /** The point a center label hangs on. */
  middle(): Point {
    const { x, y } = this.points[ROPE.segments / 2];

    return { x, y };
  }
}

/**
 * A curve that hangs every edge between its handles as a rope. It keeps a rope per edge and steps the ropes that
 * move on animation frames; ropes at rest cost nothing. Call it in an injection context: the frames stop with it.
 *
 * `measured` tells that the flow has measured its handles. Until then their points are provisional, and a rope hung
 * on them would swing into place when the flow first paints.
 */
function createRopeCurve(measured: Signal<boolean>): CurveFactory {
  const ropes = new WeakMap<Edge, Rope>();
  const moving = new Set<Rope>();
  // The curve reads the frame, so the flow asks for the paths again after every step.
  const frame = signal(0);
  let request = 0;
  let time = 0;

  const animate = (now: number) => {
    // A frame takes as many whole steps as the time since the last one holds, and the rest of that time carries
    // over to the next frame; a long pause counts as a few steps.
    const stepMs = ROPE.step * 1000;
    const steps = Math.min(Math.floor((now - time) / stepMs), 4);
    time = steps < 4 ? time + steps * stepMs : now;

    for (let step = 0; step < steps; step++) {
      for (const rope of moving) {
        if (rope.step() < ROPE.rest) moving.delete(rope);
      }
    }

    if (steps) frame.update((count) => count + 1);
    request = moving.size ? requestAnimationFrame(animate) : 0;
  };

  inject(DestroyRef).onDestroy(() => {
    if (request) cancelAnimationFrame(request);
  });

  return (params) => {
    // The preview of a connection has no edge to keep a rope for.
    if (params.mode === 'connection' || !measured()) return getStraightPath(params);

    frame();

    let rope = ropes.get(params.edge);

    if (!rope) {
      rope = new Rope(params.sourcePoint, params.targetPoint);
      ropes.set(params.edge, rope);
    } else if (rope.pin(params.sourcePoint, params.targetPoint)) {
      // A node moved: the rope follows its handles until it comes to rest again.
      moving.add(rope);

      if (!request) {
        time = performance.now();
        request = requestAnimationFrame(animate);
      }
    }

    return { path: rope.path(), labelPoints: { center: rope.middle() } };
  };
}

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges"
    (initialized)="measured.set(true); flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" [connectable]="false" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class RopeCurveDemoComponent {
  protected readonly measured = signal(false);
  private readonly rope = createRopeCurve(this.measured);

  /** The modules of a synthesizer, patched with cables. */
  protected readonly nodes = createNodes([
    { id: 'oscillator', point: { x: 0, y: 0 }, data: { text: 'Oscillator' } },
    { id: 'filter', point: { x: 260, y: 70 }, data: { text: 'Filter' } },
    { id: 'amplifier', point: { x: 520, y: 0 }, data: { text: 'Amplifier' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'oscillator-filter', source: 'oscillator', target: 'filter', curve: this.rope, data: { label: 'raw' } },
    { id: 'filter-amplifier', source: 'filter', target: 'amplifier', curve: this.rope, data: { label: 'filtered' } },
  ]);
}
