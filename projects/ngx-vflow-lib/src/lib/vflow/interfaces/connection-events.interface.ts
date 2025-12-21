import {
  FlowStatusConnectionDropped,
  FlowStatusConnectionEnd,
  FlowStatusConnectionStart,
} from '../services/flow-status.service';
import { HandleType } from '../types/handle-type.type';
import { Position } from '../types/position.type';

export interface ConnectStartEvent {
  nodeId: string;
  handle: Handle;
}

export interface ConnectEndEvent {
  from: {
    nodeId: string;
    handle: Handle;
  };
  to: {
    nodeId: string | null;
    handle: Handle | null;
  };
}

interface Handle {
  id?: string;
  type: HandleType;
  position: Position;
}

export function connectStartEventFromConnectionStartStatus(status: FlowStatusConnectionStart): ConnectStartEvent {
  return {
    nodeId: status.payload.source.rawNode.id,
    handle: {
      id: status.payload.sourceHandle.rawHandle.id,
      type: status.payload.sourceHandle.rawHandle.type,
      position: status.payload.sourceHandle.rawHandle.position,
    },
  };
}

export function connectEndEventFromConnectionEndStatus(status: FlowStatusConnectionEnd): ConnectEndEvent {
  return {
    from: {
      nodeId: status.payload.source.rawNode.id,
      handle: {
        id: status.payload.sourceHandle.rawHandle.id,
        type: status.payload.sourceHandle.rawHandle.type,
        position: status.payload.sourceHandle.rawHandle.position,
      },
    },
    to: {
      nodeId: status.payload.target.rawNode.id,
      handle: {
        id: status.payload.targetHandle.rawHandle.id,
        type: status.payload.targetHandle.rawHandle.type,
        position: status.payload.targetHandle.rawHandle.position,
      },
    },
  };
}

export function connectEndEventFromConnectionDroppedStatus(status: FlowStatusConnectionDropped): ConnectEndEvent {
  return {
    from: {
      nodeId: status.payload.source.rawNode.id,
      handle: {
        id: status.payload.sourceHandle.rawHandle.id,
        type: status.payload.sourceHandle.rawHandle.type,
        position: status.payload.sourceHandle.rawHandle.position,
      },
    },
    to: {
      nodeId: null,
      handle: null,
    },
  };
}
