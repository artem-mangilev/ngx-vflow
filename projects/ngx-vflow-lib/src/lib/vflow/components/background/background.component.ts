import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { RootSvgReferenceDirective } from '../../directives/reference.directive';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ViewportService } from '../../services/viewport.service';
import { id } from '../../utils/id';
import { toLazySignal } from '../../utils/signals/to-lazy-signal';

const defaultBg = '#fff';
const defaultGap = 20;
const defaultDotSize = 2;
const defaultDotColor = 'rgb(177, 177, 183)';
const defaultGridSize = 40;
const defaultStrokeWidth = 2;
const defaultImageScale = 0.1;
const defaultRepeated = true;

@Component({
  standalone: true,
  selector: 'g[background]',
  templateUrl: './background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {
  private viewportService = inject(ViewportService);
  private rootSvg = inject(RootSvgReferenceDirective).element;
  private settingsService = inject(FlowSettingsService);

  protected backgroundSignal = this.settingsService.background;

  protected x = computed(() => {
    return this.viewportService.readableViewport().x % this.scaledGap();
  });

  protected y = computed(() => {
    return this.viewportService.readableViewport().y % this.scaledGap();
  });

  protected patternColor = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'dots' || background.type === 'grid') {
      return background.color ?? defaultDotColor;
    }

    return defaultDotColor;
  });

  protected patternSize = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'dots') {
      return (this.viewportService.readableViewport().zoom * (background.size ?? defaultDotSize)) / 2;
    }

    if (background.type === 'grid') {
      return (this.viewportService.readableViewport().zoom * (background.size ?? defaultGridSize)) / 2;
    }

    return 0;
  });

  protected scaledGap = computed(() => {
    const background = this.backgroundSignal();
    const zoom = this.viewportService.readableViewport().zoom;

    if (background.type === 'dots') {
      return zoom * (background.gap ?? defaultGap);
    }

    if (background.type === 'grid') {
      return zoom * (background.size ?? defaultGridSize);
    }

    return 0;
  });

  // GRID PATTERN
  protected strokeWidth = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'grid') {
      const zoom = this.viewportService.readableViewport().zoom;
      return zoom * ((background.strokeWidth ?? defaultStrokeWidth) / 2);
    }

    return 0;
  });

  // IMAGE PATTERN
  protected bgImageSrc = computed(() => {
    const background = this.backgroundSignal();

    return background.type === 'image' ? background.src : '';
  });

  protected imageSize = toLazySignal(
    toObservable(this.backgroundSignal).pipe(
      switchMap(() => createImage(this.bgImageSrc())),
      map((image) => ({ width: image.naturalWidth, height: image.naturalHeight })),
    ),
    { initialValue: { width: 0, height: 0 } },
  );

  protected scaledImageWidth = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'image') {
      const zoom = background.fixed ? 1 : this.viewportService.readableViewport().zoom;

      return this.imageSize().width * zoom * (background.scale ?? defaultImageScale);
    }

    return 0;
  });

  protected scaledImageHeight = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'image') {
      const zoom = background.fixed ? 1 : this.viewportService.readableViewport().zoom;

      return this.imageSize().height * zoom * (background.scale ?? defaultImageScale);
    }

    return 0;
  });

  protected imageX = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'image') {
      if (!background.repeat) {
        return background.fixed ? 0 : this.viewportService.readableViewport().x;
      }

      return background.fixed ? 0 : this.viewportService.readableViewport().x % this.scaledImageWidth();
    }

    return 0;
  });

  protected imageY = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === 'image') {
      if (!background.repeat) {
        return background.fixed ? 0 : this.viewportService.readableViewport().y;
      }

      return background.fixed ? 0 : this.viewportService.readableViewport().y % this.scaledImageHeight();
    }

    return 0;
  });

  protected repeated = computed(() => {
    const background = this.backgroundSignal();

    return background.type === 'image' && (background.repeat ?? defaultRepeated);
  });

  // Without ID there will be pattern collision for several flows on the page
  // Later pattern ID may be exposed to API
  protected patternId = id();
  protected patternUrl = `url(#${this.patternId})`;

  constructor() {
    effect(() => {
      const background = this.backgroundSignal();

      if (background.type === 'dots') {
        this.rootSvg.style.backgroundColor = background.backgroundColor ?? defaultBg;
      }

      if (background.type === 'grid') {
        this.rootSvg.style.backgroundColor = background.backgroundColor ?? defaultBg;
      }

      if (background.type === 'solid') {
        this.rootSvg.style.backgroundColor = background.color;
      }
    });
  }
}

function createImage(url: string) {
  const image = new Image();

  image.src = url;

  return new Promise<HTMLImageElement>((resolve) => {
    image.onload = () => resolve(image);
  });
}
