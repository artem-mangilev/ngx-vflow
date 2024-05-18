import { computed, inject, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { isDefined } from '../utils/is-defined'
import { toObservable } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'
import { FlowEntity } from '../interfaces/flow-entity.interface'
import { FlowSettingsService } from '../services/flow-settings.service'

export class NodeModel<T = unknown> implements FlowEntity {
  private flowSettingsService = inject(FlowSettingsService)

  public point = signal({ x: 0, y: 0 })

  public point$ = toObservable(this.point)

  public size = signal({ width: 0, height: 0 })

  public renderOrder = signal(0)
  public selected = signal(false)

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flowSettingsService.handlePositions().source)
  public targetPosition = computed(() => this.flowSettingsService.handlePositions().target)

  public handles = signal<HandleModel[]>([])

  public handles$ = toObservable(this.handles)

  public draggable = true

  // disabled for configuration for now
  public readonly magnetRadius = 20

  constructor(
    public node: Node<T>
  ) {
    this.point.set(node.point)

    if (isDefined(node.draggable)) this.draggable = node.draggable
  }
}
