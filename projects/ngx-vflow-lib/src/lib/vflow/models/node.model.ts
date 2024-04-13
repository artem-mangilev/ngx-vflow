import { Injector, computed, inject, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { FlowModel } from './flow.model'
import { isDefined } from '../utils/is-defined'
import { toObservable } from '@angular/core/rxjs-interop'
import { NodeHandle } from '../services/handle.service'
import { HandleModel } from './handle.model'

export class NodeModel<T = unknown> {
  public point = signal({ x: 0, y: 0 })

  public point$ = toObservable(this.point)

  public size = signal({ width: 0, height: 0 })

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  public sourceOffset = computed(() => {
    const { width, height } = this.size()

    switch (this.sourcePosition()) {
      case 'left': return { x: 0, y: height / 2 }
      case 'right': return { x: width, y: height / 2 }
      case 'top': return { x: width / 2, y: 0 }
      case 'bottom': return { x: width / 2, y: height }
    }
  })

  public targetOffset = computed(() => {
    const { width, height } = this.size()

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

  public sourceHandleSize = signal({ width: 0, height: 0 })
  public targetHandleSize = signal({ width: 0, height: 0 })

  public sourceHandleOffset = computed(() => {
    switch (this.sourcePosition()) {
      case 'left': return { x: -(this.sourceHandleSize().width / 2), y: 0 }
      case 'right': return { x: this.sourceHandleSize().width / 2, y: 0 }
      case 'top': return { x: 0, y: -(this.sourceHandleSize().height / 2) }
      case 'bottom': return { x: 0, y: this.sourceHandleSize().height / 2 }
    }
  })

  public targetHandleOffset = computed(() => {
    switch (this.targetPosition()) {
      case 'left': return { x: -(this.targetHandleSize().width / 2), y: 0 }
      case 'right': return { x: this.targetHandleSize().width / 2, y: 0 }
      case 'top': return { x: 0, y: -(this.targetHandleSize().height / 2) }
      case 'bottom': return { x: 0, y: this.targetHandleSize().height / 2 }
    }
  })

  public sourceOffsetAligned = computed(() => {
    return {
      x: this.sourceOffset().x - (this.sourceHandleSize().width / 2),
      y: this.sourceOffset().y - (this.sourceHandleSize().height / 2),
    }
  })

  public targetOffsetAligned = computed(() => {
    return {
      x: this.targetOffset().x - (this.targetHandleSize().width / 2),
      y: this.targetOffset().y - (this.targetHandleSize().height / 2),
    }
  })

  public handles = computed(
    () => {
      if (this.node.type === 'html-template') {
        return this.rawHandles().map((handle => new HandleModel(handle, this)))
      }

      return [
        new HandleModel(
          {
            position: this.sourcePosition(),
            type: 'source',
            parentPosition: signal({ x: 0, y: 0 }),
            parentSize: signal(this.size())
          },
          this
        ),
        new HandleModel(
          {
            position: this.targetPosition(),
            type: 'target',
            parentPosition: signal({ x: 0, y: 0 }),
            parentSize: signal(this.size())
          },
          this
        ),

      ]
    }
  )

  public rawHandles = signal<NodeHandle[]>([])

  public draggable = true

  // disabled for configuration for now
  public readonly magnetRadius = 20

  private flow!: FlowModel

  constructor(
    public node: Node<T>
  ) {
    this.point.set(node.point)

    if (isDefined(node.draggable)) this.draggable = node.draggable
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
