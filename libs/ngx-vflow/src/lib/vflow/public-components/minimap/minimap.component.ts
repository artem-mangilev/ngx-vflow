import {
  Component,
  inject,
  OnInit,
  TemplateRef,
  input,
  viewChild,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
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

  protected readonly themeRevision = signal(0);

  /** Refresh resolved canvas colors after external stylesheet/media changes.
   * Ancestor attribute changes (including class, style and theme attributes) refresh automatically.
   */
  public refreshTheme(): void {
    this.themeRevision.update((value) => value + 1);
  }

  /**
   * The corner of the flow where to render a mini-map
   */
  public position = input<MiniMapPosition>('bottom-right');

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
