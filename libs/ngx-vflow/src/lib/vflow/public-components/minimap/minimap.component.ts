import { Component, inject, OnInit, TemplateRef, input, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';

import { MinimapCanvasDirective } from './minimap-canvas.directive';

export type MinimapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Component({
  selector: 'v-minimap',
  imports: [MinimapCanvasDirective],
  templateUrl: './minimap.component.html',
  styles: ['canvas { position: absolute; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VflowMinimapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService);

  /**
   * The corner of the flow where to render a minimap
   */
  public position = input<MinimapPosition>('bottom-right');

  /** Enable click, drag and scroll panning, subject to the main flow gesture settings. */
  public pannable = input(false);

  /** Enable wheel and trackpad pinch zoom, subject to the main flow gesture settings. */
  public zoomable = input(false);

  /** Multiplicative wheel zoom increment; invalid values fall back to 0.1. */
  public zoomStep = input(0.1);

  private minimap = viewChild.required<TemplateRef<unknown>>('minimap');

  public ngOnInit(): void {
    const model = new MinimapModel();
    model.template.set(this.minimap());

    this.entitiesService.minimap.set(model);
  }
}
