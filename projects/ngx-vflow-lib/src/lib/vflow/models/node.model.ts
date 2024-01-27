import { computed, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { Position } from '../enums/position.enum'

export class NodeModel {
  public point = signal({ x: 0, y: 0 })

  public sourcePoint = computed(() => {
    switch (this.sourcePosition) {
      case Position.left: return { x: 0, y: this.height() / 2 }
      case Position.right: return { x: this.width(), y: this.height() / 2 }
      case Position.top: return { x: this.width() / 2, y: 0 }
      case Position.bottom: return { x: this.width() / 2, y: this.height() }
    }
  })

  public targetPoint = computed(() => {
    switch (this.targetPosition) {
      case Position.left: return { x: 0, y: this.height() / 2 }
      case Position.right: return { x: this.width(), y: this.height() / 2 }
      case Position.top: return { x: this.width() / 2, y: 0 }
      case Position.bottom: return { x: this.width() / 2, y: this.height() }
    }
  })

  public width = signal(0)
  public height = signal(0)

  public sourcePosition: Position
  public targetPosition: Position

  constructor(
    public node: Node
  ) {
    this.point.set(node.point)

    this.sourcePosition = node.sourcePosition ?? Position.right
    this.targetPosition = node.targetPosition ?? Position.left
  }
}
