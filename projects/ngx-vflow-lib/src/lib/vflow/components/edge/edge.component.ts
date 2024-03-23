import { ChangeDetectionStrategy, Component, Input, TemplateRef, computed } from '@angular/core';
import { EdgeModel } from '../../models/edge.model';
import { hashCode } from '../../utils/hash';

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

  protected markerStartUrl = computed(() => {
    const marker = this.model.edge.markers?.start

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : ''
  })

  protected markerEndUrl = computed(() => {
    const marker = this.model.edge.markers?.end

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : ''
  })

  protected readonly defaultColor = 'rgb(177, 177, 183)'

  public getContext() {
    return {
      $implicit: {
        edge: this.model.edge,
        // TODO create signal outside context
        path: computed(() => this.model.path().path)
      }
    }
  }
}
