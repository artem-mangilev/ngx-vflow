import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { HandleSizeControllerDirective } from '../../directives/handle-size-controller.directive';
import { NgTemplateOutlet } from '@angular/common';
import { PointerDirective } from '../../directives/pointer.directive';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { isSelectionBoxEndStatus } from '../../services/flow-status.service';

// TODO: fix loading of these by @defer (should work in Angular 18+)
// public components that uses in default node (loaded by defer)
import { ResizableComponent } from '../../public-components/resizable/resizable.component';
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';

export type HandleState = 'valid' | 'invalid' | 'idle';

@Component({
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
    NgTemplateOutlet,
    ResizableComponent,
    HandleSizeControllerDirective,
    NodeHandlesControllerDirective,
  ],
})
export class NodeComponent implements OnInit {
  protected injector = inject(Injector);
  private flowStatusService = inject(FlowStatusService);
  private handleService = inject(HandleService);
  private nodeAccessor = inject(NodeAccessorService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private selectionService = inject(SelectionService);

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

  public ngOnInit(): void {
    this.nodeAccessor.model.set(this.model());
    this.handleService.node.set(this.model());
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
    if (isSelectionBoxEndStatus(this.flowStatusService.status())) {
      return;
    }

    if (this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.model());
    }
  }
}
