import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Injector, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewChildren, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService } from '../../services/flow-status.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { resizable } from '../../utils/resizable';
import { Subscription, map, startWith, switchMap, tap } from 'rxjs';
import { InjectionContext, WithInjector } from '../../decorators/run-in-injection-context.decorator';
import { Microtask } from '../../decorators/microtask.decorator';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';

export type HandleState = 'valid' | 'invalid' | 'idle'

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService]
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy, WithInjector {
  public injector = inject(Injector)
  private handleService = inject(HandleService)
  private draggableService = inject(DraggableService)
  private flowStatusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)
  private nodeRenderingService = inject(NodeRenderingService)
  private flowSettingsService = inject(FlowSettingsService)
  private selectionService = inject(SelectionService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)
  private connectionController = inject(ConnectionControllerDirective)

  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeHtmlTemplate?: TemplateRef<any>

  @ViewChild('nodeContent')
  public nodeContentRef!: ElementRef<SVGGraphicsElement>

  @ViewChild('htmlWrapper')
  public htmlWrapperRef!: ElementRef<HTMLDivElement>

  protected showMagnet = computed(() =>
    this.flowStatusService.status().state === 'connection-start' ||
    this.flowStatusService.status().state === 'connection-validation'
  )

  protected styleWidth = computed(() => `${this.nodeModel.size().width}px`)

  protected styleHeight = computed(() => `${this.nodeModel.size().height}px`)

  protected isStrictMode = computed(() =>
    this.flowEntitiesService.connection().mode === 'strict'
  )

  private subscription = new Subscription()

  public ngOnInit() {
    this.handleService.node.set(this.nodeModel);

    this.draggableService.toggleDraggable(this.hostRef.nativeElement, this.nodeModel)

    const sub = this.nodeModel.handles$
      .pipe(
        switchMap((handles) =>
          resizable(handles.map(h => h.parentReference!))
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
      this.nodeModel.size.set({
        width: this.nodeModel.node.width ?? NodeModel.defaultTypeSize.width,
        height: this.nodeModel.node.height ?? NodeModel.defaultTypeSize.height
      })
    }

    if (this.nodeModel.node.type === 'html-template' || this.nodeModel.isComponentType) {
      const sub = resizable([this.htmlWrapperRef.nativeElement])
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

  protected startConnection(event: Event, handle: HandleModel) {
    // ignore drag by stopping propagation
    event.stopPropagation()

    this.connectionController.startConnection(handle)
  }

  protected validateConnection(handle: HandleModel) {
    this.connectionController.validateConnection(handle)
  }

  protected resetValidateConnection(targetHandle: HandleModel) {
    this.connectionController.resetValidateConnection(targetHandle)
  }

  protected endConnection(handle: HandleModel) {
    this.connectionController.endConnection(handle)
  }

  protected pullNode() {
    this.nodeRenderingService.pullNode(this.nodeModel)
  }

  protected selectNode() {
    if (this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.nodeModel)
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
}
