import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EdgeComponent } from '../../components/edge/edge.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { EdgeRenderingService } from '../../services/edge-rendering.service';

@Component({
  selector: 'g[customTemplateEdge]',
  templateUrl: './custom-template-edge.component.html',
  styleUrls: ['./custom-template-edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: {
    '(mousedown)': 'pull()',
    '(touchstart)': 'pull()',
  },
})
export class CustomTemplateEdgeComponent {
  private edge = inject(EdgeComponent);
  private flowSettingsService = inject(FlowSettingsService);
  private edgeRenderingService = inject(EdgeRenderingService);

  protected model = this.edge.model();
  protected context = this.edge.edgeContext.$implicit;

  protected pull() {
    if (this.flowSettingsService.elevateEdgesOnSelect()) {
      this.edgeRenderingService.pull(this.model);
    }
  }
}
