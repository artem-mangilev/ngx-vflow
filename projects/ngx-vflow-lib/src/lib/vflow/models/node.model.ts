import { Signal, TemplateRef, computed, effect, inject, signal } from '@angular/core'
import { DynamicNode, Node, isDynamicNode } from '../interfaces/node.interface'
import { isDefined } from '../utils/is-defined'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'
import { FlowEntity } from '../interfaces/flow-entity.interface'
import { FlowSettingsService } from '../services/flow-settings.service'
import { animationFrameScheduler, merge, observeOn, Subject, } from 'rxjs'
import { Point } from '../interfaces/point.interface'
import { CustomNodeComponent } from '../public-components/custom-node.component'
import { CustomDynamicNodeComponent } from '../public-components/custom-dynamic-node.component'
import { FlowEntitiesService } from '../services/flow-entities.service'

// TODO bad naming around points
export class NodeModel<T = unknown> implements FlowEntity {
  private static defaultWidth = 100
  private static defaultHeight = 50
  private static defaultColor = '#1b262c'

  private flowSettingsService = inject(FlowSettingsService)
  private entitiesService = inject(FlowEntitiesService);

  private internalPoint = this.createInternalPointSignal()

  private throttledPoint$ = toObservable(this.internalPoint).pipe(
    observeOn(animationFrameScheduler)
  )

  private notThrottledPoint$ = new Subject<Point>()

  public point = toSignal(
    merge(this.throttledPoint$, this.notThrottledPoint$),
    {
      initialValue: this.internalPoint()
    }
  )

  public point$ = this.throttledPoint$;

  public size = signal({ width: 0, height: 0 })
  public size$ = toObservable(this.size)

  public width = computed(() => this.size().width)
  public height = computed(() => this.size().height)

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

  public parent = computed(() =>
    this.entitiesService.nodes().find(n => n.node.id === this.parentId()) ?? null
  )

  public children = computed(() =>
    this.entitiesService.nodes().filter(n => n.parentId() === this.node.id)
  )

  public color = signal(NodeModel.defaultColor)

  public resizable = signal(false)
  public resizing = signal(false)
  public resizerTemplate = signal<TemplateRef<unknown> | null>(null)

  private parentId = signal<string | null>(null)

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

    if (node.type === 'default-group' && node.color) {
      if (isDynamicNode(node)) {
        this.color = node.color
      } else {
        this.color.set(node.color)
      }
    }

    if (node.type === 'default-group' && node.resizable) {
      if (isDynamicNode(node)) {
        this.resizable = node.resizable
      } else {
        this.resizable.set(node.resizable)
      }
    }
  }

  public setPoint(point: Point, throttle: boolean) {
    if (throttle) {
      this.internalPoint.set(point);
    } else {
      this.notThrottledPoint$.next(point)
    }
  }

  /**
   * TODO find the way to implement this better
   */
  public linkDefaultNodeSizeWithModelSize() {
    const node = this.node

    switch (node.type) {
      case 'default':
      case 'default-group':
      case 'template-group': {
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

    if (node.type === 'html-template' || this.isComponentType) {
      if (isDynamicNode(node)) {
        effect(() => {
          if (node.width && node.height) {
            this.size.set({
              width: node.width(),
              height: node.height(),
            })
          }
        }, { allowSignalWrites: true })
      } else {
        if (node.width && node.height) {
          this.size.set({ width: node.width, height: node.height })
        }
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
