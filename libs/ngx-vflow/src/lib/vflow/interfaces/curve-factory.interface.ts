import { Position } from '../types/position.type';
import { EdgeLabelPoint, EdgeLabelPosition } from './edge-label.interface';
import { Edge } from './edge.interface';
import { Node } from './node.interface';
import { Point } from './point.interface';
import { Rect } from './rect';

/** Rendered geometry of a node in flow space: its absolute position and measured size. */
export interface NodeGeometry extends Rect {
  id: string;
}

export interface CurveFactorySharedParams {
  /** Starting point coordinates of the curve, already moved by `markerInset.start` along the source handle side */
  sourcePoint: Point;
  /** Ending point coordinates of the curve, already moved by `markerInset.end` along the target handle side */
  targetPoint: Point;
  /**
   * Distance by which a path ends short of the arrow tip of its start and end markers, in flow units. A factory
   * that computes its own endpoints applies it itself, for example through `getFloatingEdgeParams`.
   */
  markerInset: { start: number; end: number };
  /** Position of the source handle relative to the source node */
  sourcePosition: Position;
  /** Position of the target handle relative to the target node */
  targetPosition: Position;
  /** Array of all edges in the flow */
  allEdges: Edge[];
  /** Array of all nodes in the flow */
  allNodes: Node[];
}

/** Parameters required to build a straight edge path. */
export type StraightPathParams = Pick<CurveFactorySharedParams, 'sourcePoint' | 'targetPoint'>;

/** Parameters required to build a bezier edge path. */
export type BezierPathParams = Pick<
  CurveFactorySharedParams,
  'sourcePoint' | 'targetPoint' | 'sourcePosition' | 'targetPosition'
> & {
  /** Curve intensity. */
  curvature?: number;
};

/** Parameters required to build a stepped edge path. */
export type SmoothStepPathParams = Pick<
  CurveFactorySharedParams,
  'sourcePoint' | 'targetPoint' | 'sourcePosition' | 'targetPosition'
> & {
  /** Distance from each handle before the first bend. */
  offset?: number;
  /** Corner radius. Use `0` for a step path. */
  borderRadius?: number;
};

export interface ConnectionCurveFactoryParams extends CurveFactorySharedParams {
  /** Indicates this is a temporary connection being drawn */
  mode: 'connection';
  /** The node the connection is dragged from */
  sourceNode: NodeGeometry;
  /** The node of the candidate handle, while the connection snaps to one */
  targetNode?: NodeGeometry;
}

export interface EdgeCurveFactoryParams extends CurveFactorySharedParams {
  /** Indicates this is a permanent edge */
  mode: 'edge';
  /** The edge instance this curve belongs to */
  edge: Edge;
  /** The node of the source handle */
  sourceNode: NodeGeometry;
  /** The node of the target handle */
  targetNode: NodeGeometry;
}

/**
 * Layout information for a curve
 * */
export interface CurveLayout {
  /** SVG path string defining the curve
   * (d attribute - https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d)
   * */
  path: string;
  /** Conservative flow-space bounds for virtualization. Omit to measure custom paths using SVG. */
  bounds?: Rect;
  /**
   * Optional points for label placement along the curve. A point may carry the direction of the path there as
   * `angle`, which labels with `orient: 'path'` follow.
   */
  labelPoints?: { [key in EdgeLabelPosition]: EdgeLabelPoint };
}

export type CurveFactoryParams = ConnectionCurveFactoryParams | EdgeCurveFactoryParams;

export type CurveFactory = (params: CurveFactoryParams) => CurveLayout;
