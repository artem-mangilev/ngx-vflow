import { ChangeDetectionStrategy, Component, Input, OnInit, Signal, TemplateRef, computed } from '@angular/core';
import { EdgeModel } from '../../models/edge.model';
import { hashCode } from '../../utils/hash';
import { EdgeContext } from '../../interfaces/template-context.interface';

@Component({
  selector: 'g[edge]',
  templateUrl: './edge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeComponent implements OnInit {
  @Input()
  public model!: EdgeModel

  @Input()
  public edgeTemplate?: TemplateRef<EdgeContext>

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

  protected edgeContext!: EdgeContext

  public ngOnInit(): void {
    this.edgeContext = {
      $implicit: {
        // TODO: check if edge could change
        edge: this.model.edge,
        path: computed(() => this.model.path().path),
        markerStart: this.markerStartUrl,
        markerEnd: this.markerEndUrl
      }
    }
  }
}
