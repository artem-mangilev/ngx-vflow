import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { resizable } from '../../utils/resizable';
import { filter, map, startWith, switchMap, tap } from 'rxjs';
import { InjectionContext, WithInjector } from '../../decorators/run-in-injection-context.decorator';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { OverlaysService } from '../../services/overlays.service';
import { HandleSizeControllerDirective } from '../../directives/handle-size-controller.directive';
import { NgTemplateOutlet, NgComponentOutlet } from '@angular/common';
import { DefaultNodeComponent } from '../default-node/default-node.component';
import { PointerDirective } from '../../directives/pointer.directive';

// TODO: fix loading of these by @defer (should work in Angular 18+)
// public components that uses in default node (loaded by defer)
import { ResizableComponent } from '../../public-components/resizable/resizable.component';
import { HandleComponent } from '../../public-components/handle/handle.component';

export type HandleState = 'valid' | 'invalid' | 'idle';

@Component({
  standalone: true,
  selector: 'g[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService, NodeAccessorService],
  host: {
    class: 'vflow-node',
  },
  imports: [
    PointerDirective,
    DefaultNodeComponent,
    HandleComponent,
    NgTemplateOutlet,
    NgComponentOutlet,
    ResizableComponent,
    HandleSizeControllerDirective,
  ],
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy, WithInjector {
  public injector = inject(Injector);
  private handleService = inject(HandleService);
  private draggableService = inject(DraggableService);
  private flowStatusService = inject(FlowStatusService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private selectionService = inject(SelectionService);
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);
  private overlaysService = inject(OverlaysService);
  private zone = inject(NgZone);

  // TODO remove dependency from this directive
  private connectionController = inject(ConnectionControllerDirective, { optional: true });

  public nodeModel = input.required<NodeModel>();

  public nodeTemplate = input<TemplateRef<any>>();

  public groupNodeTemplate = input<TemplateRef<any>>();

  public htmlWrapperRef = viewChild.required<ElementRef<HTMLDivElement>>('htmlWrapper');

  protected showMagnet = computed(
    () =>
      this.flowStatusService.status().state === 'connection-start' ||
      this.flowStatusService.status().state === 'connection-validation',
  );

  protected toolbar = computed(() => this.overlaysService.nodeToolbars().get(this.nodeModel()));

  @InjectionContext
  public ngOnInit() {
    this.nodeAccessor.model.set(this.nodeModel());

    this.handleService.node.set(this.nodeModel());

    effect(() => {
      if (this.nodeModel().draggable()) {
        this.draggableService.enable(this.hostRef.nativeElement, this.nodeModel());
      } else {
        this.draggableService.disable(this.hostRef.nativeElement);
      }
    });

    this.nodeModel()
      .handles$.pipe(
        switchMap((handles) =>
          resizable(
            handles.map((h) => h.hostReference!),
            this.zone,
          ).pipe(map(() => handles)),
        ),
        tap((handles) => {
          // TODO (performance) inspect how to avoid calls of this when flow initially rendered
          handles.forEach((h) => h.updateHost());
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  @InjectionContext
  public ngAfterViewInit(): void {
    this.nodeModel().linkDefaultNodeSizeWithModelSize();

    if (this.nodeModel().node.type === 'html-template' || this.nodeModel().isComponentType) {
      resizable([this.htmlWrapperRef().nativeElement], this.zone)
        .pipe(
          startWith(null),
          tap(() =>
            this.nodeModel()
              .handles()
              .forEach((h) => h.updateHost()),
          ),
          filter(() => !this.nodeModel().resizing()),
          tap(() => {
            const width = this.htmlWrapperRef().nativeElement.clientWidth;
            const height = this.htmlWrapperRef().nativeElement.clientHeight;

            this.nodeModel().size.set({ width, height });
          }),
          takeUntilDestroyed(),
        )
        .subscribe();
    }
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement);
  }

  protected startConnection(event: Event, handle: HandleModel) {
    // ignore drag by stopping propagation
    event.stopPropagation();

    this.connectionController?.startConnection(handle);
  }

  protected validateConnection(handle: HandleModel) {
    this.connectionController?.validateConnection(handle);
  }

  protected resetValidateConnection(targetHandle: HandleModel) {
    this.connectionController?.resetValidateConnection(targetHandle);
  }

  protected endConnection() {
    this.connectionController?.endConnection();
  }

  protected pullNode() {
    this.nodeRenderingService.pullNode(this.nodeModel());
  }

  protected selectNode() {
    if (this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.nodeModel());
    }
  }
}
