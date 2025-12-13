import { signal, WritableSignal } from '@angular/core';
import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { EdgeLabel, EdgeLabelPosition } from './edge-label.interface';
import { Marker } from './marker.interface';
import { UnwrapSignal } from '../types/unwrap-signal.type';

export const EDGE_DEFAULTS = {
  type: 'default' as EdgeType,
  curve: 'bezier' as Curve,
  data: {},
  edgeLabels: {},
  markers: {},
  reconnectable: false,
  floating: false,
  selected: false,
};

export type EdgeType = 'default' | 'template';
export type Curve = 'straight' | 'bezier' | 'smooth-step' | 'step' | CurveFactory;

export interface Edge<T = unknown> extends Connection {
  id: string;
  type?: EdgeType;
  curve?: WritableSignal<Curve>;
  data?: WritableSignal<T>;
  edgeLabels?: WritableSignal<{ [position in EdgeLabelPosition]?: EdgeLabel }>;
  markers?: WritableSignal<{
    start?: Marker;
    end?: Marker;
  }>;
  reconnectable?: WritableSignal<boolean | 'source' | 'target'>;
  floating?: WritableSignal<boolean>;
  selected?: WritableSignal<boolean>;
}

export type StaticEdge<T = unknown> = UnwrapSignal<Edge<T>>;

export function createEdge<T>(edge: StaticEdge<T>): Required<Edge<T>> {
  return {
    type: edge.type ?? EDGE_DEFAULTS.type,
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? '',
    targetHandle: edge.targetHandle ?? '',
    curve: signal(edge.curve ?? EDGE_DEFAULTS.curve),
    data: signal(edge.data ?? EDGE_DEFAULTS.data) as WritableSignal<T>,
    edgeLabels: signal(edge.edgeLabels ?? EDGE_DEFAULTS.edgeLabels),
    markers: signal(edge.markers ?? EDGE_DEFAULTS.markers),
    reconnectable: signal(edge.reconnectable ?? EDGE_DEFAULTS.reconnectable),
    floating: signal(edge.floating ?? EDGE_DEFAULTS.floating),
    selected: signal(edge.selected ?? EDGE_DEFAULTS.selected),
  };
}

export function createEdges<T>(edges: StaticEdge<T>[]): Required<Edge<T>>[] {
  return edges.map(createEdge);
}
