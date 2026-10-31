import { HandlePosition, HandleType } from '../types/handle-type.type';
import { Connection } from './connection.interface';
import { Edge } from './edge.interface';
import { Node } from './node.interface';

export interface ConnectStartEvent {
  node: Node;
  handle: ConnectionEventHandle;
}

export interface ConnectEndEvent {
  valid: boolean | null;
  /**
   * The side where the connection started from
   */
  from: {
    node: Node;
    handle: ConnectionEventHandle;
  };
  /**
   * The side where the connection ended to
   */
  to: {
    node: Node | null;
    handle: ConnectionEventHandle | null;
  };
}

export interface ReconnectStartEvent {
  edge: Edge;
  node: Node;
  handle: ConnectionEventHandle;
}

/** Matches `EdgeReconnectOperation`, so `reconnectEdges([event], graph)` applies it. */
export interface ReconnectEvent {
  /** The edge as it was before the gesture. */
  edge: Edge;
  connection: Connection;
}

export interface ReconnectEndEvent {
  edge: Edge;
  valid: boolean | null;
  /**
   * The side where the edge remain attached during reconnection
   */
  from: {
    node: Node;
    handle: ConnectionEventHandle;
  };
  /**
   * The side where the edge was reconnected to
   */
  to: {
    node: Node | null;
    handle: ConnectionEventHandle | null;
  };
}

/** A handle as the connection events describe it. */
export interface ConnectionEventHandle {
  id?: string;
  type: HandleType;
  position: HandlePosition;
}
