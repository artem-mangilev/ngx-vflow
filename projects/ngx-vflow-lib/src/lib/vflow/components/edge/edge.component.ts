import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild, computed } from '@angular/core';
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
}
