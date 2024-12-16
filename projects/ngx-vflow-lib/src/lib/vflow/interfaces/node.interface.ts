import { Type, WritableSignal } from "@angular/core"
import { Point } from "./point.interface"
import { CustomNodeComponent } from "../public-components/custom-node/custom-node.component"
import { CustomDynamicNodeComponent } from "../public-components/custom-dynamic-node/custom-dynamic-node.component"

export type Node<T = any> =
  DefaultNode |
  HtmlTemplateNode<T> |
  ComponentNode<T> |
  DefaultGroupNode |
  TemplateGroupNode<T>

export type DynamicNode<T = any> =
  DefaultDynamicNode |
  HtmlTemplateDynamicNode<T> |
  ComponentDynamicNode<T> |
  DefaultDynamicGroupNode |
  TemplateDynamicGroupNode<T>

export interface SharedNode {
  id: string
  point: Point
  draggable?: boolean
  parentId?: string | null
}

export interface SharedDynamicNode {
  id: string;
  point: WritableSignal<Point>
  draggable?: WritableSignal<boolean>
  parentId?: WritableSignal<string | null>
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

export interface HtmlTemplateNode<T = any> extends SharedNode {
  type: 'html-template'
  data?: T
  width?: number
  height?: number
}

export interface HtmlTemplateDynamicNode<T = any> extends SharedDynamicNode {
  type: 'html-template'
  data?: WritableSignal<T>
  width?: WritableSignal<number>
  height?: WritableSignal<number>
}

export interface DefaultGroupNode extends SharedNode {
  type: 'default-group'
  width: number
  height: number
  color?: string
  resizable?: boolean
}

export interface DefaultDynamicGroupNode extends SharedDynamicNode {
  type: 'default-group'
  width: WritableSignal<number>
  height: WritableSignal<number>
  color?: WritableSignal<string>
  resizable?: WritableSignal<boolean>
}

export interface TemplateGroupNode<T> extends SharedNode {
  type: 'template-group'
  width: number
  height: number
  data?: T
}

export interface TemplateDynamicGroupNode<T> extends SharedDynamicNode {
  type: 'template-group'
  width: WritableSignal<number>
  height: WritableSignal<number>
  data?: WritableSignal<T>
}

export interface ComponentNode<T = any> extends SharedNode {
  type: Type<CustomNodeComponent<T>>
  data?: T
  width?: number
  height?: number
}

export interface ComponentDynamicNode<T = any> extends SharedDynamicNode {
  type: Type<CustomDynamicNodeComponent<T>>
  data?: WritableSignal<T>
  width?: WritableSignal<number>
  height?: WritableSignal<number>
}

export function isStaticNode<T>(node: Node<T> | DynamicNode<T>): node is Node<T> {
  return typeof node.point !== 'function'
}

export function isDynamicNode<T>(node: Node<T> | DynamicNode<T>): node is DynamicNode<T> {
  return typeof node.point === 'function'
}

export function isComponentStaticNode<T>(node: Node<T>): node is ComponentNode<T> {
  return CustomNodeComponent.isPrototypeOf(node.type)
}

export function isComponentDynamicNode<T>(node: DynamicNode<T>): node is ComponentDynamicNode<T> {
  return CustomDynamicNodeComponent.isPrototypeOf(node.type)
}

export function isTemplateStaticNode<T>(node: Node<T>): node is HtmlTemplateNode<T> {
  return node.type === 'html-template'
}

export function isTemplateDynamicNode<T>(node: DynamicNode<T>): node is HtmlTemplateDynamicNode<T> {
  return node.type === 'html-template'
}

export function isDefaultStaticNode(node: Node): node is DefaultNode {
  return node.type === 'default'
}

export function isDefaultDynamicNode(node: DynamicNode): node is DefaultDynamicNode {
  return node.type === 'default'
}

export function isDefaultStaticGroupNode(node: Node): node is DefaultGroupNode {
  return node.type === 'default-group'
}

export function isDefaultDynamicGroupNode(node: DynamicNode): node is DefaultDynamicGroupNode {
  return node.type === 'default-group'
}

export function isTemplateStaticGroupNode<T>(node: Node<T>): node is TemplateGroupNode<T> {
  return node.type === 'template-group'
}

export function isTemplateDynamicGroupNode<T>(node: DynamicNode<T>): node is TemplateDynamicGroupNode<T> {
  return node.type === 'template-group'
}
