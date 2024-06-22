import { Directive, Input, Type, signal } from "@angular/core"
import { Point } from "./point.interface"
import { CustomNodeComponent } from "../public-components/custom-node.component"

export type Node<T = unknown> = SharedNode & (
  DefaultNode |
  HtmlTemplateNode<T> |
  ComponentNode<T>
)
export interface SharedNode {
  id: string
  point: Point
  draggable?: boolean
}

export interface DefaultNode {
  type: 'default'
  text?: string
  width?: number
  height?: number
}

export interface HtmlTemplateNode<T = unknown> {
  type: 'html-template'
  data?: T
}

export interface ComponentNode<T = unknown> {
  type: Type<CustomNodeComponent<T>>
  data?: T
}
