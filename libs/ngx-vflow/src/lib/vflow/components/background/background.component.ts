import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ViewportService } from '../../services/viewport.service';
import { id } from '../../utils/id';

const DEFAULT_GAP = 20;
const DEFAULT_DOT_SIZE = 2;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_IMAGE_SCALE = 0.1;
const DEFAULT_REPEAT = true;

/** What the template draws, in screen pixels: the tile of the pattern and its offset, which follows the viewport. */
type Pattern =
  | { type: 'dots'; x: number; y: number; gap: number; radius: number }
  | { type: 'grid'; x: number; y: number; gap: number; strokeWidth: number }
  | { type: 'image'; x: number; y: number; width: number; height: number; src: string; repeat: boolean };

@Component({
  standalone: true,
  selector: 'g[background]',
  templateUrl: './background.component.html',
  styles: [
    `
      /* Dots are filled, grid lines are stroked. A fill on the grid path would close each cell into a triangle. */
      circle.v-background-pattern {
        fill: var(--v-background-pattern);
      }

      path.v-background-pattern {
        fill: none;
        stroke: var(--v-background-pattern);
      }

      @media (forced-colors: active) {
        .v-background-pattern {
          forced-color-adjust: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {
  private viewportService = inject(ViewportService);
  private settingsService = inject(FlowSettingsService);

  /** The natural size of the image background, once it has loaded; a failed load draws nothing. */
  private imageSize = resource({
    params: () => {
      const background = this.settingsService.background();
      return background?.type === 'image' ? background.src : null;
    },
    loader: ({ params: src }) => (src ? loadImageSize(src) : Promise.resolve(null)),
  });

  protected readonly pattern = computed<Pattern | null>(() => {
    const background = this.settingsService.background();
    if (!background) return null;
    const { x, y, zoom } = this.viewportService.readableViewport();

    switch (background.type) {
      case 'dots': {
        const gap = zoom * (background.gap ?? DEFAULT_GAP);
        return {
          type: 'dots',
          x: x % gap,
          y: y % gap,
          gap,
          radius: (zoom * (background.size ?? DEFAULT_DOT_SIZE)) / 2,
        };
      }
      case 'grid': {
        const gap = zoom * (background.gap ?? DEFAULT_GAP);
        const strokeWidth = (zoom * (background.strokeWidth ?? DEFAULT_STROKE_WIDTH)) / 2;
        return { type: 'grid', x: x % gap, y: y % gap, gap, strokeWidth };
      }
      case 'image': {
        const size = this.imageSize.value();
        if (!size) return null;
        // A fixed image neither moves with the flow nor zooms with it.
        const scale = (background.fixed ? 1 : zoom) * (background.scale ?? DEFAULT_IMAGE_SCALE);
        const width = size.width * scale;
        const height = size.height * scale;
        const repeat = background.repeat ?? DEFAULT_REPEAT;
        const offset = (value: number, period: number) => (background.fixed ? 0 : repeat ? value % period : value);
        return { type: 'image', src: background.src, repeat, width, height, x: offset(x, width), y: offset(y, height) };
      }
    }
  });

  // Without ID there will be pattern collision for several flows on the page
  // Later pattern ID may be exposed to API
  protected patternId = id();
  protected patternUrl = `url(#${this.patternId})`;
}

function loadImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error(`The background image ${src} did not load`));
    image.src = src;
  });
}
