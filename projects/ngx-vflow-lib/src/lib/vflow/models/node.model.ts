import { Signal, Type, computed, effect, inject, signal } from '@angular/core'
import { DynamicNode, Node, isDynamicNode } from '../interfaces/node.interface'
import { isDefined } from '../utils/is-defined'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'
import { FlowEntity } from '../interfaces/flow-entity.interface'
import { FlowSettingsService } from '../services/flow-settings.service'
import { BehaviorSubject, animationFrameScheduler, observeOn } from 'rxjs'
import { Point } from '../interfaces/point.interface'
import { CustomNodeComponent } from '../public-components/custom-node.component'

export class NodeModel<T = unknown> implements FlowEntity {
  public static defaultTypeSize = {
    width: 100,
    height: 50
  }

  private flowSettingsService = inject(FlowSettingsService)

  private internalPoint$ = new BehaviorSubject({ x: 0, y: 0 })

  private throttledPoint$ = this.internalPoint$.pipe(
    observeOn(animationFrameScheduler)
  )

  public point = toSignal(this.throttledPoint$, {
    initialValue: this.internalPoint$.getValue()
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

  public draggable = true

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
    if (isDynamicNode(node)) {
      effect(() => this.setPoint(node.point()))
    } else {
      this.setPoint(node.point)
    }

    // TODO: make reactive
    if (isDefined(node.draggable)) {
      this.draggable = isDynamicNode(node) ? node.draggable() : node.draggable
    }
  }

  public setPoint(point: Point) {
    this.internalPoint$.next(point);
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
}
