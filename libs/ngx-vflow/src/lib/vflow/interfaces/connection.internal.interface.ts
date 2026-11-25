import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';

export interface ConnectionInternal {
  source: NodeModel;
  target: NodeModel;
  sourceHandle: HandleModel;
  targetHandle: HandleModel;
}
