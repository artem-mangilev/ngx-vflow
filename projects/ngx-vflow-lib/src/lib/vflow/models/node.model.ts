import { Injector, computed, inject, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { FlowModel } from './flow.model'

export class NodeModel<T = unknown> {
  public point = signal({ x: 0, y: 0 })

  public width = signal(0)
  public height = signal(0)

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  public sourceOffset = computed(() => {
    const width = this.width()
    const height = this.height()

    switch (this.sourcePosition()) {
      case 'left': return { x: 0, y: height / 2 }
      case 'right': return { x: width, y: height / 2 }
      case 'top': return { x: width / 2, y: 0 }
      case 'bottom': return { x: width / 2, y: height }
    }
  })

  public targetOffset = computed(() => {
    const width = this.width()
    const height = this.height()

    switch (this.targetPosition()) {
      case 'left': return { x: 0, y: (height / 2) }
      case 'right': return { x: width, y: height / 2 }
      case 'top': return { x: width / 2, y: 0 }
      case 'bottom': return { x: width / 2, y: height }
    }
  })

  public sourcePointAbsolute = computed(() => {
    return {
      x: this.point().x + this.sourceOffset().x + this.sourceHandleOffset().x,
      y: this.point().y + this.sourceOffset().y + this.sourceHandleOffset().y
    }
  })

  public targetPointAbsolute = computed(() => {
    return {
      x: this.point().x + this.targetOffset().x + this.targetHandleOffset().x,
      y: this.point().y + this.targetOffset().y + this.targetHandleOffset().y
    }
  })

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flow.handlePositions().source)
  public targetPosition = computed(() => this.flow.handlePositions().target)

  public sourceHandleWidth = signal(0)
  public sourceHandleHeight = signal(0)

  public targetHandleWidth = signal(0)
  public targetHandleHeight = signal(0)

  public sourceHandleOffset = computed(() => {
    switch (this.sourcePosition()) {
      case 'left': return { x: -(this.sourceHandleWidth() / 2), y: 0 }
      case 'right': return { x: this.sourceHandleWidth() / 2, y: 0 }
      case 'top': return { x: 0, y: -(this.sourceHandleWidth() / 2) }
      case 'bottom': return { x: 0, y: this.sourceHandleWidth() / 2 }
    }
  })

  public targetHandleOffset = computed(() => {
    switch (this.targetPosition()) {
      case 'left': return { x: -(this.targetHandleWidth() / 2), y: 0 }
      case 'right': return { x: this.targetHandleWidth() / 2, y: 0 }
      case 'top': return { x: 0, y: -(this.targetHandleHeight() / 2) }
      case 'bottom': return { x: 0, y: this.targetHandleHeight() / 2 }
    }
  })

  public sourceOffsetAligned = computed(() => {
    return {
      x: this.sourceOffset().x - (this.sourceHandleWidth() / 2),
      y: this.sourceOffset().y - (this.sourceHandleHeight() / 2),
    }
  })

  public targetOffsetAligned = computed(() => {
    return {
      x: this.targetOffset().x - (this.targetHandleWidth() / 2),
      y: this.targetOffset().y - (this.targetHandleHeight() / 2),
    }
  })

  // disabled for configuration for now
  public readonly magnetRadius = 20

  private flow!: FlowModel

  constructor(
    public node: Node<T>
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
