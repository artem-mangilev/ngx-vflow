import { Position } from '../types/position.type';
import { EdgeLabelPosition } from './edge-label.interface';
import { Edge } from './edge.interface';
import { Node } from './node.interface';
import { Point } from './point.interface';

export interface CurveFactorySharedParams {
  /** Starting point coordinates of the curve */
  sourcePoint: Point;
  /** Ending point coordinates of the curve */
  targetPoint: Point;
  /** Position of the source handle relative to the source node */
  sourcePosition: Position;
  /** Position of the target handle relative to the target node */
  targetPosition: Position;
  /** Array of all edges in the flow */
  allEdges: Edge[];
  /** Array of all nodes in the flow */
  allNodes: Node[];
}

export interface ConnectionCurveFactoryParams extends CurveFactorySharedParams {
  /** Indicates this is a temporary connection being drawn */
  mode: 'connection';
}

export interface EdgeCurveFactoryParams extends CurveFactorySharedParams {
  /** Indicates this is a permanent edge */
  mode: 'edge';
  /** The edge instance this curve belongs to */
  edge: Edge;
}

/**
 * Layout information for a curve
 * */
export interface CurveLayout {
  /** SVG path string defining the curve
   * (d attribute - https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d)
   * */
  path: string;
  /** Optional points for label placement along the curve */
  labelPoints?: { [key in EdgeLabelPosition]: Point };
}

export type CurveFactoryParams = ConnectionCurveFactoryParams | EdgeCurveFactoryParams;

export type CurveFactory = (params: CurveFactoryParams) => CurveLayout;
