import { Point } from "./point.interface"

export type Node<T = unknown> = SharedNode & (
  DefaultNode |
  HtmlTemplateNode<T>
)
interface SharedNode {
  id: string
  point: Point
  draggable?: boolean
}

interface DefaultNode {
  type: 'default'
  text?: string
}

interface HtmlTemplateNode<T = unknown> {
  type: 'html-template'
  data?: T
}
