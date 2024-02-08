import { Injector, computed, inject, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { Position } from '../types/position.type'
import { FlowModel } from './flow.model'

export class NodeModel {
  public point = signal({ x: 0, y: 0 })

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  public sourcePoint = computed(() => {
    const width = this.width()
    const height = this.height()

    switch (this.sourcePosition()) {
      case 'left': return { x: 0, y: height / 2 }
      case 'right': return { x: width, y: height / 2 }
      case 'top': return { x: width / 2, y: 0 }
      case 'bottom': return { x: width / 2, y: height }
    }
  })

  public targetPoint = computed(() => {
    const width = this.width()
    const height = this.height()

    switch (this.targetPosition()) {
      case 'left': return { x: 0, y: height / 2 }
      case 'right': return { x: width, y: height / 2 }
      case 'top': return { x: width / 2, y: 0 }
      case 'bottom': return { x: width / 2, y: height }
    }
  })

  public sourcePointAbsolute = computed(() => {
    return {
      x: this.point().x + this.sourcePoint().x,
      y: this.point().y + this.sourcePoint().y
    }
  })

  public width = signal(0)
  public height = signal(0)

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flow.handlePositions().source)
  public targetPosition = computed(() => this.flow.handlePositions().target)

  private flow!: FlowModel

  constructor(
    public node: Node
  ) {
    this.point.set(node.point)
  }

  /**
   * Bind parent flow model to node
   *
   * @param flow parent flow
   */
  public bindFlow(flow: FlowModel) {
    this.flow = flow
  }
}
