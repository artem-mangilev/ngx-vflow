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

export function isDynamicNode(node: Node | DynamicNode): node is DynamicNode {
  return typeof node.point === 'function'
}

export function isComponentNode<T>(node: Node): node is ComponentNode<T>
export function isComponentNode<T>(node: DynamicNode): node is ComponentDynamicNode<T>
export function isComponentNode(node: Node | DynamicNode) {
  return CustomNodeComponent.isPrototypeOf(node.type) ||
    CustomDynamicNodeComponent.isPrototypeOf(node.type)
}

export function isTemplateNode<T>(node: Node): node is ComponentNode<T>
export function isTemplateNode<T>(node: DynamicNode): node is ComponentDynamicNode<T>
export function isTemplateNode(node: Node | DynamicNode) {
  return node.type === 'html-template'
}

