import { computed, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { Position } from '../enums/position.enum'

export class NodeModel {
  public point = signal({ x: 0, y: 0 })

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  public sourcePoint = computed(() => {
    const width = this.width()
    const height = this.height()

    switch (this.sourcePosition) {
      case Position.left: return { x: 0, y: height / 2 }
      case Position.right: return { x: width, y: height / 2 }
      case Position.top: return { x: width / 2, y: 0 }
      case Position.bottom: return { x: width / 2, y: height }
    }
  })

  public targetPoint = computed(() => {
    const width = this.width()
    const height = this.height()

    switch (this.targetPosition) {
      case Position.left: return { x: 0, y: height / 2 }
      case Position.right: return { x: width, y: height / 2 }
      case Position.top: return { x: width / 2, y: 0 }
      case Position.bottom: return { x: width / 2, y: height }
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
