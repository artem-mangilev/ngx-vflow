import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService, batchStatusChanges } from '../../services/flow-status.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';

export type HandleState = 'valid' | 'invalid' | 'idle'

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
  styles: [`
    .wrapper {
      width: max-content;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy {
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

  @ViewChild('targetHandle')
  public targetHandleRef!: ElementRef<SVGGElement | SVGCircleElement>

  private draggableService = inject(DraggableService)
  private flowStatusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)

  private sourceHanldeState = signal<HandleState>('idle')
  private targetHandleState = signal<HandleState>('idle')

  private sourceHanldeStateReadonly = this.sourceHanldeState.asReadonly()
  private targetHanldeStateReadonly = this.targetHandleState.asReadonly()

  public ngOnInit() {
    this.draggableService.makeDraggable(this.hostRef.nativeElement, this.nodeModel)
  }

  public ngAfterViewInit(): void {
    // TODO remove microtask

    if (this.nodeModel.node.type === 'default') {
      queueMicrotask(() => {
        const box = this.nodeContentRef.nativeElement.getBBox()

        this.nodeModel.width.set(box.width)
        this.nodeModel.height.set(box.height)
      })
    }

    if (this.nodeModel.node.type === 'html-template') {
      queueMicrotask(() => {
        const width = this.htmlWrapperRef.nativeElement.clientWidth
        const height = this.htmlWrapperRef.nativeElement.clientHeight

        this.nodeModel.width.set(width)
        this.nodeModel.height.set(height)
      })
    }

    queueMicrotask(() => {
      const box = this.targetHandleRef.nativeElement.getBBox({ stroke: true })

      this.nodeModel.targetHandleWidth.set(box.width)
      this.nodeModel.targetHandleHeight.set(box.height)
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

    if (status.state === 'connection-start') {
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

  protected validateTargetHandle() {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-start') {
      const source = status.payload.sourceNode.node.id
      const target = this.nodeModel.node.id

      const valid = this.flowEntitiesService.connection().validator({ source, target })
      this.targetHandleState.set(valid ? 'valid' : 'invalid')
    }
  }

  protected resetValidateTargetHandle() {
    this.targetHandleState.set('idle')
  }

  protected getHandleContext(type: 'source' | 'target') {
    // TODO provide point with shift to middle
    if (type === 'source') {
      return {
        $implicit: {
          point: this.nodeModel.sourcePoint,
          state: this.sourceHanldeStateReadonly
        }
      }
    }

    return {
      $implicit: {
        point: this.nodeModel.targetPoint,
        state: this.targetHanldeStateReadonly
      }
    }
  }
}
