import { InjectionToken, Signal, inject } from '@angular/core';
import { Node } from '../interfaces/node.interface';

/**
 * What a node presentation reads about its node. A component node gets it through {@link injectNode};
 * an `ng-template[vNode]` presentation gets the same object as its template context.
 */
export interface NodeRef<T = any> {
  node: Node<T>;
  data: Signal<T>;
  selected: Signal<boolean>;
  preselected: Signal<boolean>;
  /** Rendered size: the measured box, which equals an explicit size unless CSS min/max clamps it. */
  width: Signal<number>;
  height: Signal<number>;
  shouldLoad: Signal<boolean>;
}

export const NODE_REF = new InjectionToken<NodeRef>('NODE_REF');

/** Returns the node a component or template presentation is rendered for. */
export function injectNode<T = any>(): NodeRef<T> {
  return inject(NODE_REF) as NodeRef<T>;
}
