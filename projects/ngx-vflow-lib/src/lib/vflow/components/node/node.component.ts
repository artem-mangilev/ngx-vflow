import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
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
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeResizeControllerDirective } from '../../directives/node-resize-controller.directive';

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
    NodeHandlesControllerDirective,
    NodeResizeControllerDirective,
  ],
})
export class NodeComponent implements OnInit, OnDestroy {
  protected injector = inject(Injector);
  private handleService = inject(HandleService);
  private draggableService = inject(DraggableService);
  private flowStatusService = inject(FlowStatusService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private selectionService = inject(SelectionService);
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);
  private overlaysService = inject(OverlaysService);

  // TODO remove dependency from this directive
  private connectionController = inject(ConnectionControllerDirective, { optional: true });

  public model = input.required<NodeModel>();

  public nodeTemplate = input<TemplateRef<any>>();

  public nodeSvgTemplate = input<TemplateRef<any>>();

  public groupNodeTemplate = input<TemplateRef<any>>();

  protected showMagnet = computed(
    () =>
      this.flowStatusService.status().state === 'connection-start' ||
      this.flowStatusService.status().state === 'connection-validation' ||
      this.flowStatusService.status().state === 'reconnection-start' ||
      this.flowStatusService.status().state === 'reconnection-validation',
  );

  protected toolbars = computed(() => this.overlaysService.nodeToolbarsMap().get(this.model()));

  public ngOnInit() {
    this.model().isVisible.set(true);

    this.nodeAccessor.model.set(this.model());
    this.handleService.node.set(this.model());

    effect(
      () => {
        if (this.model().draggable()) {
          this.draggableService.enable(this.hostRef.nativeElement, this.model());
        } else {
          this.draggableService.disable(this.hostRef.nativeElement);
        }
      },
      { injector: this.injector },
    );
  }

  public ngOnDestroy(): void {
    this.model().isVisible.set(false);

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
    if (this.flowSettingsService.elevateNodesOnSelect()) {
      this.nodeRenderingService.pullNode(this.model());
    }
  }

  protected selectNode() {
    if (this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.model());
    }
  }
}
