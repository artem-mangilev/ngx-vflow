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
import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { NodeModel } from '../../models/node.model';
import { DraggableService } from '../../services/draggable.service';
import { HandleService } from '../../services/handle.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { FlowStatusService, isSelectionBoxEndStatus } from '../../services/flow-status.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { OverlaysService } from '../../services/overlays.service';
import { DefaultNodeComponent } from '../default-node/default-node.component';
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeResizeControllerDirective } from '../../directives/node-resize-controller.directive';
import { HandleComponent } from '../../public-components/handle/handle.component';
import { RootPointerDirective } from '../../directives/root-pointer.directive';

@Component({
  selector: 'div[nodeHtml]',
  templateUrl: './node-html.component.html',
  styleUrls: ['./node-html.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService, NodeAccessorService],
  host: {
    class: 'vflow-node vflow-node-html',
    '[class.vflow-node--undraggable]': 'hostUndraggable()',
    '[class.vflow-node--drag-handles-only]': 'hostDragHandlesOnly()',
    '[style.transform]': 'model().pointTransform()',
    '[style.z-index]': 'model().renderOrder()',
    '[style.width.px]': 'model().width()',
    '[style.height.px]': 'model().height()',
    '[class.selectable]': 'true',
    '[style.visibility]': 'model().shouldLoad() ? "visible" : "hidden"',
  },
  imports: [
    DefaultNodeComponent,
    NgTemplateOutlet,
    NgComponentOutlet,
    AsyncPipe,
    NodeHandlesControllerDirective,
    NodeResizeControllerDirective,
    HandleComponent,
  ],
})
export class NodeHtmlComponent implements OnInit, OnDestroy {
  protected injector = inject(Injector);
  private handleService = inject(HandleService);
  private draggableService = inject(DraggableService);
  private flowStatusService = inject(FlowStatusService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private selectionService = inject(SelectionService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);
  private overlaysService = inject(OverlaysService);
  private rootPointer = inject(RootPointerDirective);

  public model = input.required<NodeModel>();

  public nodeTemplate = input<TemplateRef<any>>();

  protected readonly hostUndraggable = computed(() => !this.model().draggable());

  protected readonly hostDragHandlesOnly = computed(
    () => this.model().draggable() && this.model().dragHandlesCount() > 0,
  );

  protected toolbars = computed(() => this.overlaysService.nodeToolbarsMap().get(this.model()));

  public ngOnInit(): void {
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

  protected onTouchStart(event: TouchEvent) {
    this.rootPointer.setInitialTouch(event);
  }
}
