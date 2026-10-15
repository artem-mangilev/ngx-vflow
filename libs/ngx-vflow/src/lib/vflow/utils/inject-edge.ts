import { InjectionToken, Signal, inject } from '@angular/core';
import type { Edge } from '../interfaces/edge.interface';

/**
 * What an edge presentation reads about its edge. An edge component gets it through {@link injectEdge};
 * an `ng-template[vEdge]` presentation gets the same object as its template context.
 *
 * The data type defaults to `any` because a template context cannot take a type argument: `let-ctx` reads
 * `ctx.data()` untyped. Code passes the type to `injectEdge<T>()`, which defaults to `unknown`.
 */
export interface EdgeRef<T = any> {
  edge: Edge<T>;
  data: Signal<T>;
  path: Signal<string>;
  markerStart: Signal<string>;
  markerEnd: Signal<string>;
  selected: Signal<boolean>;
  preselected: Signal<boolean>;
  shouldLoad: Signal<boolean>;
}

export const EDGE_REF = new InjectionToken<EdgeRef>('EDGE_REF');

/** Returns the edge a component or template presentation is rendered for. */
export function injectEdge<T = unknown>(): EdgeRef<T> {
  return inject(EDGE_REF) as EdgeRef<T>;
}
