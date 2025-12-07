import { signal, WritableSignal } from '@angular/core';
import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { EdgeLabel, EdgeLabelPosition } from './edge-label.interface';
import { Marker } from './marker.interface';

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

export type PlainEdge<T = unknown> = {
  [K in keyof Edge<T>]: Edge<T>[K] extends WritableSignal<infer U> | undefined
    ? Edge<T>[K] extends undefined
      ? U | undefined
      : U
    : Edge<T>[K];
};

export type PrefilledEdge<T = unknown> = Omit<Required<Edge<T>>, 'sourceHandle' | 'targetHandle'> & {
  sourceHandle?: string;
  targetHandle?: string;
};

export function createEdges(edges: PlainEdge[]): PrefilledEdge[] {
  return edges.map((edge) => {
    return {
      ...edge,
      type: edge.type ?? EDGE_DEFAULTS.type,
      curve: signal(edge.curve ?? EDGE_DEFAULTS.curve),
      data: signal(edge.data ?? EDGE_DEFAULTS.data),
      edgeLabels: signal(edge.edgeLabels ?? EDGE_DEFAULTS.edgeLabels),
      markers: signal(edge.markers ?? EDGE_DEFAULTS.markers),
      reconnectable: signal(edge.reconnectable ?? EDGE_DEFAULTS.reconnectable),
      floating: signal(edge.floating ?? EDGE_DEFAULTS.floating),
      selected: signal(edge.selected ?? EDGE_DEFAULTS.selected),
    };
  });
}
