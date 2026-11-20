import { ConnectionEndpoint } from './connection-events.interface';
import { Curve, Edge } from './edge.interface';
import { MarkerRef } from './marker.interface';
import { Node } from './node.interface';

/**
 * A connection the gesture would make, as the validator sees it: both ends with their nodes and handles, in the
 * roles they would have in the edge. A connection dragged from a `target` handle onto a `source` handle arrives
 * reversed, like the `Connection` the flow reports.
 */
export interface ConnectionForValidation<N extends Node = Node, E extends Edge = Edge> {
  /** The end the edge would start from. */
  source: ConnectionEndpoint<N>;
  /** The end the edge would lead to. */
  target: ConnectionEndpoint<N>;
  /**
   * The edge whose end is being dragged, as it is before the gesture; absent while a new connection is drawn. The
   * connection would replace this edge, so a rule that counts the edges of a handle or a node leaves it out.
   */
  reconnectedEdge?: E;
}

export type ConnectionValidatorFn<N extends Node = Node, E extends Edge = Edge> = (
  connection: ConnectionForValidation<N, E>,
) => boolean;

/**
 * Settings of the connection gesture. The preview renders the `vConnection` template when one is declared. `N` and
 * `E` are the node and edge types the validator reads; the flow infers them from its `nodes` and `edges`.
 */
export interface ConnectionSettings<N extends Node = Node, E extends Edge = Edge> {
  curve?: Curve;
  /**
   * Says whether the gesture may make a connection. It runs for the handle under the pointer and again on the
   * release, for a new connection and for a reconnected edge alike, after the built-in rules accepted the connection.
   */
  validator?: ConnectionValidatorFn<N, E>;
  /** End marker of the connection line, see `MarkerRef`. The line has no start marker. */
  markerEnd?: MarkerRef;
  /** Lets the gesture connect a node to itself. Default: false. */
  allowSelfConnections?: boolean;
  /**
   * Lets the gesture create a connection between handles that an edge already connects. Default: false.
   * `addEdges` accepts duplicates either way.
   */
  allowDuplicateConnections?: boolean;
}
