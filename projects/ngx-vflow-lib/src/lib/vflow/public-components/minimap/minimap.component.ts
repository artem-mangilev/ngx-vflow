import { Component, inject, OnInit, TemplateRef, input, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';

import { MinimapCanvasDirective } from './minimap-canvas.directive';

export type MiniMapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Component({
  selector: 'mini-map',
  imports: [MinimapCanvasDirective],
  templateUrl: './minimap.component.html',
  styles: ['canvas { position: absolute; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniMapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService);

  /**
   * The color outside the viewport (invisible area)
   */
  public maskColor = input(`rgba(215, 215, 215, 0.6)`);

  /**
   * The minimap stroke color
   */
  public strokeColor = input(`rgb(200, 200, 200)`);

  /**
   * The corner of the flow where to render a mini-map
   */
  public position = input<MiniMapPosition>('bottom-right');

  private minimap = viewChild.required<TemplateRef<unknown>>('minimap');

  public ngOnInit(): void {
    const model = new MinimapModel();
    model.template.set(this.minimap());

    this.entitiesService.minimap.set(model);
  }
}
