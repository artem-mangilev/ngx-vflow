import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { bindEntityAccessibility } from '../../directives/entity-accessibility.directive';
import { FlowRenderingService } from '../../services/flow-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';

import { MinimapCanvasDirective } from './minimap-canvas.directive';

/**
 * An overview of the whole graph with the part in view marked, drawn on a canvas. The element is the block: size it,
 * give it a border, a radius or a shadow with CSS, and place it with `vPanel` or with your own styles.
 *
 * ```html
 * <vflow [nodes]="nodes">
 *   <v-minimap vPanel="bottom-right" [pannable]="true" />
 * </vflow>
 * ```
 *
 * Nodes are filled with `--v-minimap-node`. The style of a node's component in `withMinimapSettings()` and
 * `Node.minimap` change how a node is drawn.
 */
@Component({
  selector: 'v-minimap',
  imports: [MinimapCanvasDirective],
  templateUrl: './minimap.component.html',
  styles: [
    `
      /* Without specificity: any selector of the application wins, an element selector included. */
      :where(:host) {
        display: block;
        width: clamp(120px, 20%, 240px);
        aspect-ratio: 4 / 3;
        background: var(--v-background);
        /* Clips the canvas to a border radius set by the application. */
        overflow: hidden;
      }

      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'v-minimap',
    // Hidden with the other viewport layers until the first layout is complete.
    '[attr.data-v-pending]': "flowInitialized() ? null : ''",
    // A read-only minimap lets the pointer through to the pane, whatever the layer it is in says.
    '[style.pointer-events]': 'pannable() || zoomable() ? null : "none"',
  },
})
export class VflowMinimapComponent {
  /** Enable click, drag and scroll panning, subject to the main flow gesture settings. */
  public pannable = input(false);

  /** Enable wheel and trackpad pinch zoom, subject to the main flow gesture settings. */
  public zoomable = input(false);

  protected flowInitialized = inject(FlowRenderingService).flowInitialized;

  constructor() {
    const settings = inject(FlowSettingsService);
    bindEntityAccessibility(() => ({ role: 'img', label: settings.ariaLabels().minimapLabel }));
  }
}
