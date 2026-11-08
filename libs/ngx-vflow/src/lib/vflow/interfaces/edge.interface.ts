import { signal, untracked, WritableSignal } from '@angular/core';
import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { MarkerRef } from './marker.interface';
import { UnwrapSignal } from '../types/unwrap-signal.type';
import { isDefined } from '../utils/is-defined';
import { DomAttributes } from './dom-attributes.interface';
import { EntityComponentType, read } from './node.interface';
import { StaticData } from '../types/static-data.type';
import { EdgeComponentKey } from './entity-components.interface';
import { BuiltInCurve, CurveKey } from './curves.interface';

export const EDGE_DEFAULTS = {
  curve: 'bezier' as Curve,
  data: {},
  markers: {},
  reconnectable: false,
  selected: false,
  interactionWidth: 20,
};

/** A built-in curve by name, a factory, or the key of a curve registered with `withCurves()`. */
export type Curve = BuiltInCurve | CurveFactory | CurveKey;

/**
 * The flow never adds signals to an edge object. The application may add an optional signal to an existing edge
 * later; the flow reads it once it receives a new edges array.
 */
export interface Edge<T = unknown> extends Connection {
  id: string;
  /**
   * The component that draws the edge, or the key it is registered under with `withEdgeComponents()`; without it
   * the edge renders through the `vEdge` template.
   */
  component?: EntityComponentType | EdgeComponentKey;
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
   * it in the edge host, or inside the presentation when it has a `g[vEdgeInteractionArea]` group. `0` removes it;
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

/** Properties that stay optional even with defaults; an edge without handle ids connects to the first handles of its nodes. */
type OptionalProperty =
  | 'component'
  | 'sourceHandle'
  | 'targetHandle'
  | 'selectable'
  | 'focusable'
  | 'ariaLabel'
  | 'ariaDescription'
  | 'domAttributes';

export type EdgeWithDefaults<T = unknown> = Omit<Required<Edge<T>>, OptionalProperty> & Pick<Edge<T>, OptionalProperty>;

/** Wraps the values into signals and fills the defaults; inherited capabilities stay optional. */
export function createEdge<T = unknown>(edge: StaticEdge<T>): EdgeWithDefaults<T> {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(isDefined(edge.sourceHandle) ? { sourceHandle: edge.sourceHandle } : {}),
    ...(isDefined(edge.targetHandle) ? { targetHandle: edge.targetHandle } : {}),
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

/**
 * Wraps the values of every edge into signals and fills the defaults.
 *
 * Without a type argument the data type is the union of the data of the edges, so edges of different kinds, such as
 * component edges with their own data, need no shared type. A type argument names the data type of every edge and
 * checks each `data` against it:
 *
 * ```ts
 * createEdges([dependency, label]); // EdgeWithDefaults<Dependency | Label>[]
 * createEdges<Label>([{ id: 'a-b', source: 'a', target: 'b', data: { text: 'reviews' } }]);
 * ```
 */
export function createEdges<E extends StaticEdge>(edges: E[]): EdgeWithDefaults<StaticData<E>>[];
export function createEdges<T>(edges: StaticEdge<T>[]): EdgeWithDefaults<T>[];
export function createEdges(edges: StaticEdge[]): EdgeWithDefaults[] {
  return edges.map((edge) => createEdge(edge));
}

/**
 * The edge as data: every signal read once, outside any reactive context, so the result goes to `JSON.stringify`
 * or a store, and back through `createEdge()`. `component` and `curve` are kept as given: a key or a built-in name
 * serializes, while a class, a factory or a curve function is dropped by JSON, which a development build warns about.
 */
export function toStaticEdge<T>(edge: Edge<T>): StaticEdge<T> {
  return untracked(() => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle !== undefined ? { sourceHandle: edge.sourceHandle } : {}),
    ...(edge.targetHandle !== undefined ? { targetHandle: edge.targetHandle } : {}),
    ...(edge.component !== undefined ? { component: edge.component } : {}),
    ...read('curve', edge.curve),
    ...read('data', edge.data),
    ...read('markers', edge.markers),
    ...read('reconnectable', edge.reconnectable),
    ...read('selected', edge.selected),
    ...read('interactionWidth', edge.interactionWidth),
    ...read('selectable', edge.selectable),
    ...read('focusable', edge.focusable),
    ...read('ariaLabel', edge.ariaLabel),
    ...read('ariaDescription', edge.ariaDescription),
    ...read('domAttributes', edge.domAttributes),
    ...warnUnserializable(edge),
  }));
}

/** Every edge as data, see {@link toStaticEdge}. */
export function toStaticEdges<T>(edges: readonly Edge<T>[]): StaticEdge<T>[] {
  return edges.map((edge) => toStaticEdge(edge));
}

function warnUnserializable(edge: Edge): Record<string, never> {
  if (typeof ngDevMode !== 'undefined' && !ngDevMode) return {};
  if (typeof edge.component === 'function') {
    console.warn(
      `[ngx-vflow] Edge "${edge.id}" names its component as a class or a factory, which JSON drops. Register it with provideVflow(withEdgeComponents({ key: … })) and name the key.`,
    );
  }
  if (typeof untracked(() => edge.curve?.()) === 'function') {
    console.warn(
      `[ngx-vflow] Edge "${edge.id}" has a curve factory, which JSON drops. Register it with provideVflow(withCurves({ key: … })) and name the key.`,
    );
  }
  return {};
}
