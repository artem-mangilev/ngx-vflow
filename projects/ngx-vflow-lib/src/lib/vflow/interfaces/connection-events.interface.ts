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
  node: Node;
  handle: Handle;
}

export interface ConnectEndEvent {
  from: {
    node: Node;
    handle: Handle;
  };
  to: {
    node: Node | null;
    handle: Handle | null;
  };
}

export interface ReconnectStartEvent {
  edge: Edge;
  handle: Handle;
}

export interface ReconnectEndEvent {
  edge: Edge;
  // The side where the edge remain attached during reconnection
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
    node: status.payload.source.rawNode,
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

export function connectEndEventFromConnectionDroppedStatus(status: FlowStatusConnectionDropped): ConnectEndEvent {
  return {
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
