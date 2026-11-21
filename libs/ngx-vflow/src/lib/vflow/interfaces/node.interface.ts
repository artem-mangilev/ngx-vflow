import { Signal, signal, Type, WritableSignal, untracked } from '@angular/core';
import { Point } from './point.interface';
import { UnwrapSignal } from '../types/unwrap-signal.type';
import { isDefined } from '../utils/is-defined';
import { DomAttributes } from './dom-attributes.interface';
import { StaticData } from '../types/static-data.type';
import { NodeComponentKey } from './entity-components.interface';

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
 * through the `vNode` or `vEdge` template of the flow.
 */
export type EntityComponentType = Type<unknown> | (() => Promise<Type<unknown>>);

/**
 * The flow never adds signals to a node object. The application may add an optional signal to an existing node
 * later; the flow reads it once it receives a new nodes array.
 */
export interface Node<T = unknown> {
  id: string;
  point: WritableSignal<Point>;
  /** The component that draws the node, or the key it is registered under with `withNodeComponents()`. */
  component?: EntityComponentType | NodeComponentKey;
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

export type NodeWithDefaults<T = unknown> = Omit<Required<Node<T>>, OptionalProperty> & Pick<Node<T>, OptionalProperty>;

/** Wraps the values into signals and fills the defaults; inherited capabilities stay optional. */
export function createNode<T = unknown>(node: StaticNode<T>): NodeWithDefaults<T> {
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

/**
 * Wraps the values of every node into signals and fills the defaults.
 *
 * Without a type argument the data type is the union of the data of the nodes, so nodes of different kinds, such as
 * component nodes with their own data, need no shared type. A type argument names the data type of every node and
 * checks each `data` against it:
 *
 * ```ts
 * createNodes([team, person]); // NodeWithDefaults<Team | Person>[]
 * createNodes<Step>([{ id: '1', point: { x: 0, y: 0 }, data: { title: 'Draft' } }]);
 * ```
 */
export function createNodes<N extends StaticNode>(nodes: N[]): NodeWithDefaults<StaticData<N>>[];
export function createNodes<T>(nodes: StaticNode<T>[]): NodeWithDefaults<T>[];
export function createNodes(nodes: StaticNode[]): NodeWithDefaults[] {
  return nodes.map((node) => createNode(node));
}

/**
 * The node as data: every signal read once, outside any reactive context, so the result goes to `JSON.stringify`
 * or a store, and back through `createNode()`. A field without a signal stays absent, so a content-sized node keeps
 * no measured size. `component` is kept as given: a key serializes, while a class or a factory is dropped by JSON,
 * which a development build warns about.
 */
export function toStaticNode<T>(node: Node<T>): StaticNode<T> {
  return untracked(() => ({
    id: node.id,
    point: node.point(),
    ...(node.component !== undefined ? { component: node.component } : {}),
    ...read('data', node.data),
    ...read('width', node.width),
    ...read('height', node.height),
    ...read('draggable', node.draggable),
    ...read('parentId', node.parentId),
    ...read('extent', node.extent),
    ...read('selected', node.selected),
    ...read('selectable', node.selectable),
    ...read('focusable', node.focusable),
    ...read('ariaLabel', node.ariaLabel),
    ...read('ariaDescription', node.ariaDescription),
    ...read('domAttributes', node.domAttributes),
    ...warnUnserializable(node),
  }));
}

/** Every node as data, see {@link toStaticNode}. */
export function toStaticNodes<T>(nodes: readonly Node<T>[]): StaticNode<T>[] {
  return nodes.map((node) => toStaticNode(node));
}

/** `{ [key]: value }` when the signal exists, nothing otherwise. */
export function read<K extends string, V>(key: K, source: Signal<V> | undefined): { [P in K]?: V } {
  return source ? ({ [key]: source() } as { [P in K]: V }) : {};
}

function warnUnserializable(node: Node): Record<string, never> {
  if ((typeof ngDevMode === 'undefined' || ngDevMode) && typeof node.component === 'function') {
    console.warn(
      `[ngx-vflow] Node "${node.id}" names its component as a class or a factory, which JSON drops. Register it with provideVflow(withNodeComponents({ key: … })) and name the key.`,
    );
  }
  return {};
}
