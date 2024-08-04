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

export class NodeModel<T = unknown> implements FlowEntity {
  private static defaultWidth = 100
  private static defaultHeight = 50

  private flowSettingsService = inject(FlowSettingsService)

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

  public pointTransform = computed(() => `translate(${this.point().x}, ${this.point().y})`)

  // Now source and handle positions derived from parent flow
  public sourcePosition = computed(() => this.flowSettingsService.handlePositions().source)
  public targetPosition = computed(() => this.flowSettingsService.handlePositions().target)

  public handles = signal<HandleModel[]>([])

  public handles$ = toObservable(this.handles)

  public draggable = signal(true)

  // disabled for configuration for now
  public readonly magnetRadius = 20

  // TODO: not sure if we need to statically store it
  public isComponentType = CustomNodeComponent.isPrototypeOf(this.node.type)

  // Default node specific thing
  public text = this.createTextSignal()

  // Component node specific thing
  public componentTypeInputs = computed(() => {
    return {
      node: this.node,
      _selected: this.selected()
    }
  })

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
  }

  public setPoint(point: Point) {
    this.internalPoint.set(point);
  }

  /**
   * TODO find the way to implement this better
   */
  public linkDefaultNodeSizeWithModelSize() {
    const node = this.node

    if (node.type === 'default') {
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
