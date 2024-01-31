import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef, computed } from '@angular/core';
import { EdgeModel } from '../../models/edge.model';
import { bezierPath } from '../../math/edge-path/bezier-path';
import { straightPath } from '../../math/edge-path/straigh-path';

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

  public path = computed(() => {
    const source = {
      x: this.edgeModel.source.point().x + this.edgeModel.source.sourcePoint().x,
      y: this.edgeModel.source.point().y + this.edgeModel.source.sourcePoint().y
    }

    const target = {
      x: this.edgeModel.target.point().x + this.edgeModel.target.targetPoint().x,
      y: this.edgeModel.target.point().y + this.edgeModel.target.targetPoint().y
    }

    switch (this.edgeModel.type) {
      case 'straight':
        return straightPath(source, target)
      case 'bezier':
        return bezierPath(source, target,
          this.edgeModel.source.sourcePosition,
          this.edgeModel.target.targetPosition
        )
    }
  })
}
