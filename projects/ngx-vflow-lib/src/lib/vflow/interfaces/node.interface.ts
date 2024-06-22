import { Point } from "./point.interface"

export type Node<T = unknown> = SharedNode & (
  DefaultNode |
  HtmlTemplateNode<T>
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
