import { signal, WritableSignal } from '@angular/core';
import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { Marker } from './marker.interface';
import { UnwrapSignal } from '../types/unwrap-signal.type';
import { isDefined } from '../utils/is-defined';
import { DomAttributes } from './dom-attributes.interface';
import { EntityComponentType } from './node.interface';

export const EDGE_DEFAULTS = {
  curve: 'bezier' as Curve,
  data: {},
  markers: {},
  reconnectable: false,
  selected: false,
  interactionWidth: 20,
};

export type Curve = 'straight' | 'bezier' | 'smooth-step' | 'step' | CurveFactory;

export interface Edge<T = unknown> extends Connection {
  id: string;
  /** Component that draws the edge; without it the edge renders through `ng-template[edge]`. */
  component?: EntityComponentType;
  curve?: WritableSignal<Curve>;
  data?: WritableSignal<T>;
  markers?: WritableSignal<{
    start?: Marker;
    end?: Marker;
  }>;
  reconnectable?: WritableSignal<boolean | 'source' | 'target'>;
  selected?: WritableSignal<boolean>;
  /**
   * Width in pixels of the transparent stroke the flow draws along the edge path to make the edge easy to click.
   * `0` removes it; presentation elements can then opt into hit-testing with `pointer-events="stroke"`.
   *
   * @default 20
   */
  interactionWidth?: WritableSignal<number>;
  selectable?: WritableSignal<boolean>;
  focusable?: WritableSignal<boolean>;
  ariaLabel?: WritableSignal<string>;
  ariaDescription?: WritableSignal<string>;
  domAttributes?: WritableSignal<DomAttributes>;
}

export type StaticEdge<T = unknown> = UnwrapSignal<Edge<T>>;

interface CreateEdgeOptions {
  useDefaults: boolean;
}

type OptionalProperty = 'component' | 'selectable' | 'focusable' | 'ariaLabel' | 'ariaDescription' | 'domAttributes';

export type EdgeWithDefaults<T = unknown> = Omit<Required<Edge<T>>, OptionalProperty> & Pick<Edge<T>, OptionalProperty>;

export function createEdge<T>(edge: StaticEdge<T>): EdgeWithDefaults<T>;
export function createEdge<T>(edge: StaticEdge<T>, options: { useDefaults: true }): EdgeWithDefaults<T>;
export function createEdge<T>(edge: StaticEdge<T>, options: { useDefaults: false }): Edge<T>;
export function createEdge<T>(
  edge: StaticEdge<T>,
  options: CreateEdgeOptions = { useDefaults: true },
): Edge<T> | EdgeWithDefaults<T> {
  if (options.useDefaults) {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: isDefined(edge.sourceHandle) ? edge.sourceHandle : '',
      targetHandle: isDefined(edge.targetHandle) ? edge.targetHandle : '',
      ...(isDefined(edge.component) ? { component: edge.component } : {}),
      curve: signal(isDefined(edge.curve) ? edge.curve : EDGE_DEFAULTS.curve),
      data: signal(isDefined(edge.data) ? edge.data : EDGE_DEFAULTS.data) as WritableSignal<T>,
      markers: signal(isDefined(edge.markers) ? edge.markers : EDGE_DEFAULTS.markers),
      reconnectable: signal(isDefined(edge.reconnectable) ? edge.reconnectable : EDGE_DEFAULTS.reconnectable),
      selected: signal(isDefined(edge.selected) ? edge.selected : EDGE_DEFAULTS.selected),
      interactionWidth: signal(
        isDefined(edge.interactionWidth) ? edge.interactionWidth : EDGE_DEFAULTS.interactionWidth,
      ),
      ...(isDefined(edge.selectable) ? { selectable: signal(edge.selectable) } : {}),
      ...(isDefined(edge.focusable) ? { focusable: signal(edge.focusable) } : {}),
      ...(isDefined(edge.ariaLabel) ? { ariaLabel: signal(edge.ariaLabel) } : {}),
      ...(isDefined(edge.ariaDescription) ? { ariaDescription: signal(edge.ariaDescription) } : {}),
      ...(isDefined(edge.domAttributes) ? { domAttributes: signal(edge.domAttributes) } : {}),
    };
  } else {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      ...(isDefined(edge.component) ? { component: edge.component } : {}),
      curve: isDefined(edge.curve) ? signal(edge.curve) : undefined,
      data: isDefined(edge.data) ? (signal(edge.data) as WritableSignal<T>) : undefined,
      markers: isDefined(edge.markers) ? signal(edge.markers) : undefined,
      reconnectable: isDefined(edge.reconnectable) ? signal(edge.reconnectable) : undefined,
      selected: isDefined(edge.selected) ? signal(edge.selected) : undefined,
      interactionWidth: isDefined(edge.interactionWidth) ? signal(edge.interactionWidth) : undefined,
      ...(isDefined(edge.selectable) ? { selectable: signal(edge.selectable) } : {}),
      ...(isDefined(edge.focusable) ? { focusable: signal(edge.focusable) } : {}),
      ...(isDefined(edge.ariaLabel) ? { ariaLabel: signal(edge.ariaLabel) } : {}),
      ...(isDefined(edge.ariaDescription) ? { ariaDescription: signal(edge.ariaDescription) } : {}),
      ...(isDefined(edge.domAttributes) ? { domAttributes: signal(edge.domAttributes) } : {}),
    };
  }
}

export function createEdges<T>(edges: StaticEdge<T>[]): EdgeWithDefaults<T>[];
export function createEdges<T>(edges: StaticEdge<T>[], options: { useDefaults: true }): EdgeWithDefaults<T>[];
export function createEdges<T>(edges: StaticEdge<T>[], options: { useDefaults: false }): Edge<T>[];
export function createEdges<T>(
  edges: StaticEdge<T>[],
  options: CreateEdgeOptions = { useDefaults: true },
): Edge<T>[] | EdgeWithDefaults<T>[] {
  if (options.useDefaults) {
    return edges.map((edge) => createEdge(edge, { useDefaults: true }));
  } else {
    return edges.map((edge) => createEdge(edge, { useDefaults: false }));
  }
}
