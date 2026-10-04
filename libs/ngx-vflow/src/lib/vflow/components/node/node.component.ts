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
import { FlowStatusService } from '../../services/flow-status.service';
import { HandleService } from '../../services/handle.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { NgTemplateOutlet } from '@angular/common';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import {
  EntityComponentOutletDirective,
  EntityComponentOutputEvent,
} from '../../directives/entity-component-outlet.directive';
import { NODE_REF } from '../../utils/inject-node';
import { PointerDirective } from '../../directives/pointer.directive';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { HandleModel } from '../../models/handle.model';

// TODO: fix loading of these by @defer (should work in Angular 18+)
// public components that uses in default node (loaded by defer)
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeResizeControllerDirective } from '../../directives/node-resize-controller.directive';

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
  // No signal reads in host bindings: the host lives in a view of the graph list, whose reads join the reactive
  // consumer of the whole list, so one node becoming ready would refresh every entity view.
  host: {
    class: 'v-node',
    '(focusin)': 'model().focused.set(true)',
    '(focusout)': 'model().focused.set(false)',
  },
  imports: [
    NgTemplateOutlet,
    EntityComponentOutletDirective,
    NodeHandlesControllerDirective,
    NodeResizeControllerDirective,
    PointerDirective,
  ],
})
export class NodeComponent implements OnInit, OnDestroy {
  protected injector = inject(Injector);
  private handleService = inject(HandleService);
  private draggableService = inject(DraggableService);
  private flowStatusService = inject(FlowStatusService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);
  private componentEventBus = inject(ComponentEventBusService);
  private connectionController = inject(ConnectionControllerDirective);

  /** Every handle of every node gets a magnet while any connection is in progress. */
  protected readonly connectionActive = this.flowStatusService.connectionActive.asReadonly();

  public model = input.required<NodeModel>();

  protected readonly hostUndraggable = computed(() => !this.model().draggable());

  protected readonly hostDragHandlesOnly = computed(
    () => this.model().draggable() && this.model().dragHandlesCount() > 0,
  );

  /**
   * An explicit size goes to the `[vResizable]` element when one exists, so its CSS min/max, padding and border
   * apply to the box that is measured. Without one, the wrapper carries the explicit axes; an `auto` axis stays unset.
   */
  protected readonly wrapperSize = computed(() => {
    const model = this.model();
    return model.resizerTemplate() ? null : { width: model.explicitWidth(), height: model.explicitHeight() };
  });

  public nodeTemplate = input<TemplateRef<any>>();

  constructor() {
    effect(() => {
      const classes = this.hostRef.nativeElement.classList;
      classes.toggle('v-node--undraggable', this.hostUndraggable());
      classes.toggle('v-node--drag-handles-only', this.hostDragHandlesOnly());
    });
    effect(() => {
      // A ready node inherits visibility, so the flow can keep it hidden until its first layout is complete.
      this.hostRef.nativeElement.style.visibility = this.model().isReady() ? '' : 'hidden';
    });
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

  protected endConnection() {
    this.connectionController.endConnection();
  }

  protected validateConnection(handle: HandleModel) {
    this.connectionController.validateConnection(handle);
  }

  protected resetValidateConnection(handle: HandleModel) {
    this.connectionController.resetValidateConnection(handle);
  }

  protected pullNode() {
    if (this.flowSettingsService.elevateNodesOnSelect()) {
      this.nodeRenderingService.pullNode(this.model());
    }
  }
}
