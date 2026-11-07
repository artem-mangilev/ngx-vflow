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
import { ConnectionService } from '../../services/connection.service';
import { SelectionService } from '../../services/selection.service';
import { isNoSelectTarget } from '../../utils/no-select-target';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { NgTemplateOutlet } from '@angular/common';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import {
  EntityComponentOutletDirective,
  EntityComponentOutputEvent,
} from '../../directives/entity-component-outlet.directive';
import { NODE_REF } from '../../utils/inject-node';
import { NodeContext } from '../../interfaces/template-context.interface';
import { NODE_MODEL } from '../../utils/node-model.token';
import { HandleModel } from '../../models/handle.model';
import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeMeasureDirective } from '../../directives/node-measure.directive';

@Component({
  selector: 'div[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // Resolved lazily by the content of the node, which is created after the model input is set.
    { provide: NODE_MODEL, useFactory: () => inject(NodeComponent).model() },
    { provide: NODE_REF, useFactory: () => inject(NODE_MODEL).context.$implicit },
  ],
  // The host lives in a view of the graph list, so a signal read in a host binding joins the reactive consumer of
  // the whole list: a change refreshes every entity view. Rendering state (pending, culling, order, position) is
  // therefore written by effects. The public identity and selection attributes are host bindings by decision
  // (2026-11-01): a selection change is rare next to a pan, and one pass over the list is accepted for it.
  host: {
    '[attr.data-v-node]': 'model().rawNode.id',
    '[attr.data-v-selected]': "model().selected() ? '' : null",
    '[attr.data-v-preselected]': "model().preselected() ? '' : null",
    '(focusin)': 'model().focused.set(true)',
    '(focusout)': 'model().focused.set(false)',
    // Clicks from the presentation bubble here; a drag or a resize suppresses the click that follows it.
    '(click)': 'onClick($event)',
  },
  imports: [NgTemplateOutlet, EntityComponentOutletDirective, NodeHandlesControllerDirective, NodeMeasureDirective],
})
export class NodeComponent implements OnInit, OnDestroy {
  protected injector = inject(Injector);
  private draggableService = inject(DraggableService);
  private connection = inject(ConnectionService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private componentEventBus = inject(ComponentEventBusService);
  private selectionService = inject(SelectionService);

  /** Every handle of every node gets a magnet while any connection is in progress. */
  protected readonly connectionActive = this.connection.active;

  public model = input.required<NodeModel>();

  /**
   * An explicit size goes to the `[vResizable]` element when one exists, so its CSS min/max, padding and border
   * apply to the box that is measured. Without one, the wrapper carries the explicit axes; an `auto` axis stays unset.
   */
  protected readonly wrapperSize = computed(() => {
    const model = this.model();
    return model.resizerTemplate() ? null : { width: model.explicitWidth(), height: model.explicitHeight() };
  });

  public nodeTemplate = input<TemplateRef<NodeContext>>();

  constructor() {
    effect(() => {
      // A node that drags takes touch movement for its drag, also where the pane leaves touch scrolling to the
      // page; one that does not, or drags only from its drag handles, leaves the touch to the page.
      const model = this.model();
      const dragsFromBody = model.draggable() && model.dragHandlesCount() === 0;
      this.hostRef.nativeElement.style.touchAction = dragsFromBody ? '' : 'auto';
    });
    // The node is pending until it is measured and every handle is placed (the flow stylesheet hides it). Once shown
    // it stays shown: a handle added later hides itself until it is measured, instead of blinking the whole node. A
    // node whose own measurement is reset (a remount, a restore from CSS culling) waits for every handle again.
    let shown = false;
    effect(() => {
      const model = this.model();
      shown = model.isMeasured() && (shown || model.isReady());
      this.hostRef.nativeElement.toggleAttribute('data-v-pending', !shown);
    });
    effect(() => {
      // CSS culling retains the view; an effect, not a template binding, so the graph list does not follow it.
      this.hostRef.nativeElement.style.display = this.model().culled() ? 'none' : '';
    });
    effect(() => {
      const model = this.model();
      const groups = this.flowSettingsService.parentsBelowEdges() ? this.nodeRenderingService.groups() : [];
      const groupIndex = groups.indexOf(model);
      this.hostRef.nativeElement.style.zIndex = String(
        groupIndex >= 0 ? groupIndex - groups.length : model.renderOrder(),
      );
    });
    effect(() => {
      // Position updates belong to this node, not the enclosing graph list.
      this.hostRef.nativeElement.style.transform = this.model().pointTransformCss();
    });
    effect(() => {
      // Elevation follows the selection itself, whether it came from a click, the keyboard, the selection box or
      // the application.
      if (this.flowSettingsService.elevateNodesOnSelect() && this.model().selected()) {
        untracked(() => this.nodeRenderingService.pullNode(this.model()));
      }
    });
  }

  public ngOnInit() {
    // Every node is measured by nodeMeasure and stays hidden until then; an explicit size is measured
    // from the wrapper or the resizable element that carries it. A remounted view must measure its new DOM.
    this.model().isMeasured.set(false);
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
            model.handles().forEach((handle) => handle.reset());
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

  protected pushComponentEvent(event: EntityComponentOutputEvent): void {
    this.componentEventBus.pushNodeEvent({ nodeId: this.model().rawNode.id, ...event });
  }

  protected hoverHandle(handle: HandleModel) {
    this.connection.hover(handle);
  }

  protected leaveHandle(handle: HandleModel) {
    this.connection.leave(handle);
  }

  protected onClick(event: Event) {
    if (isNoSelectTarget(event.target)) {
      return;
    }

    if (this.model().selectable()) {
      this.selectionService.select(this.model());
    }
  }
}
