import { Point } from '../interfaces/point.interface';

export type NodeChange = NodePositionChange | NodeSizeChange | NodeAddChange | NodeRemoveChange | NodeSelectedChange;

export interface NodePositionChange extends NodeChangeShared {
  type: 'position';
  point: Point;
}

export interface NodeSizeChange extends NodeChangeShared {
  type: 'size';
  size: { width: number; height: number };
}

export interface NodeAddChange extends NodeChangeShared {
  type: 'add';
}

export interface NodeRemoveChange extends NodeChangeShared {
  type: 'remove';
}

export interface NodeSelectedChange extends NodeChangeShared {
  type: 'select';
  selected: boolean;
}

interface NodeChangeShared {
  id: string;
}
