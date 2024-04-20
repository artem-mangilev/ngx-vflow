import { computed, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { FlowModel } from './flow.model'
import { isDefined } from '../utils/is-defined'
import { toObservable } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'

export class NodeModel<T = unknown> {
  public point = signal({ x: 0, y: 0 })

  public point$ = toObservable(this.point)

  public size = signal({ width: 0, height: 0 })

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flow.handlePositions().source)
  public targetPosition = computed(() => this.flow.handlePositions().target)

  public handles = computed(
    () => {
      if (this.node.type === 'html-template') {
        return this.rawHandles()
      }

      return [
        new HandleModel(
          {
            position: this.sourcePosition(),
            type: 'source',
            parentPosition: { x: 0, y: 0 },
            parentSize: this.size()
          },
          this
        ),
        new HandleModel(
          {
            position: this.targetPosition(),
            type: 'target',
            parentPosition: { x: 0, y: 0 },
            parentSize: this.size()
          },
          this
        ),

      ]
    }
  )

  public rawHandles = signal<HandleModel[]>([])

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
