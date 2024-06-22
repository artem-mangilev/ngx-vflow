import { computed, inject, signal } from '@angular/core'
import { Node } from '../interfaces/node.interface'
import { isDefined } from '../utils/is-defined'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { HandleModel } from './handle.model'
import { FlowEntity } from '../interfaces/flow-entity.interface'
import { FlowSettingsService } from '../services/flow-settings.service'
import { BehaviorSubject, animationFrameScheduler, observeOn } from 'rxjs'
import { Point } from '../interfaces/point.interface'

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

  constructor(
    public node: Node<T>
  ) {
    this.setPoint(node.point)

    if (isDefined(node.draggable)) this.draggable = node.draggable
  }

  public setPoint(point: Point) {
    this.internalPoint$.next(point);
  }
}
