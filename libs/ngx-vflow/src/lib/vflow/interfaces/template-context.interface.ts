import { Signal } from '@angular/core';

import { NodeRef } from '../utils/inject-node';
import { EdgeRef } from '../utils/inject-edge';

/** Context of a `vEdge` template: `let ctx` is the {@link EdgeRef}. */
export interface EdgeContext<T = any> {
  $implicit: EdgeRef<T>;
}

/** Context of a `vNode` template: `let ctx` is the {@link NodeRef}. */
export interface NodeContext<T = any> {
  $implicit: NodeRef<T>;
}

/** What a `vConnection` template reads about the connection in progress. */
export interface ConnectionRef {
  /** Path of the connection line; `null` before the gesture has a path. */
  path: Signal<string | null>;
  /** The `url(#…)` reference of the end marker, from the `markerEnd` connection setting. */
  markerEnd: Signal<string>;
}

/** Context of a `vConnection` template: `let ctx` is the {@link ConnectionRef}. */
export interface ConnectionContext {
  $implicit: ConnectionRef;
}
