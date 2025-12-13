import { signal, Type, WritableSignal } from '@angular/core';
import { Point } from './point.interface';
import { NodePreview } from './node-preview.interface';
import { isCallable } from '../utils/is-callable';
import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';
import { isCustomNodeComponent } from '../utils/is-vflow-component';
import { UnwrapSignal } from '../types/unwrap-signal.type';

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

export type PlainNode<T = unknown> =
  | UnwrapSignal<DefaultNode>
  | UnwrapSignal<HtmlTemplateNode<T>>
  | UnwrapSignal<SvgTemplateNode<T>>
  | UnwrapSignal<ComponentNode<T>>
  | UnwrapSignal<DefaultGroupNode>
  | UnwrapSignal<TemplateGroupNode<T>>;

export type PrefilledNode<T = unknown> = Required<Node<T>>;

function createBaseNode(node: UnwrapSignal<SharedNode>) {
  return {
    id: node.id,
    point: signal(node.point),
    draggable: signal(node.draggable ?? true),
    parentId: signal(node.parentId ?? null),
    preview: signal(node.preview ?? { style: {} }),
    selected: signal(node.selected ?? false),
  };
}

export function createNode<T>(node: PlainNode<T>): PrefilledNode<T> {
  if (node.type === 'default') {
    return {
      ...createBaseNode(node),
      type: 'default' as const,
      text: signal(node.text ?? ''),
      width: signal(node.width ?? 100),
      height: signal(node.height ?? 50),
    } as PrefilledNode<T>;
  }

  if (node.type === 'html-template') {
    return {
      ...createBaseNode(node),
      type: 'html-template' as const,
      data: signal(node.data ?? ({} as T)),
      width: signal(node.width ?? 150),
      height: signal(node.height ?? 100),
    } as PrefilledNode<T>;
  }

  if (node.type === 'svg-template') {
    return {
      ...createBaseNode(node),
      type: 'svg-template' as const,
      width: signal(node.width ?? 150),
      height: signal(node.height ?? 100),
      data: signal(node.data ?? ({} as T)),
    } as PrefilledNode<T>;
  }

  if (node.type === 'default-group') {
    return {
      ...createBaseNode(node),
      type: 'default-group' as const,
      width: signal(node.width ?? 300),
      height: signal(node.height ?? 200),
      color: signal(node.color ?? '#cccccc'),
      resizable: signal(node.resizable ?? false),
    } as PrefilledNode<T>;
  }

  if (node.type === 'template-group') {
    return {
      ...createBaseNode(node),
      type: 'template-group' as const,
      width: signal(node.width ?? 300),
      height: signal(node.height ?? 200),
      data: signal(node.data ?? ({} as T)),
    } as PrefilledNode<T>;
  }

  if (isCustomNodeComponent(node.type) || isCallable(node.type)) {
    return {
      ...createBaseNode(node),
      type: node.type,
      data: signal(node.data ?? ({} as T)),
      width: signal(node.width ?? 150),
      height: signal(node.height ?? 100),
    } as PrefilledNode<T>;
  }

  throw new Error(`Unknown node type for node with id ${node.id}`);
}

export function createNodes<T = unknown>(nodes: PlainNode<T>[]): PrefilledNode<T>[] {
  return nodes.map(createNode);
}
