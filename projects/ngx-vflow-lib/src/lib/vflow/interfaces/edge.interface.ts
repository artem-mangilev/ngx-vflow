import { signal, WritableSignal } from '@angular/core';
import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { EdgeLabel, EdgeLabelPosition } from './edge-label.interface';
import { Marker } from './marker.interface';
import { UnwrapSignal } from '../types/unwrap-signal.type';
import { isDefined } from '../utils/is-defined';

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

interface CreateEdgeOptions {
  useDefaults: boolean;
}

export function createEdge<T>(edge: StaticEdge<T>): Required<Edge<T>>;
export function createEdge<T>(edge: StaticEdge<T>, options: { useDefaults: true }): Required<Edge<T>>;
export function createEdge<T>(edge: StaticEdge<T>, options: { useDefaults: false }): Edge<T>;
export function createEdge<T>(
  edge: StaticEdge<T>,
  options: CreateEdgeOptions = { useDefaults: true },
): Edge<T> | Required<Edge<T>> {
  if (options.useDefaults) {
    return {
      id: edge.id,
      type: edge.type ?? EDGE_DEFAULTS.type,
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
  } else {
    return {
      id: edge.id,
      type: edge.type,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      curve: isDefined(edge.curve) ? signal(edge.curve) : undefined,
      data: isDefined(edge.data) ? (signal(edge.data) as WritableSignal<T>) : undefined,
      edgeLabels: isDefined(edge.edgeLabels) ? signal(edge.edgeLabels) : undefined,
      markers: isDefined(edge.markers) ? signal(edge.markers) : undefined,
      reconnectable: isDefined(edge.reconnectable) ? signal(edge.reconnectable) : undefined,
      floating: isDefined(edge.floating) ? signal(edge.floating) : undefined,
      selected: isDefined(edge.selected) ? signal(edge.selected) : undefined,
    };
  }
}

export function createEdges<T>(edges: StaticEdge<T>[]): Required<Edge<T>>[];
export function createEdges<T>(edges: StaticEdge<T>[], options: { useDefaults: true }): Required<Edge<T>>[];
export function createEdges<T>(edges: StaticEdge<T>[], options: { useDefaults: false }): Edge<T>[];
export function createEdges<T>(
  edges: StaticEdge<T>[],
  options: CreateEdgeOptions = { useDefaults: true },
): Edge<T>[] | Required<Edge<T>>[] {
  if (options.useDefaults) {
    return edges.map((edge) => createEdge(edge, { useDefaults: true }));
  } else {
    return edges.map((edge) => createEdge(edge, { useDefaults: false }));
  }
}
