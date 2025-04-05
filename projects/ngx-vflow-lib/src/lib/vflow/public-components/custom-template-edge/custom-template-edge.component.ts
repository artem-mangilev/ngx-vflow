import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EdgeContext } from '../../interfaces/template-context.interface';

@Component({
  selector: 'g[customTemplateEdge]',
  templateUrl: './custom-template-edge.component.html',
  styleUrls: ['./custom-template-edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CustomTemplateEdgeComponent {
  public context = input.required<EdgeContext['$implicit']>({ alias: 'customTemplateEdge' });
}
