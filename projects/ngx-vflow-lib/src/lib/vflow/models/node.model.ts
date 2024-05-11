import { computed, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { FlowModel } from './flow.model'
import { isDefined } from '../utils/is-defined'
import { toObservable } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'
import { FlowEntity } from '../interfaces/flow-entity.interface'

export class NodeModel<T = unknown> implements FlowEntity {
  public point = signal({ x: 0, y: 0 })

  public point$ = toObservable(this.point)

  public size = signal({ width: 0, height: 0 })

  public renderOrder = signal(0)
  public selected = signal(false)

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flow.handlePositions().source)
  public targetPosition = computed(() => this.flow.handlePositions().target)

  public handles = signal<HandleModel[]>([])

  public handles$ = toObservable(this.handles)

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
