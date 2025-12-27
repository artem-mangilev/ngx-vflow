import {
  FlowStatusConnectionDropped,
  FlowStatusConnectionEnd,
  FlowStatusConnectionStart,
  FlowStatusReconnectionDropped,
  FlowStatusReconnectionEnd,
  FlowStatusReconnectionStart,
} from '../services/flow-status.service';
import { HandleType } from '../types/handle-type.type';
import { Position } from '../types/position.type';
import { Edge } from './edge.interface';
import { Node } from './node.interface';

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

export interface ReconnectStartEvent {
  edge: Edge;
  handle: Handle;
}

export interface ReconnectEndEvent {
  edge: Edge;
  from: {
    node: Node;
    handle: Handle;
  };
  to: {
    node: Node | null;
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

export function reconnectStartEventFromReconnectionStartStatus(
  status: FlowStatusReconnectionStart,
): ReconnectStartEvent {
  return {
    edge: status.payload.oldEdge.edge,
    handle: {
      id: status.payload.sourceHandle.rawHandle.id,
      type: status.payload.sourceHandle.rawHandle.type,
      position: status.payload.sourceHandle.rawHandle.position,
    },
  };
}

export function reconnectEndEventFromReconnectionEndStatus(status: FlowStatusReconnectionEnd): ReconnectEndEvent {
  return {
    edge: status.payload.oldEdge.edge,
    from: {
      node: status.payload.source.rawNode,
      handle: {
        id: status.payload.sourceHandle.rawHandle.id,
        type: status.payload.sourceHandle.rawHandle.type,
        position: status.payload.sourceHandle.rawHandle.position,
      },
    },
    to: {
      node: status.payload.target.rawNode,
      handle: {
        id: status.payload.targetHandle.rawHandle.id,
        type: status.payload.targetHandle.rawHandle.type,
        position: status.payload.targetHandle.rawHandle.position,
      },
    },
  };
}

export function reconnectEndEventFromReconnectionDroppedStatus(
  status: FlowStatusReconnectionDropped,
): ReconnectEndEvent {
  return {
    edge: status.payload.oldEdge.edge,
    from: {
      node: status.payload.source.rawNode,
      handle: {
        id: status.payload.sourceHandle.rawHandle.id,
        type: status.payload.sourceHandle.rawHandle.type,
        position: status.payload.sourceHandle.rawHandle.position,
      },
    },
    to: {
      node: null,
      handle: null,
    },
  };
}
