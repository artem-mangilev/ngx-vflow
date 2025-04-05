import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EdgeComponent } from '../../components/edge/edge.component';

@Component({
  selector: 'g[customTemplateEdge]',
  templateUrl: './custom-template-edge.component.html',
  styleUrls: ['./custom-template-edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CustomTemplateEdgeComponent {
  protected context = inject(EdgeComponent).edgeContext.$implicit;
}
