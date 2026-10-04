import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  isDevMode,
  ChangeDetectionStrategy,
} from '@angular/core';
import { bindEntityAccessibility } from '../../directives/entity-accessibility.directive';
import { FlowRenderingService } from '../../services/flow-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';

import { MinimapCanvasDirective } from './minimap-canvas.directive';

export type MinimapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Component({
  selector: 'v-minimap',
  imports: [MinimapCanvasDirective],
  templateUrl: './minimap.component.html',
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        /* Above the pane, the only other layer of the flow with a z-index. */
        z-index: 2;
      }

      canvas {
        position: absolute;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'v-minimap',
    // Hidden with the other viewport layers until the first layout is complete.
    '[style.visibility]': 'initialized() ? null : "hidden"',
  },
})
export class VflowMinimapComponent {
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

  protected initialized = inject(FlowRenderingService).flowInitialized;

  constructor() {
    const settings = inject(FlowSettingsService);
    bindEntityAccessibility(() => ({ role: 'img', label: settings.ariaLabels().minimapLabel }));

    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      // Content that no slot selects is never attached, so the minimap would silently stay off screen.
      if (isDevMode() && !host.closest('.v-root')) {
        console.warn(
          '[ngx-vflow] <v-minimap> renders only as a direct child of <vflow>. ' +
            'Mark a wrapping component with ngProjectAs="v-minimap".',
        );
      }
    });
  }
}
