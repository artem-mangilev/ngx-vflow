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
 * through the `ng-template[node]` or `ng-template[edge]` presentation of the flow.
 */
export type EntityComponentType = Type<unknown> | (() => Promise<Type<unknown>>);

export interface Node<T = any> {
  id: string;
  point: WritableSignal<Point>;
  component?: EntityComponentType;
  data?: WritableSignal<T>;
  /** With `height`, makes the size explicit; without both, the node follows its measured content. */
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
  draggable?: WritableSignal<boolean>;
  parentId?: WritableSignal<string | null>;
  extent?: WritableSignal<'parent' | null>;
  selected?: WritableSignal<boolean>;
  selectable?: WritableSignal<boolean>;
  focusable?: WritableSignal<boolean>;
  ariaLabel?: WritableSignal<string>;
  ariaDescription?: WritableSignal<string>;
  domAttributes?: WritableSignal<DomAttributes>;
}

export function isComponentNode<T>(node: Node<T>): boolean {
  return node.component !== undefined;
}

export type StaticNode<T = unknown> = UnwrapSignal<Node<T>>;

interface CreateNodeOptions {
  useDefaults: boolean;
}

/** Properties that stay optional even with defaults; `width`/`height` decide the size mode. */
type OptionalProperty =
  'component' | 'width' | 'height' | 'selectable' | 'focusable' | 'ariaLabel' | 'ariaDescription' | 'domAttributes';

export type NodeWithDefaults<T = any> = Omit<Required<Node<T>>, OptionalProperty> & Pick<Node<T>, OptionalProperty>;

function createOptionalProperties(node: StaticNode<unknown>) {
  return {
    ...(isDefined(node.component) ? { component: node.component } : {}),
    ...(isDefined(node.width) ? { width: signal(node.width) } : {}),
    ...(isDefined(node.height) ? { height: signal(node.height) } : {}),
    ...(isDefined(node.selectable) ? { selectable: signal(node.selectable) } : {}),
    ...(isDefined(node.focusable) ? { focusable: signal(node.focusable) } : {}),
    ...(isDefined(node.ariaLabel) ? { ariaLabel: signal(node.ariaLabel) } : {}),
    ...(isDefined(node.ariaDescription) ? { ariaDescription: signal(node.ariaDescription) } : {}),
    ...(isDefined(node.domAttributes) ? { domAttributes: signal(node.domAttributes) } : {}),
  };
}

// Overloads with useDefaults: true (or no options) keep inherited capabilities optional.
export function createNode<T>(node: StaticNode<T>): NodeWithDefaults<T>;
export function createNode<T>(node: StaticNode<T>, options: { useDefaults: true }): NodeWithDefaults<T>;
export function createNode<T>(node: StaticNode<T>, options: { useDefaults: false }): Node<T>;
export function createNode<T>(
  node: StaticNode<T>,
  options: CreateNodeOptions = { useDefaults: true },
): Node<T> | NodeWithDefaults<T> {
  if (options.useDefaults) {
    return {
      id: node.id,
      point: signal(node.point),
      data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
      draggable: signal(isDefined(node.draggable) ? node.draggable : NODE_DEFAULTS.draggable),
      parentId: signal(isDefined(node.parentId) ? node.parentId : NODE_DEFAULTS.parentId),
      extent: signal(isDefined(node.extent) ? node.extent : NODE_DEFAULTS.extent),
      selected: signal(isDefined(node.selected) ? node.selected : NODE_DEFAULTS.selected),
      // No default size: a content-sized node stays `auto` until the application or the resizer sets one.
      ...createOptionalProperties(node),
    };
  }

  return {
    id: node.id,
    point: signal(node.point),
    data: isDefined(node.data) ? (signal(node.data) as WritableSignal<T>) : undefined,
    draggable: isDefined(node.draggable) ? signal(node.draggable) : undefined,
    parentId: isDefined(node.parentId) ? signal(node.parentId) : undefined,
    extent: isDefined(node.extent) ? signal(node.extent) : undefined,
    selected: isDefined(node.selected) ? signal(node.selected) : undefined,
    ...createOptionalProperties(node),
  };
}

export function createNodes<T = unknown>(nodes: StaticNode<T>[]): NodeWithDefaults<T>[];
export function createNodes<T = unknown>(nodes: StaticNode<T>[], options: { useDefaults: true }): NodeWithDefaults<T>[];
export function createNodes<T = unknown>(nodes: StaticNode<T>[], options: { useDefaults: false }): Node<T>[];
export function createNodes<T = unknown>(
  nodes: StaticNode<T>[],
  options: CreateNodeOptions = { useDefaults: true },
): Node<T>[] | NodeWithDefaults<T>[] {
  if (options.useDefaults) {
    return nodes.map((node) => createNode(node, { useDefaults: true }));
  } else {
    return nodes.map((node) => createNode(node, { useDefaults: false }));
  }
}
