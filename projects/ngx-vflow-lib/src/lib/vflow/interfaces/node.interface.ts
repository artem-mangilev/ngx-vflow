import { Type, WritableSignal } from '@angular/core';
import { Point } from './point.interface';
import { NodePreview } from './node-preview.interface';
import { isCallable } from '../utils/is-callable';
import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';
import { isCustomNodeComponent } from '../utils/is-vflow-component';

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
  return isCallable(node.type) && isCallable(node.point);
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
