import { ChangeDetectionStrategy, Component, Injector, TemplateRef, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { EdgeModel } from '../../models/edge.model';
import { EdgeContext } from '../../interfaces/template-context.interface';
import { SelectionService } from '../../services/selection.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { EdgeLabelComponent } from '../edge-label/edge-label.component';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { HandleModel } from '../../models/handle.model';
import { FlowStatusService } from '../../services/flow-status.service';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import { PointerDirective } from '../../directives/pointer.directive';

@Component({
  selector: 'g[edge]',
  templateUrl: './edge.component.html',
  styleUrls: ['./edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'selectable',
    '[style.visibility]': 'isReconnecting() ? "hidden" : "visible"',
  },
  imports: [NgTemplateOutlet, EdgeLabelComponent, PointerDirective],
})
export class EdgeComponent {
  protected injector = inject(Injector);
  private selectionService = inject(SelectionService);
  private flowSettingsService = inject(FlowSettingsService);
  private flowStatusService = inject(FlowStatusService);
  private edgeRenderingService = inject(EdgeRenderingService);

  // TODO remove dependency from this directive
  private connectionController = inject(ConnectionControllerDirective, { optional: true });

  public model = input.required<EdgeModel>();

  public edgeTemplate = input<TemplateRef<EdgeContext>>();

  public edgeLabelHtmlTemplate = input<TemplateRef<any>>();

  protected isReconnecting = computed(() => {
    const status = this.flowStatusService.status();
    const isReconnecting = status.state === 'reconnection-start' || status.state === 'reconnection-validation';

    return isReconnecting && status.payload.oldEdge === this.model();
  });

  public select() {
    if (this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.model());
    }
  }

  public pull() {
    if (this.flowSettingsService.elevateEdgesOnSelect()) {
      this.edgeRenderingService.pull(this.model());
    }
  }

  protected startReconnection(event: Event, handle: HandleModel) {
    // ignore drag by stopping propagation
    event.stopPropagation();

    this.connectionController?.startReconnection(handle, this.model());
  }
}
