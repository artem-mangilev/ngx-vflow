import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';
import { toFlowPoint } from './viewport-transform';

/** A view as the flow-space center of a square window and the window's size in flow units. */
type View = [centerX: number, centerY: number, size: number];

const RHO = Math.SQRT2;
const RHO2 = 2;
const RHO4 = 4;
const EPSILON2 = 1e-12;

/**
 * Smooth zooming and panning between two views after van Wijk and Nuij, "Smooth and efficient zooming and panning"
 * (2003), with the curvature ρ = √2. When the centers coincide the size changes exponentially.
 */
export function interpolateView(from: View, to: View): (t: number) => View {
  const [ux0, uy0, w0] = from;
  const [ux1, uy1, w1] = to;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;

  if (d2 < EPSILON2) {
    const s = Math.log(w1 / w0) / RHO;
    return (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(RHO * t * s)];
  }

  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + RHO4 * d2) / (2 * w0 * RHO2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - RHO4 * d2) / (2 * w1 * RHO2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const s = (r1 - r0) / RHO;
  const coshR0 = Math.cosh(r0);

  return (t) => {
    const u = (w0 / (RHO2 * d1)) * (coshR0 * Math.tanh(RHO * t * s + r0) - Math.sinh(r0));
    return [ux0 + u * dx, uy0 + u * dy, (w0 * coshR0) / Math.cosh(RHO * t * s + r0)];
  };
}

export function easeCubicInOut(t: number): number {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

/**
 * Interpolates between two viewports around the pane point `anchor`; `size` is the larger pane dimension.
 * The end value is exact.
 */
export function interpolateViewport(
  from: ViewportState,
  to: ViewportState,
  anchor: Point,
  size: number,
): (t: number) => ViewportState {
  const a = toFlowPoint(from, anchor);
  const b = toFlowPoint(to, anchor);
  const view = interpolateView([a.x, a.y, size / from.zoom], [b.x, b.y, size / to.zoom]);

  return (t) => {
    if (t >= 1) return to;
    const [x, y, w] = view(t);
    const zoom = size / w;
    return { zoom, x: anchor.x - x * zoom, y: anchor.y - y * zoom };
  };
}
