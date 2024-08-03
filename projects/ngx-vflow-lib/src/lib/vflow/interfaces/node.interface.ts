import { Type } from "@angular/core"
import { Point } from "./point.interface"
import { CustomNodeComponent } from "../public-components/custom-node.component"

export type Node<T = unknown> =
  DefaultNode |
  HtmlTemplateNode<T> |
  ComponentNode<T>

export interface SharedNode {
  id: string
  point: Point
  draggable?: boolean
}

export interface DefaultNode extends SharedNode {
  type: 'default'
  text?: string
  width?: number
  height?: number
}

export interface HtmlTemplateNode<T = unknown> extends SharedNode {
  type: 'html-template'
  data?: T
}

export interface ComponentNode<T = unknown> extends SharedNode {
  type: Type<CustomNodeComponent<T>>
  data?: T
}
