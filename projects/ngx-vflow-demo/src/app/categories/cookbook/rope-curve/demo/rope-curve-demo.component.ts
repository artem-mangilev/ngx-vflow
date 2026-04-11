import { ChangeDetectionStrategy, Component, DestroyRef, WritableSignal, inject, signal } from '@angular/core';
import { CurveFactory, CurveFactoryParams, Edge, Node, Point, Vflow } from 'ngx-vflow';

interface RopeCurveEdgeData {
  ropeState: {
    samples: Point[];
  };
}

interface RopeSimulationConfig {
  segments: number;
  slack: number;
  gravity: number;
  damping: number;
  constraintIterations: number;
  endpointVelocityInfluence: number;
  endpointSwayInfluence: number;
}

interface RopeParticle {
  current: Point;
  previous: Point;
}

const ROPE_SIMULATION_CONFIG: RopeSimulationConfig = {
  segments: 16,
  slack: 28,
  gravity: 1700,
  damping: 0.965,
  constraintIterations: 6,
  endpointVelocityInfluence: 0.12,
  endpointSwayInfluence: 0.22,
};

const DEFAULT_NODE_SIZE = { width: 100, height: 50 };
const HANDLE_RADIUS_WITH_STROKE = 7;

const ropeCurve = createRopeCurveFactory();

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" />`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class RopeCurveDemoComponent {
  public nodes: Node[] = [
    {
      id: 'left',
      point: signal({ x: 90, y: 180 }),
      type: 'default',
      text: signal('Left node'),
    },
    {
      id: 'right',
      point: signal({ x: 470, y: 130 }),
      type: 'default',
      text: signal('Right node'),
    },
  ];

  public edges: Edge<RopeCurveEdgeData>[] = [
    {
      id: 'left -> right',
      source: 'left',
      target: 'right',
      curve: signal(ropeCurve),
      data: signal({
        ropeState: {
          samples: [],
        },
      }),
    },
  ];

  private readonly destroyRef = inject(DestroyRef);
  private readonly edgeData = this.edges[0].data!;
  private readonly leftPoint = this.nodes[0].point;
  private readonly rightPoint = this.nodes[1].point;

  private particles: RopeParticle[] = [];
  private animationFrameId: number | null = null;
  private lastAnimationTs = 0;
  private previousSourcePoint = this.getSourceHandlePoint();
  private previousTargetPoint = this.getTargetHandlePoint();

  constructor() {
    this.initializeRope(this.getSourceHandlePoint(), this.getTargetHandlePoint());
    this.startAnimation();

    this.destroyRef.onDestroy(() => {
      this.stopAnimation();
    });
  }

  private startAnimation(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    this.lastAnimationTs = 0;
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  private animate(ts: number): void {
    const dt = this.lastAnimationTs ? clamp((ts - this.lastAnimationTs) / 1000, 0.001, 0.033) : 0.016;
    this.lastAnimationTs = ts;

    const sourcePoint = this.getSourceHandlePoint();
    const targetPoint = this.getTargetHandlePoint();
    const sourceVelocity = getVelocity(this.previousSourcePoint, sourcePoint, dt);
    const targetVelocity = getVelocity(this.previousTargetPoint, targetPoint, dt);
    const axisNormal = getNormal(sourcePoint, targetPoint);

    this.previousSourcePoint = sourcePoint;
    this.previousTargetPoint = targetPoint;

    if (this.particles.length === 0) {
      this.initializeRope(sourcePoint, targetPoint);
    }

    this.applyEndpointPins(sourcePoint, targetPoint);
    this.applyEndpointImpulse(sourceVelocity, targetVelocity, axisNormal, dt);
    this.integrateInternalParticles(dt);
    this.solveConstraints(sourcePoint, targetPoint);

    this.edgeData.set({
      ropeState: {
        samples: this.particles.map((particle) => ({ ...particle.current })),
      },
    });

    this.animationFrameId = requestAnimationFrame((nextTs) => this.animate(nextTs));
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private initializeRope(sourcePoint: Point, targetPoint: Point): void {
    const count = ROPE_SIMULATION_CONFIG.segments + 1;
    this.particles = Array.from({ length: count }, (_, index) => {
      const ratio = index / (count - 1);
      const basePoint = lerpPoint(sourcePoint, targetPoint, ratio);
      const sag = Math.sin(Math.PI * ratio) * ROPE_SIMULATION_CONFIG.slack;
      const point = { x: basePoint.x, y: basePoint.y + sag };

      return {
        current: point,
        previous: point,
      };
    });

    this.applyEndpointPins(sourcePoint, targetPoint);
    this.edgeData.set({
      ropeState: {
        samples: this.particles.map((particle) => ({ ...particle.current })),
      },
    });
  }

  private applyEndpointPins(sourcePoint: Point, targetPoint: Point): void {
    const lastIndex = this.particles.length - 1;
    this.particles[0].current = { ...sourcePoint };
    this.particles[0].previous = { ...sourcePoint };
    this.particles[lastIndex].current = { ...targetPoint };
    this.particles[lastIndex].previous = { ...targetPoint };
  }

  private applyEndpointImpulse(sourceVelocity: Point, targetVelocity: Point, axisNormal: Point, dt: number): void {
    if (this.particles.length < 4) {
      return;
    }

    const leftNeighbor = this.particles[1];
    const rightNeighbor = this.particles[this.particles.length - 2];
    const leftImpulse = scalePoint(sourceVelocity, ROPE_SIMULATION_CONFIG.endpointVelocityInfluence * dt);
    const rightImpulse = scalePoint(targetVelocity, ROPE_SIMULATION_CONFIG.endpointVelocityInfluence * dt);
    const leftSway = scalePoint(
      axisNormal,
      dot(sourceVelocity, axisNormal) * ROPE_SIMULATION_CONFIG.endpointSwayInfluence * dt,
    );
    const rightSway = scalePoint(
      axisNormal,
      dot(targetVelocity, axisNormal) * ROPE_SIMULATION_CONFIG.endpointSwayInfluence * dt,
    );

    leftNeighbor.current = addPoints(leftNeighbor.current, addPoints(leftImpulse, leftSway));
    rightNeighbor.current = addPoints(rightNeighbor.current, addPoints(rightImpulse, rightSway));
  }

  private integrateInternalParticles(dt: number): void {
    const gravity = ROPE_SIMULATION_CONFIG.gravity;
    const damping = ROPE_SIMULATION_CONFIG.damping;

    for (let i = 1; i < this.particles.length - 1; i++) {
      const particle = this.particles[i];
      const velocity = scalePoint(subtractPoints(particle.current, particle.previous), damping);
      const previous = particle.current;

      particle.current = {
        x: particle.current.x + velocity.x,
        y: particle.current.y + velocity.y + gravity * dt * dt,
      };
      particle.previous = previous;
    }
  }

  private solveConstraints(sourcePoint: Point, targetPoint: Point): void {
    const restLength = getDistance(sourcePoint, targetPoint) + ROPE_SIMULATION_CONFIG.slack;
    const segmentLength = restLength / ROPE_SIMULATION_CONFIG.segments;
    const iterations = ROPE_SIMULATION_CONFIG.constraintIterations;

    for (let iteration = 0; iteration < iterations; iteration++) {
      this.applyEndpointPins(sourcePoint, targetPoint);

      for (let i = 0; i < this.particles.length - 1; i++) {
        const a = this.particles[i];
        const b = this.particles[i + 1];
        const delta = subtractPoints(b.current, a.current);
        const distance = Math.hypot(delta.x, delta.y) || 1;
        const error = (distance - segmentLength) / distance;
        const correction = scalePoint(delta, error);

        if (i !== 0) {
          a.current = addPoints(a.current, scalePoint(correction, 0.5));
        }
        if (i + 1 !== this.particles.length - 1) {
          b.current = subtractPoints(b.current, scalePoint(correction, 0.5));
        }
      }
    }
  }

  private getSourceHandlePoint(): Point {
    const nodePoint = this.leftPoint();
    return {
      x: nodePoint.x + DEFAULT_NODE_SIZE.width + HANDLE_RADIUS_WITH_STROKE,
      y: nodePoint.y + DEFAULT_NODE_SIZE.height / 2,
    };
  }

  private getTargetHandlePoint(): Point {
    const nodePoint = this.rightPoint();
    return {
      x: nodePoint.x - HANDLE_RADIUS_WITH_STROKE,
      y: nodePoint.y + DEFAULT_NODE_SIZE.height / 2,
    };
  }
}

function createRopeCurveFactory(): CurveFactory {
  return (params) => {
    const ropeSamples = getRopeSamples(params);
    if (ropeSamples.length < 2) {
      return {
        path: `M${params.sourcePoint.x},${params.sourcePoint.y} L${params.targetPoint.x},${params.targetPoint.y}`,
      };
    }

    const path = buildSmoothPath(ropeSamples);

    return {
      path,
      labelPoints: {
        start: pointOnPolylineByRatio(ropeSamples, 0.1),
        center: pointOnPolylineByRatio(ropeSamples, 0.5),
        end: pointOnPolylineByRatio(ropeSamples, 0.9),
      },
    };
  };
}

function getRopeSamples(params: CurveFactoryParams): Point[] {
  if (params.mode !== 'edge') {
    return buildFallbackSamples(params.sourcePoint, params.targetPoint);
  }

  const dataSignal = params.edge.data as WritableSignal<RopeCurveEdgeData> | undefined;
  const samples = dataSignal?.()?.ropeState.samples ?? [];

  return samples.length > 1 ? samples : buildFallbackSamples(params.sourcePoint, params.targetPoint);
}

function buildFallbackSamples(sourcePoint: Point, targetPoint: Point): Point[] {
  const mid = lerpPoint(sourcePoint, targetPoint, 0.5);
  const distance = getDistance(sourcePoint, targetPoint);
  const sag = clamp(10 + distance * 0.02, 10, 28);

  return [sourcePoint, { x: mid.x, y: mid.y + sag }, targetPoint];
}

function buildSmoothPath(points: Point[]): string {
  if (points.length < 2) {
    return '';
  }

  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mid = lerpPoint(points[i], points[i + 1], 0.5);
    path += ` Q${points[i].x},${points[i].y} ${mid.x},${mid.y}`;
  }

  const last = points[points.length - 1];
  path += ` L${last.x},${last.y}`;
  return path;
}

function getDistance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointOnPolylineByRatio(points: Point[], ratio: number): Point {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  if (points.length === 1) {
    return points[0];
  }

  const t = clamp(ratio, 0, 1);
  let totalLength = 0;
  const segmentLengths: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const length = getDistance(points[i], points[i + 1]);
    segmentLengths.push(length);
    totalLength += length;
  }

  if (totalLength === 0) {
    return points[0];
  }

  const targetLength = totalLength * t;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const next = accumulated + segmentLengths[i];
    if (targetLength <= next) {
      const localT = segmentLengths[i] === 0 ? 0 : (targetLength - accumulated) / segmentLengths[i];
      return lerpPoint(points[i], points[i + 1], localT);
    }
    accumulated = next;
  }

  return points[points.length - 1];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerpPoint(a: Point, b: Point, ratio: number): Point {
  const t = clamp(ratio, 0, 1);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function subtractPoints(a: Point, b: Point): Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

function addPoints(a: Point, b: Point): Point {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function scalePoint(point: Point, scale: number): Point {
  return {
    x: point.x * scale,
    y: point.y * scale,
  };
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function getVelocity(previousPoint: Point, currentPoint: Point, dt: number): Point {
  if (dt <= 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (currentPoint.x - previousPoint.x) / dt,
    y: (currentPoint.y - previousPoint.y) / dt,
  };
}

function getNormal(a: Point, b: Point): Point {
  const direction = subtractPoints(b, a);
  const length = Math.hypot(direction.x, direction.y) || 1;
  return {
    x: -direction.y / length,
    y: direction.x / length,
  };
}
