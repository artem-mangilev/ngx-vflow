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
  untracked,
} from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { FlowStatusService, isSelectionBoxEndStatus } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SelectionService } from '../../services/selection.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { NgTemplateOutlet } from '@angular/common';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import {
  EntityComponentOutletDirective,
  EntityComponentOutputEvent,
} from '../../directives/entity-component-outlet.directive';
import { NODE_REF } from '../../utils/inject-node';

// TODO: fix loading of these by @defer (should work in Angular 18+)
// public components that uses in default node (loaded by defer)
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeResizeControllerDirective } from '../../directives/node-resize-controller.directive';

export type HandleState = 'valid' | 'invalid' | 'idle';

@Component({
  selector: 'div[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    HandleService,
    NodeAccessorService,
    // Resolved lazily by presentations, which are created after the node model is set in ngOnInit.
    { provide: NODE_REF, useFactory: () => inject(NodeAccessorService).model()!.context.$implicit },
  ],
  host: {
    class: 'vflow-node',
    '[class.vflow-node--undraggable]': 'hostUndraggable()',
    '[class.vflow-node--drag-handles-only]': 'hostDragHandlesOnly()',
    '[style.visibility]': "model().isReady() ? 'visible' : 'hidden'",
    '(focusin)': 'model().focused.set(true)',
    '(focusout)': 'model().focused.set(false)',
  },
  imports: [
    NgTemplateOutlet,
    EntityComponentOutletDirective,
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
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);
  private componentEventBus = inject(ComponentEventBusService);

  public model = input.required<NodeModel>();

  protected readonly hostUndraggable = computed(() => !this.model().draggable());

  protected readonly hostDragHandlesOnly = computed(
    () => this.model().draggable() && this.model().dragHandlesCount() > 0,
  );

  /**
   * An explicit size goes to the `[resizable]` element when one exists, so its CSS min/max, padding and border
   * apply to the box that is measured. Without one, the wrapper carries the application-provided size.
   */
  protected readonly wrapperSize = computed(() => {
    const model = this.model();
    return model.sizeMode() === 'explicit' && !model.resizerTemplate()
      ? { width: model.width(), height: model.height() }
      : null;
  });

  public nodeTemplate = input<TemplateRef<any>>();

  constructor() {
    effect(() => {
      const model = this.model();
      const groups = this.flowSettingsService.optimization().detachedGroupsLayer
        ? this.nodeRenderingService.groups()
        : [];
      const groupIndex = groups.indexOf(model);
      this.hostRef.nativeElement.style.zIndex = String(
        groupIndex >= 0 ? groupIndex - groups.length : model.renderOrder(),
      );
    });
    effect(() => {
      // Position updates belong to this node, not the enclosing graph list.
      this.hostRef.nativeElement.style.transform = this.model().pointTransformCss();
    });
  }

  public ngOnInit() {
    // Every node is measured by nodeResizeController and stays hidden until then; an explicit size is measured
    // from the wrapper or the resizable element that carries it. A remounted view must measure its new DOM.
    this.model().isMeasured.set(false);

    this.nodeAccessor.model.set(this.model());
    this.handleService.node.set(this.model());
    this.model().nodeElement.set(this.hostRef.nativeElement);

    let wasCulled = false;
    effect(
      () => {
        const model = this.model();
        const culled = model.culled();
        if (wasCulled && !culled) {
          // Restore layout hidden, then refresh dimensions and handles before painting.
          untracked(() => {
            model.isMeasured.set(false);
            model.handles().forEach((handle) => handle.isMeasured.set(false));
          });
        }
        wasCulled = culled;
      },
      { injector: this.injector },
    );

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
    this.model().nodeElement.set(null);

    this.draggableService.destroy(this.hostRef.nativeElement);
  }

  protected pushComponentEvent({ eventName, eventPayload }: EntityComponentOutputEvent) {
    this.componentEventBus.pushNodeEvent({ nodeId: this.model().rawNode.id, eventName, eventPayload });
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
