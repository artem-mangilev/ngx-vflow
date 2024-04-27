import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Injector, Input, NgZone, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService, batchStatusChanges } from '../../services/flow-status.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { resizable } from '../../utils/resizable';
import { Subscription, map, startWith, switchMap, tap } from 'rxjs';
import { InjectionContext, WithInjectorDirective } from '../../decorators/run-in-injection-context.decorator';
import { Microtask } from '../../decorators/microtask.decorator';

export type HandleState = 'valid' | 'invalid' | 'idle'

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService]
})
export class NodeComponent extends WithInjectorDirective implements OnInit, AfterViewInit, OnDestroy {
  protected handleService = inject(HandleService)
  protected zone = inject(NgZone)

  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeHtmlTemplate?: TemplateRef<any>

  @ViewChild('nodeContent')
  public nodeContentRef!: ElementRef<SVGGraphicsElement>

  @ViewChild('htmlWrapper')
  public htmlWrapperRef!: ElementRef<HTMLDivElement>

  private draggableService = inject(DraggableService)
  private flowStatusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)

  protected showMagnet = computed(() =>
    this.flowStatusService.status().state === 'connection-start' ||
    this.flowStatusService.status().state === 'connection-validation'
  )

  private sourceHanldeState = signal<HandleState>('idle')
  private targetHandleState = signal<HandleState>('idle')

  private subscription = new Subscription()

  public ngOnInit() {
    this.handleService.node.set(this.nodeModel);

    this.draggableService.toggleDraggable(this.hostRef.nativeElement, this.nodeModel)

    const sub = this.nodeModel.handles$
      .pipe(
        switchMap((handles) =>
          resizable(handles.map(h => h.parentReference!), this.zone)
            .pipe(map(() => handles))
        ),
        tap((handles) => handles.forEach(h => h.updateParent()))
      )
      .subscribe()

    this.subscription.add(sub)
  }

  @Microtask
  public ngAfterViewInit(): void {
    this.setInitialHandles()

    if (this.nodeModel.node.type === 'default') {
      const { width, height } = this.nodeContentRef.nativeElement.getBBox()
      this.nodeModel.size.set({ width, height })
    }

    if (this.nodeModel.node.type === 'html-template') {
      const sub = resizable([this.htmlWrapperRef.nativeElement], this.zone)
        .pipe(
          startWith(null),
          tap(() => {
            const width = this.htmlWrapperRef.nativeElement.clientWidth
            const height = this.htmlWrapperRef.nativeElement.clientHeight

            this.nodeModel.size.set({ width, height })
          })
        ).subscribe()

      this.subscription.add(sub)
    }
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement)
    this.subscription.unsubscribe()
  }

  protected startConnection(event: MouseEvent, handle: HandleModel) {
    // ignore drag by stopping propagation
    event.stopPropagation()

    this.flowStatusService.setConnectionStartStatus(this.nodeModel, handle)
  }

  protected endConnection() {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-validation') {
      const sourceNode = status.payload.sourceNode
      const targetNode = this.nodeModel
      const sourceHandle = status.payload.sourceHandle
      const targetHandle = status.payload.targetHandle

      batchStatusChanges(
        // call to create connection
        () => this.flowStatusService.setConnectionEndStatus(sourceNode, targetNode, sourceHandle, targetHandle),
        // when connection created, we need go back to idle status
        () => this.flowStatusService.setIdleStatus()
      )
    }
  }

  /**
   * TODO srp
   */
  protected validateTargetHandle(targetHandle: HandleModel) {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-start') {
      const sourceNode = status.payload.sourceNode
      const sourceHandle = status.payload.sourceHandle
      const source = sourceNode.node.id

      const targetNode = this.nodeModel
      const target = targetNode.node.id

      const valid = this.flowEntitiesService.connection().validator({
        source,
        target,
        sourceHandle: sourceHandle.rawHandle.id,
        targetHandle: targetHandle.rawHandle.id
      })
      this.targetHandleState.set(valid ? 'valid' : 'invalid')

      this.flowStatusService.setConnectionValidationStatus(valid, sourceNode, targetNode, sourceHandle, targetHandle)
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
      this.flowStatusService.setConnectionStartStatus(status.payload.sourceNode, status.payload.sourceHandle)
    }
  }

  @InjectionContext
  private setInitialHandles() {
    if (this.nodeModel.node.type === 'default') {
      this.handleService.createHandle(
        new HandleModel(
          {
            position: this.nodeModel.sourcePosition(),
            type: 'source',
            parentReference: this.htmlWrapperRef.nativeElement
          },
          this.nodeModel
        ),
      )

      this.handleService.createHandle(
        new HandleModel(
          {
            position: this.nodeModel.targetPosition(),
            type: 'target',
            parentReference: this.htmlWrapperRef.nativeElement
          },
          this.nodeModel
        ),
      )
    }
  }

  // protected getHandleContext(type: 'source' | 'target') {
  //   if (type === 'source') {
  //     return {
  //       $implicit: {
  //         point: this.nodeModel.sourceOffset,
  //         alignedPoint: this.nodeModel.sourceOffsetAligned,
  //         state: this.sourceHanldeStateReadonly
  //       }
  //     }
  //   }

  //   return {
  //     $implicit: {
  //       point: this.nodeModel.targetOffset,
  //       alignedPoint: this.nodeModel.targetOffsetAligned,
  //       state: this.targetHanldeStateReadonly
  //     }
  //   }
  // }
}
