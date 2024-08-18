import { Type, WritableSignal } from "@angular/core"
import { Point } from "./point.interface"
import { CustomNodeComponent } from "../public-components/custom-node.component"
import { CustomDynamicNodeComponent } from "../public-components/custom-dynamic-node.component"

export type Node<T = unknown> =
  DefaultNode |
  HtmlTemplateNode<T> |
  ComponentNode<T>

export type DynamicNode<T = unknown> =
  DefaultDynamicNode |
  HtmlTemplateDynamicNode<T> |
  ComponentDynamicNode<T>

export interface SharedNode {
  id: string
  point: Point
  draggable?: boolean
}

export interface SharedDynamicNode {
  id: string;
  point: WritableSignal<Point>
  draggable?: WritableSignal<boolean>
}

export interface DefaultNode extends SharedNode {
  type: 'default'
  text?: string
  width?: number
  height?: number
}

export interface DefaultDynamicNode extends SharedDynamicNode {
  type: 'default'
  text?: WritableSignal<string>
  width?: WritableSignal<number>
  height?: WritableSignal<number>
}

export interface HtmlTemplateNode<T = unknown> extends SharedNode {
  type: 'html-template'
  data?: T
}

export interface HtmlTemplateDynamicNode<T = unknown> extends SharedDynamicNode {
  type: 'html-template'
  data?: WritableSignal<T>
}

export interface ComponentNode<T = unknown> extends SharedNode {
  type: Type<CustomNodeComponent<T>>
  data?: T
}

export interface ComponentDynamicNode<T = unknown> extends SharedDynamicNode {
  type: Type<CustomDynamicNodeComponent<T>>
  data?: WritableSignal<T>
}

export function isStaticNode<T>(node: Node | DynamicNode): node is Node<T> {
  return typeof node.point !== 'function'
}

export function isDynamicNode<T>(node: Node | DynamicNode): node is DynamicNode<T> {
  return typeof node.point === 'function'
}

export function isComponentStaticNode<T>(node: Node): node is ComponentNode<T> {
  return CustomNodeComponent.isPrototypeOf(node.type)
}

export function isComponentDynamicNode<T>(node: DynamicNode): node is ComponentDynamicNode<T> {
  return CustomDynamicNodeComponent.isPrototypeOf(node.type)
}

export function isTemplateStaticNode<T>(node: Node): node is HtmlTemplateNode<T> {
  return node.type === 'html-template'
}

export function isTemplateDynamicNode<T>(node: DynamicNode): node is HtmlTemplateDynamicNode<T> {
  return node.type === 'html-template'
}

export function isDefaultStaticNode(node: Node): node is DefaultNode {
  return node.type === 'default'
}

export function isDefaultDynamicNode(node: DynamicNode): node is DefaultDynamicNode {
  return node.type === 'default'
}
