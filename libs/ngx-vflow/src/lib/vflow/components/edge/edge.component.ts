import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  Injector,
  TemplateRef,
  inject,
  input,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { EdgeModel } from '../../models/edge.model';
import { EdgeContext } from '../../interfaces/template-context.interface';
import { SelectionService } from '../../services/selection.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { HandleModel } from '../../models/handle.model';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import {
  EntityComponentOutletDirective,
  EntityComponentOutputEvent,
} from '../../directives/entity-component-outlet.directive';
import { EDGE_REF } from '../../utils/inject-edge';
import { FlowStatusService, isSelectionBoxEndStatus } from '../../services/flow-status.service';
import { isNoSelectTarget } from '../../utils/no-select-target';

@Component({
  selector: 'svg[edge]',
  templateUrl: './edge.component.html',
  styleUrls: ['./edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusin)': 'model().focused.set(true)',
    '(focusout)': 'model().focused.set(false)',
    // Clicks from the interaction stroke and from presentation elements bubble here.
    '(click)': 'onClick($event)',
    class: 'v-edge',
  },
  providers: [
    // Resolved lazily by presentations, which are created after the model input is set.
    { provide: EDGE_REF, useFactory: () => inject(EdgeComponent).model().context.$implicit },
  ],
  imports: [NgTemplateOutlet, EntityComponentOutletDirective],
})
export class EdgeComponent {
  protected injector = inject(Injector);
  private selectionService = inject(SelectionService);
  private flowSettingsService = inject(FlowSettingsService);
  private edgeRenderingService = inject(EdgeRenderingService);
  private componentEventBus = inject(ComponentEventBusService);
  private flowStatusService = inject(FlowStatusService);

  // TODO remove dependency from this directive
  private connectionController = inject(ConnectionControllerDirective);

  public model = input.required<EdgeModel>();

  public edgeTemplate = input<TemplateRef<EdgeContext>>();

  constructor() {
    const element = inject<ElementRef<SVGElement>>(ElementRef).nativeElement;
    effect(() => {
      // Pending until both endpoints are placed, and while the edge is being reconnected (the stylesheet hides it).
      element.toggleAttribute('data-v-pending', !this.model().isReady() || this.model().reconnecting());
    });

    effect(() => {
      // CSS culling retains the view; an effect, not a template binding, so the graph list does not follow it.
      element.style.display = this.model().culled() ? 'none' : '';
    });

    effect(() => {
      element.style.zIndex = String(this.model().renderOrder());
    });

    effect(() => {
      // Elevation follows the selection itself, whether it came from a click, the keyboard, the selection box or
      // the application.
      if (this.flowSettingsService.elevateEdgesOnSelect() && this.model().selected()) {
        untracked(() => this.edgeRenderingService.pull(this.model()));
      }
    });
  }

  public select() {
    // A selection box gesture ends with a click that must not select the edge under the pointer.
    if (isSelectionBoxEndStatus(this.flowStatusService.status())) {
      return;
    }

    if (this.model().selectable()) {
      this.selectionService.select(this.model());
    }
  }

  protected onClick(event: Event) {
    if (isNoSelectTarget(event.target)) {
      return;
    }

    this.select();
  }

  protected pushComponentEvent({ eventName, eventPayload }: EntityComponentOutputEvent) {
    this.componentEventBus.pushEdgeEvent({ edgeId: this.model().edge.id, eventName, eventPayload });
  }

  protected startReconnection(event: PointerEvent, handle: HandleModel) {
    // The press belongs to the reconnection, not to a pan of the pane.
    event.stopPropagation();

    this.connectionController.startReconnection(handle, this.model(), event);
  }
}
