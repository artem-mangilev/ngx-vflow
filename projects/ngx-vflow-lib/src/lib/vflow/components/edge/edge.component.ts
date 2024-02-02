import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { EdgeModel } from '../../models/edge.model';

@Component({
  selector: 'g[edge]',
  templateUrl: './edge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeComponent {
  @Input()
  public edgeModel!: EdgeModel

  @Input()
  public edgeLabelHtmlTemplate?: TemplateRef<any>
}
