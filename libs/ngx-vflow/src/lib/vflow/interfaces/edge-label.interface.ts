import { Point } from './point.interface';

/** Point of the edge path where an `edgeLabel` template renders; a curve provides the points as `labelPoints`. */
export type EdgeLabelPosition = 'start' | 'center' | 'end';

/** How a label sits at its point: level with the screen, or turned along the path. */
export type EdgeLabelOrient = 'horizontal' | 'path';

/** A label point of a curve, with the direction of the path there. */
export interface EdgeLabelPoint extends Point {
  /**
   * Direction of the path at the point, in degrees of flow space: `0` points right, `90` points down. Optional; a
   * curve without it renders every label horizontally.
   */
  angle?: number;
}
