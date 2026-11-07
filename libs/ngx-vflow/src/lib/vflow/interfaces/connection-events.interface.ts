import { HandlePosition, HandleType } from '../types/handle-type.type';
import { Connection } from './connection.interface';
import { Edge } from './edge.interface';
import { Node } from './node.interface';

/** A handle as the connection events describe it. */
export interface ConnectionEventHandle {
  /** The `handleId` of the handle; a handle without one has none. */
  id?: string;
  type: HandleType;
  position: HandlePosition;
}

/** One end of a connection gesture: the node and the handle on it. */
export interface ConnectionEventEndpoint<N extends Node = Node> {
  node: N;
  handle: ConnectionEventHandle;
}

/**
 * How a connection gesture ended. Released on a handle that accepts connections, `to` is that handle and `valid`
 * says whether the connection passed validation; released anywhere else, both are `null`.
 */
export type ConnectionEventOutcome<N extends Node = Node> =
  { valid: null; to: null } | { valid: boolean; to: ConnectionEventEndpoint<N> };

export interface ConnectStartEvent<N extends Node = Node> {
  node: N;
  handle: ConnectionEventHandle;
}

/** Payload of `(connectEnd)`: where the connection started from, and where it was released. */
export type ConnectEndEvent<N extends Node = Node> = {
  /** The side where the connection started from. */
  from: ConnectionEventEndpoint<N>;
} & ConnectionEventOutcome<N>;

export interface ReconnectStartEvent<N extends Node = Node, E extends Edge = Edge> {
  edge: E;
  node: N;
  handle: ConnectionEventHandle;
}

/** Matches `EdgeReconnectOperation`, so `reconnectEdges([event], graph)` applies it. */
export interface ReconnectEvent<E extends Edge = Edge> {
  /** The edge as it was before the gesture. */
  edge: E;
  connection: Connection;
}

/** Payload of `(reconnectEnd)`: the end that stayed attached, and where the other end was released. */
export type ReconnectEndEvent<N extends Node = Node, E extends Edge = Edge> = {
  edge: E;
  /** The side where the edge remained attached during the reconnection. */
  from: ConnectionEventEndpoint<N>;
} & ConnectionEventOutcome<N>;
