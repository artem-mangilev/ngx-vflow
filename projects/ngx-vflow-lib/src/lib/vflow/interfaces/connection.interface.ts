import { Edge } from './edge.interface';

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ReconnectionEvent {
  newConnection: Connection;
  oldEdge: Edge;
}
