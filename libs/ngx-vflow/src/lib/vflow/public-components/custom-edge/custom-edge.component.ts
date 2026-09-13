import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EdgeComponent } from '../../components/edge/edge.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { EdgeRenderingService } from '../../services/edge-rendering.service';

/**
 * Wraps a custom edge path with a transparent 20px interaction stroke, so the edge can be hit and
 * selected while the rest of the edge SVG stays transparent to pointer input. Works in an
 * `ng-template[edge]` presentation and inside an edge component.
 */
@Component({
  selector: 'g[customEdge]',
  templateUrl: './custom-edge.component.html',
  styleUrls: ['./custom-edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: {
    '(mousedown)': 'pull()',
    '(touchstart)': 'pull()',
  },
})
export class CustomEdgeComponent {
  private edge = inject(EdgeComponent);
  private flowSettingsService = inject(FlowSettingsService);
  private edgeRenderingService = inject(EdgeRenderingService);

  protected model = this.edge.model();
  protected context = this.model.context.$implicit;

  protected pull() {
    if (this.flowSettingsService.elevateEdgesOnSelect()) {
      this.edgeRenderingService.pull(this.model);
    }
  }
}
