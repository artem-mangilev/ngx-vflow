import { signal, WritableSignal } from '@angular/core';
import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { MarkerRef } from './marker.interface';
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

/**
 * The flow never adds signals to an edge object. The application may add an optional signal to an existing edge
 * later; the flow reads it once it receives a new edges array.
 */
export interface Edge<T = unknown> extends Connection {
  id: string;
  /** Component that draws the edge; without it the edge renders through `ng-template[vEdge]`. */
  component?: EntityComponentType;
  curve?: WritableSignal<Curve>;
  data?: WritableSignal<T>;
  /** Markers of the edge ends: built-in arrows or shapes the application declares, see `MarkerRef`. */
  markers?: WritableSignal<{
    start?: MarkerRef;
    end?: MarkerRef;
  }>;
  reconnectable?: WritableSignal<boolean | 'source' | 'target'>;
  /** Without it the flow holds the selection itself and reports it through `edgesChanges`. */
  selected?: WritableSignal<boolean>;
  /**
   * Width in pixels of the transparent stroke along the edge path that makes the edge easy to click. The flow draws
   * it in the edge host, or inside the presentation when it has a `g[vEdgeInteraction]` group. `0` removes it;
   * presentation elements can then opt into hit-testing with `pointer-events="stroke"`.
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

type OptionalProperty = 'component' | 'selectable' | 'focusable' | 'ariaLabel' | 'ariaDescription' | 'domAttributes';

export type EdgeWithDefaults<T = unknown> = Omit<Required<Edge<T>>, OptionalProperty> & Pick<Edge<T>, OptionalProperty>;

/** Wraps the values into signals and fills the defaults; inherited capabilities stay optional. */
export function createEdge<T>(edge: StaticEdge<T>): EdgeWithDefaults<T> {
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
    interactionWidth: signal(isDefined(edge.interactionWidth) ? edge.interactionWidth : EDGE_DEFAULTS.interactionWidth),
    ...(isDefined(edge.selectable) ? { selectable: signal(edge.selectable) } : {}),
    ...(isDefined(edge.focusable) ? { focusable: signal(edge.focusable) } : {}),
    ...(isDefined(edge.ariaLabel) ? { ariaLabel: signal(edge.ariaLabel) } : {}),
    ...(isDefined(edge.ariaDescription) ? { ariaDescription: signal(edge.ariaDescription) } : {}),
    ...(isDefined(edge.domAttributes) ? { domAttributes: signal(edge.domAttributes) } : {}),
  };
}

export function createEdges<T>(edges: StaticEdge<T>[]): EdgeWithDefaults<T>[] {
  return edges.map((edge) => createEdge(edge));
}
