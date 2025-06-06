import { Position } from '../types/position.type';
import { EdgeLabelPosition } from './edge-label.interface';
import { Edge } from './edge.interface';
import { DynamicNode, Node } from './node.interface';
import { Point } from './point.interface';

interface CurveFactorySharedParams {
  sourcePoint: Point;
  targetPoint: Point;
  sourcePosition: Position;
  targetPosition: Position;
  allEdges: Edge[];
  allNodes: Node[] | DynamicNode[];
}

interface ConnectionCurveFactoryParams extends CurveFactorySharedParams {
  isConnection: true;
}

interface EdgeCurveFactoryParams extends CurveFactorySharedParams {
  isConnection: false;
  edge: Edge;
}

export interface CurveLayout {
  path: string;
  labelPoints?: { [key in EdgeLabelPosition]: Point };
}

export type CurveFactoryParams = ConnectionCurveFactoryParams | EdgeCurveFactoryParams;

export type CurveFactory = (params: CurveFactoryParams) => CurveLayout;
