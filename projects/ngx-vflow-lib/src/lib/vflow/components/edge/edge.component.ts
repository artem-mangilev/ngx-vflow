import { ChangeDetectionStrategy, Component, Input, OnInit, computed } from '@angular/core';
import { EdgeModel } from '../../models/edge.model';
import { path as d3Path } from 'd3-path'

@Component({
  selector: 'g[edge]',
  templateUrl: './edge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeComponent {
  @Input()
  public edgeModel!: EdgeModel

  public path = computed(() => {
    const sourcePosition = {
      x: this.edgeModel.source.point().x + this.edgeModel.source.sourcePoint().x,
      y: this.edgeModel.source.point().y + this.edgeModel.source.sourcePoint().y
    }

    const targetPosition = {
      x: this.edgeModel.target.point().x + this.edgeModel.target.targetPoint().x,
      y: this.edgeModel.target.point().y + this.edgeModel.target.targetPoint().y
    }

    const path = d3Path()

    path.moveTo(sourcePosition.x, sourcePosition.y)
    path.lineTo(targetPosition.x, targetPosition.y)

    return path.toString()
  })

}
