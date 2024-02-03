import { ChangeDetectionStrategy, Component, Input, TemplateRef, computed } from '@angular/core';
import { EdgeModel } from '../../models/edge.model';

@Component({
  selector: 'g[edge]',
  templateUrl: './edge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeComponent {
  @Input()
  public model!: EdgeModel

  @Input()
  public edgeTemplate?: TemplateRef<any>

  @Input()
  public edgeLabelHtmlTemplate?: TemplateRef<any>

  public getContext() {
    return {
      $implicit: {
        edge: this.model.edge,
        path: computed(() => this.model.path().path)
      }
    }
  }
}
