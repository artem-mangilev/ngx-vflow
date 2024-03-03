import { Point } from "./point.interface"

export type Node<T = unknown> = {
  id: string
  point: Point
} & (
    DefaultNode |
    HtmlTemplateNode<T>
  )

interface DefaultNode {
  type: 'default'
  text?: string
}

interface HtmlTemplateNode<T = unknown> {
  type: 'html-template'
  data?: T
}
