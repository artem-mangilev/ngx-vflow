import { signal, Type, WritableSignal } from '@angular/core';
import { Point } from './point.interface';
import { UnwrapSignal } from '../types/unwrap-signal.type';
import { isDefined } from '../utils/is-defined';
import { DomAttributes } from './dom-attributes.interface';

export const NODE_DEFAULTS = {
  point: { x: 0, y: 0 },
  width: 100,
  height: 50,
  draggable: true,
  parentId: null,
  extent: 'parent' as const,
  selected: false,
  data: {},
};

/**
 * A component class, or a factory that lazily imports one. Nodes and edges without a component render
 * through the `ng-template[vNode]` or `ng-template[vEdge]` presentation of the flow.
 */
export type EntityComponentType = Type<unknown> | (() => Promise<Type<unknown>>);

/**
 * The flow never adds signals to a node object. The application may add an optional signal to an existing node
 * later; the flow reads it once it receives a new nodes array.
 */
export interface Node<T = any> {
  id: string;
  point: WritableSignal<Point>;
  component?: EntityComponentType;
  data?: WritableSignal<T>;
  /**
   * Fixed width; without it the width follows the content. Only a resize gesture writes it, never measurement:
   * read the rendered size with `VflowComponent.getNodeRect()`.
   */
  width?: WritableSignal<number>;
  /** Fixed height; without it the height follows the content. Written like {@link width}. */
  height?: WritableSignal<number>;
  draggable?: WritableSignal<boolean>;
  parentId?: WritableSignal<string | null>;
  extent?: WritableSignal<'parent' | null>;
  /** Without it the flow holds the selection itself and reports it through `nodesChanges`. */
  selected?: WritableSignal<boolean>;
  selectable?: WritableSignal<boolean>;
  focusable?: WritableSignal<boolean>;
  ariaLabel?: WritableSignal<string>;
  ariaDescription?: WritableSignal<string>;
  domAttributes?: WritableSignal<DomAttributes>;
}

export type StaticNode<T = unknown> = UnwrapSignal<Node<T>>;

/** Properties that stay optional even with defaults; `width`/`height` decide the size mode. */
type OptionalProperty =
  'component' | 'width' | 'height' | 'selectable' | 'focusable' | 'ariaLabel' | 'ariaDescription' | 'domAttributes';

export type NodeWithDefaults<T = any> = Omit<Required<Node<T>>, OptionalProperty> & Pick<Node<T>, OptionalProperty>;

/** Wraps the values into signals and fills the defaults; inherited capabilities stay optional. */
export function createNode<T>(node: StaticNode<T>): NodeWithDefaults<T> {
  return {
    id: node.id,
    point: signal(node.point),
    data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
    draggable: signal(isDefined(node.draggable) ? node.draggable : NODE_DEFAULTS.draggable),
    parentId: signal(isDefined(node.parentId) ? node.parentId : NODE_DEFAULTS.parentId),
    extent: signal(isDefined(node.extent) ? node.extent : NODE_DEFAULTS.extent),
    selected: signal(isDefined(node.selected) ? node.selected : NODE_DEFAULTS.selected),
    ...(isDefined(node.component) ? { component: node.component } : {}),
    // No default size: a content-sized node stays `auto` until the application or the resizer sets one.
    ...(isDefined(node.width) ? { width: signal(node.width) } : {}),
    ...(isDefined(node.height) ? { height: signal(node.height) } : {}),
    ...(isDefined(node.selectable) ? { selectable: signal(node.selectable) } : {}),
    ...(isDefined(node.focusable) ? { focusable: signal(node.focusable) } : {}),
    ...(isDefined(node.ariaLabel) ? { ariaLabel: signal(node.ariaLabel) } : {}),
    ...(isDefined(node.ariaDescription) ? { ariaDescription: signal(node.ariaDescription) } : {}),
    ...(isDefined(node.domAttributes) ? { domAttributes: signal(node.domAttributes) } : {}),
  };
}

export function createNodes<T = unknown>(nodes: StaticNode<T>[]): NodeWithDefaults<T>[] {
  return nodes.map((node) => createNode(node));
}
