import { signal, Type, WritableSignal } from '@angular/core';
import { Point } from './point.interface';
import { NodePreview } from './node-preview.interface';
import { isCallable } from '../utils/is-callable';
import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';
import { isCustomNodeComponent } from '../utils/is-vflow-component';
import { UnwrapSignal } from '../types/unwrap-signal.type';

export const NODE_DEFAULTS = {
  point: { x: 0, y: 0 },
  width: 100,
  height: 50,
  draggable: true,
  parentId: null,
  preview: { style: {} },
  selected: false,
  color: '#1b262c',
  resizable: false,
  text: '',
  data: {},
};

export type Node<T = any> =
  | DefaultNode
  | HtmlTemplateNode<T>
  | SvgTemplateNode<T>
  | ComponentNode<T>
  | DefaultGroupNode
  | TemplateGroupNode<T>;

export interface SharedNode {
  id: string;
  point: WritableSignal<Point>;
  draggable?: WritableSignal<boolean>;
  parentId?: WritableSignal<string | null>;
  preview?: WritableSignal<NodePreview>;
  selected?: WritableSignal<boolean>;
}

export interface DefaultNode extends SharedNode {
  type: 'default';
  text?: WritableSignal<string>;
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
}

export interface HtmlTemplateNode<T = any> extends SharedNode {
  type: 'html-template';
  data?: WritableSignal<T>;
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
}

export interface SvgTemplateNode<T = any> extends SharedNode {
  type: 'svg-template';
  width: WritableSignal<number>;
  height: WritableSignal<number>;
  data?: WritableSignal<T>;
}

export interface DefaultGroupNode extends SharedNode {
  type: 'default-group';
  width: WritableSignal<number>;
  height: WritableSignal<number>;
  color?: WritableSignal<string>;
  resizable?: WritableSignal<boolean>;
}

export interface TemplateGroupNode<T = any> extends SharedNode {
  type: 'template-group';
  width: WritableSignal<number>;
  height: WritableSignal<number>;
  data?: WritableSignal<T>;
}

export interface ComponentNode<T = any> extends SharedNode {
  type: Type<CustomNodeComponent<T>> | (() => Promise<Type<CustomNodeComponent<T>>>);
  data?: WritableSignal<T>;
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
}

export function isComponentNode<T>(node: Node<T>): node is ComponentNode<T> {
  if (isCustomNodeComponent(node.type)) {
    return true;
  }

  // Check if the type is a function with dynamic import
  return isCallable(node.type);
}

export function isTemplateNode<T>(node: Node<T>): node is HtmlTemplateNode<T> {
  return node.type === 'html-template';
}

export function isSvgTemplateNode<T>(node: Node<T>): node is SvgTemplateNode<T> {
  return node.type === 'svg-template';
}

export function isDefaultNode(node: Node): node is DefaultNode {
  return node.type === 'default';
}

export function isDefaultGroupNode(node: Node): node is DefaultGroupNode {
  return node.type === 'default-group';
}

export function isTemplateGroupNode<T>(node: Node<T>): node is TemplateGroupNode<T> {
  return node.type === 'template-group';
}

export type StaticNode<T = unknown> =
  | UnwrapSignal<DefaultNode>
  | UnwrapSignal<HtmlTemplateNode<T>>
  | UnwrapSignal<SvgTemplateNode<T>>
  | UnwrapSignal<ComponentNode<T>>
  | UnwrapSignal<DefaultGroupNode>
  | UnwrapSignal<TemplateGroupNode<T>>;

function createBaseNode(node: UnwrapSignal<SharedNode>) {
  return {
    id: node.id,
    point: signal(node.point),
    draggable: signal(node.draggable ?? NODE_DEFAULTS.draggable),
    parentId: signal(node.parentId ?? NODE_DEFAULTS.parentId),
    preview: signal(node.preview ?? NODE_DEFAULTS.preview),
    selected: signal(node.selected ?? NODE_DEFAULTS.selected),
  };
}

export function createNode<T>(node: StaticNode<T>): Required<Node<T>> {
  if (node.type === 'default') {
    return {
      ...createBaseNode(node),
      type: 'default' as const,
      text: signal(node.text ?? ''),
      width: signal(node.width ?? NODE_DEFAULTS.width),
      height: signal(node.height ?? NODE_DEFAULTS.height),
    };
  }

  if (node.type === 'html-template') {
    return {
      ...createBaseNode(node),
      type: 'html-template' as const,
      data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
      width: signal(node.width ?? NODE_DEFAULTS.width),
      height: signal(node.height ?? NODE_DEFAULTS.height),
    };
  }

  if (node.type === 'svg-template') {
    return {
      ...createBaseNode(node),
      type: 'svg-template' as const,
      width: signal(node.width ?? NODE_DEFAULTS.width),
      height: signal(node.height ?? NODE_DEFAULTS.height),
      data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
    };
  }

  if (node.type === 'default-group') {
    return {
      ...createBaseNode(node),
      type: 'default-group' as const,
      width: signal(node.width ?? NODE_DEFAULTS.width),
      height: signal(node.height ?? NODE_DEFAULTS.height),
      color: signal(node.color ?? NODE_DEFAULTS.color),
      resizable: signal(node.resizable ?? NODE_DEFAULTS.resizable),
    };
  }

  if (node.type === 'template-group') {
    return {
      ...createBaseNode(node),
      type: 'template-group' as const,
      width: signal(node.width ?? NODE_DEFAULTS.width),
      height: signal(node.height ?? NODE_DEFAULTS.height),
      data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
    };
  }

  if (isCustomNodeComponent(node.type) || isCallable(node.type)) {
    return {
      ...createBaseNode(node),
      type: node.type,
      data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
      width: signal(node.width ?? NODE_DEFAULTS.width),
      height: signal(node.height ?? NODE_DEFAULTS.height),
    };
  }

  throw new Error(`Unknown node type for node with id ${node.id}`);
}

export function createNodes<T = unknown>(nodes: StaticNode<T>[]): Required<Node<T>>[] {
  return nodes.map(createNode);
}
