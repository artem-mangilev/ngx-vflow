import { signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'

export class NodeModel {
  public position = signal({ x: 0, y: 0 })

  constructor(
    public node: Node
  ) {
    this.position.set(node.position)
  }
}
