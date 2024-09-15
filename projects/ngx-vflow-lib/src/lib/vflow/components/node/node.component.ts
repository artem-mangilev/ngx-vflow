import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, Input, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { resizable } from '../../utils/resizable';
import { map, startWith, switchMap, tap } from 'rxjs';
import { InjectionContext, WithInjector } from '../../decorators/run-in-injection-context.decorator';
import { Microtask } from '../../decorators/microtask.decorator';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private nodeRenderingService = inject(NodeRenderingService)
  private flowSettingsService = inject(FlowSettingsService)
  private selectionService = inject(SelectionService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)
  private connectionController = inject(ConnectionControllerDirective)
  private zone = inject(NgZone)

  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeTemplate?: TemplateRef<any>

  @Input()
  public groupNodeTemplate?: TemplateRef<any>

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

  @InjectionContext
  public ngOnInit() {
    this.handleService.node.set(this.nodeModel);

    effect(() => {
      if (this.nodeModel.draggable()) {
        this.draggableService.enable(this.hostRef.nativeElement, this.nodeModel)
      } else {
        this.draggableService.disable(this.hostRef.nativeElement)
      }
    })

    this.nodeModel.handles$
      .pipe(
        switchMap((handles) =>
          resizable(handles.map(h => h.parentReference!), this.zone)
            .pipe(map(() => handles))
        ),
        tap((handles) => {
          // TODO (performance) inspect how to avoid calls of this when flow initially rendered
          handles.forEach(h => h.updateParent())
        }),
        takeUntilDestroyed()
      )
      .subscribe()
  }

  @InjectionContext
  public ngAfterViewInit(): void {
    this.nodeModel.linkDefaultNodeSizeWithModelSize()

    if (this.nodeModel.node.type === 'html-template' || this.nodeModel.isComponentType) {
      resizable([this.htmlWrapperRef.nativeElement], this.zone)
        .pipe(
          startWith(null),
          tap(() => {
            const width = this.htmlWrapperRef.nativeElement.clientWidth
            const height = this.htmlWrapperRef.nativeElement.clientHeight

            this.nodeModel.size.set({ width, height })
          }),
          takeUntilDestroyed()
        ).subscribe()
    }
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement)
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
}
