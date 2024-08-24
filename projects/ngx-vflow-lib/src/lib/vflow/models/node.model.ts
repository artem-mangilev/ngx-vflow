import { Signal, Type, computed, effect, inject, signal } from '@angular/core'
import { DynamicNode, Node, isDynamicNode } from '../interfaces/node.interface'
import { isDefined } from '../utils/is-defined'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'
import { FlowEntity } from '../interfaces/flow-entity.interface'
import { FlowSettingsService } from '../services/flow-settings.service'
import { animationFrameScheduler, observeOn, } from 'rxjs'
import { Point } from '../interfaces/point.interface'
import { CustomNodeComponent } from '../public-components/custom-node.component'
import { CustomDynamicNodeComponent } from '../public-components/custom-dynamic-node.component'
import { FlowEntitiesService } from '../services/flow-entities.service'

export class NodeModel<T = unknown> implements FlowEntity {
  private static defaultWidth = 100
  private static defaultHeight = 50

  private flowSettingsService = inject(FlowSettingsService)
  private entitiesService = inject(FlowEntitiesService);

  private internalPoint = this.createInternalPointSignal()

  private throttledPoint$ = toObservable(this.internalPoint).pipe(
    observeOn(animationFrameScheduler)
  )

  public point = toSignal(this.throttledPoint$, {
    initialValue: this.internalPoint()
  })

  public point$ = this.throttledPoint$;

  public size = signal({ width: 0, height: 0 })

  public renderOrder = signal(0)

  public selected = signal(false)
  public selected$ = toObservable(this.selected)

  public globalPoint = computed(() => {
    let parent = this.parent()
    let x = this.point().x
    let y = this.point().y

    while (parent !== null) {
      x += parent.point().x
      y += parent.point().y

      parent = parent.parent()
    }

    return { x, y }
  })

  public pointTransform = computed(() =>
    `translate(${this.globalPoint().x}, ${this.globalPoint().y})`
  )

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flowSettingsService.handlePositions().source)
  public targetPosition = computed(() => this.flowSettingsService.handlePositions().target)

  public handles = signal<HandleModel[]>([])

  public handles$ = toObservable(this.handles)

  public draggable = signal(true)

  // disabled for configuration for now
  public readonly magnetRadius = 20

  // TODO: not sure if we need to statically store it
  public isComponentType =
    CustomNodeComponent.isPrototypeOf(this.node.type) ||
    CustomDynamicNodeComponent.isPrototypeOf(this.node.type)

  // Default node specific thing
  public text = this.createTextSignal()

  // Component node specific thing
  public componentTypeInputs = computed(() => {
    return {
      node: this.node,
      _selected: this.selected()
    }
  })

  public parentId = signal<string | null>(null)

  public parent: Signal<NodeModel | null> = computed(() =>
    this.entitiesService.nodes().find(n => n.node.id === this.parentId()) ?? null
  )

  constructor(
    public node: Node<T> | DynamicNode<T>
  ) {
    if (isDefined(node.draggable)) {
      if (isDynamicNode(node)) {
        this.draggable = node.draggable
      } else {
        this.draggable.set(node.draggable)
      }
    }

    if (isDefined(node.parentId)) {
      if (isDynamicNode(node)) {
        this.parentId = node.parentId
      } else {
        this.parentId.set(node.parentId)
      }
    }
  }

  public setPoint(point: Point) {
    this.internalPoint.set(point);
  }

  /**
   * TODO find the way to implement this better
   */
  public linkDefaultNodeSizeWithModelSize() {
    const node = this.node

    if (node.type === 'default' || node.type === 'default-group') {
      if (isDynamicNode(node)) {
        effect(() => {
          this.size.set({
            width: node.width?.() ?? NodeModel.defaultWidth,
            height: node.height?.() ?? NodeModel.defaultHeight,
          })
        }, { allowSignalWrites: true })
      } else {
        this.size.set({
          width: node.width ?? NodeModel.defaultWidth,
          height: node.height ?? NodeModel.defaultHeight
        })
      }
    }
  }

  private createTextSignal(): Signal<string> {
    const node = this.node

    if (node.type === 'default') {
      if (isDynamicNode(node)) {
        return node.text ?? signal('')
      } else {
        return signal(node.text ?? '')
      }
    }

    return signal('')
  }

  private createInternalPointSignal() {
    return isDynamicNode(this.node)
      ? this.node.point
      : signal({ x: this.node.point.x, y: this.node.point.y })
  }
}
