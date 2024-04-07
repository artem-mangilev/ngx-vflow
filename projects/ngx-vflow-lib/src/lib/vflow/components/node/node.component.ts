import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Injector, Input, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService, batchStatusChanges } from '../../services/flow-status.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { HandleService } from '../../services/handle.service';

export type HandleState = 'valid' | 'invalid' | 'idle'

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService]
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy {
  protected handleService = inject(HandleService)
  protected injector = inject(Injector)

  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeHtmlTemplate?: TemplateRef<any>

  @Input()
  public handleTemplate?: TemplateRef<any>

  @ViewChild('nodeContent')
  public nodeContentRef!: ElementRef<SVGGraphicsElement>

  @ViewChild('htmlWrapper')
  public htmlWrapperRef!: ElementRef<HTMLDivElement>

  @ViewChild('sourceHandle')
  public sourceHandleRef!: ElementRef<SVGGElement | SVGCircleElement>

  @ViewChild('targetHandle')
  public targetHandleRef!: ElementRef<SVGGElement | SVGCircleElement>

  private draggableService = inject(DraggableService)
  private flowStatusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)

  protected showMagnet = computed(() =>
    this.flowStatusService.status().state === 'connection-start' ||
    this.flowStatusService.status().state === 'connection-validation'
  )

  protected readonly defaultHandleStrokeWidth = 2

  private sourceHanldeState = signal<HandleState>('idle')
  private targetHandleState = signal<HandleState>('idle')

  private sourceHanldeStateReadonly = this.sourceHanldeState.asReadonly()
  private targetHanldeStateReadonly = this.targetHandleState.asReadonly()

  public ngOnInit() {
    runInInjectionContext(this.injector, () => {
      effect(
        () => this.nodeModel.rawHandles.set(this.handleService.handles()),
        { allowSignalWrites: true }
      )
    })

    this.draggableService.toggleDraggable(this.hostRef.nativeElement, this.nodeModel)
  }

  public ngAfterViewInit(): void {
    // TODO remove microtask
    queueMicrotask(() => {
      if (this.nodeModel.node.type === 'default') {
        const { width, height } = this.nodeContentRef.nativeElement.getBBox()
        this.nodeModel.size.set({ width, height })

        this.setSourceHandleSize()
        this.setTargetHandleSize()
      }

      if (this.nodeModel.node.type === 'html-template') {
        const width = this.htmlWrapperRef.nativeElement.clientWidth
        const height = this.htmlWrapperRef.nativeElement.clientHeight

        this.nodeModel.size.set({ width, height })
      }
    })
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement)
  }

  protected startConnection(event: MouseEvent) {
    // ignore drag by stopping propagation
    event.stopPropagation()

    this.flowStatusService.setConnectionStartStatus(this.nodeModel)
  }

  protected endConnection() {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-validation') {
      const sourceNode = status.payload.sourceNode
      const targetNode = this.nodeModel

      batchStatusChanges(
        // call to create connection
        () => this.flowStatusService.setConnectionEndStatus(sourceNode, targetNode),
        // when connection created, we need go back to idle status
        () => this.flowStatusService.setIdleStatus()
      )
    }
  }

  /**
   * TODO srp
   */
  protected validateTargetHandle() {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-start') {
      const sourceNode = status.payload.sourceNode
      const targetNode = this.nodeModel

      const source = sourceNode.node.id
      const target = targetNode.node.id

      const valid = this.flowEntitiesService.connection().validator({ source, target })
      this.targetHandleState.set(valid ? 'valid' : 'invalid')

      this.flowStatusService.setConnectionValidationStatus(sourceNode, targetNode, valid)
    }
  }

  /**
   * TODO srp
   */
  protected resetValidateTargetHandle() {
    this.targetHandleState.set('idle')

    // drop back to start status
    const status = this.flowStatusService.status()
    if (status.state === 'connection-validation') {
      this.flowStatusService.setConnectionStartStatus(status.payload.sourceNode)
    }
  }

  protected getHandleContext(type: 'source' | 'target') {
    if (type === 'source') {
      return {
        $implicit: {
          point: this.nodeModel.sourceOffset,
          alignedPoint: this.nodeModel.sourceOffsetAligned,
          state: this.sourceHanldeStateReadonly
        }
      }
    }

    return {
      $implicit: {
        point: this.nodeModel.targetOffset,
        alignedPoint: this.nodeModel.targetOffsetAligned,
        state: this.targetHanldeStateReadonly
      }
    }
  }

  /**
   * TODO: only works for default node type
   */
  private setSourceHandleSize() {
    const strokeWidth = 2 * this.defaultHandleStrokeWidth;

    const sourceBox = this.sourceHandleRef.nativeElement.getBBox({ stroke: true })
    this.nodeModel.sourceHandleSize.set({
      width: sourceBox.width + strokeWidth,
      height: sourceBox.height + strokeWidth
    })
  }

  /**
   * TODO: only works for default node type
   */
  private setTargetHandleSize() {
    const strokeWidth = 2 * this.defaultHandleStrokeWidth;

    const targetBox = this.targetHandleRef.nativeElement.getBBox({ stroke: true })
    this.nodeModel.targetHandleSize.set({
      width: targetBox.width + strokeWidth,
      height: targetBox.height + strokeWidth
    })
  }
}
