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
import { FlowStatusService, isSelectionBoxEndStatus } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { NgTemplateOutlet, NgComponentOutlet, AsyncPipe } from '@angular/common';
import { DefaultNodeComponent } from '../default-node/default-node.component';

// TODO: fix loading of these by @defer (should work in Angular 18+)
// public components that uses in default node (loaded by defer)
import { ResizableComponent } from '../../public-components/resizable/resizable.component';
import { HandleComponent } from '../../public-components/handle/handle.component';
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeResizeControllerDirective } from '../../directives/node-resize-controller.directive';

export type HandleState = 'valid' | 'invalid' | 'idle';

@Component({
  selector: 'div[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService, NodeAccessorService],
  host: {
    class: 'vflow-node',
    '[class.vflow-node--undraggable]': 'hostUndraggable()',
    '[class.vflow-node--drag-handles-only]': 'hostDragHandlesOnly()',
    '[style.visibility]': "model().isMeasured() ? 'visible' : 'hidden'",
  },
  imports: [
    DefaultNodeComponent,
    HandleComponent,
    NgTemplateOutlet,
    NgComponentOutlet,
    ResizableComponent,
    NodeHandlesControllerDirective,
    NodeResizeControllerDirective,
    AsyncPipe,
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
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);

  public model = input.required<NodeModel>();

  protected readonly hostUndraggable = computed(() => !this.model().draggable());

  protected readonly hostDragHandlesOnly = computed(
    () => this.model().draggable() && this.model().dragHandlesCount() > 0,
  );

  public nodeTemplate = input<TemplateRef<any>>();

  public groupNodeTemplate = input<TemplateRef<any>>();

  public ngOnInit() {
    this.model().isVisible.set(true);

    // Nodes whose size is content-driven (html-template / component) are measured
    // by nodeResizeController; until then they stay hidden. Other node types have
    // explicit dimensions and are considered measured immediately.
    const type = this.model().rawNode.type;
    if (type !== 'html-template' && !this.model().isComponentType) {
      this.model().isMeasured.set(true);
    }

    this.nodeAccessor.model.set(this.model());
    this.handleService.node.set(this.model());
    this.model().nodeElement.set(this.hostRef.nativeElement);

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

  protected pullNode() {
    if (this.flowSettingsService.elevateNodesOnSelect()) {
      this.nodeRenderingService.pullNode(this.model());
    }
  }

  protected selectNode() {
    // do not select node if selection is performed by selection box
    if (isSelectionBoxEndStatus(this.flowStatusService.status())) {
      return;
    }

    if (this.model().selectable()) {
      this.selectionService.select(this.model());
    }
  }
}
