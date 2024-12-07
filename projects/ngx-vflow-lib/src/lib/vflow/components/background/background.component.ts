import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ViewportService } from '../../services/viewport.service';
import { RootSvgReferenceDirective } from '../../directives/reference.directive';
import { id } from '../../utils/id';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

const defaultBg = '#fff'
const defaultGap = 20
const defaultDotSize = 2
const defaultDotColor = 'rgb(177, 177, 183)'
const defaultImageScale = 0.1
const defaultRepeated = true

@Component({
  selector: 'g[background]',
  templateUrl: './background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent {
  private viewportService = inject(ViewportService)
  private rootSvg = inject(RootSvgReferenceDirective).element
  private settingsService = inject(FlowSettingsService);

  protected backgroundSignal = this.settingsService.background

  // DOTS PATTERN
  protected scaledGap = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'dots') {
      const zoom = this.viewportService.readableViewport().zoom

      return zoom * (background.gap ?? defaultGap)
    }

    return 0
  })

  protected x = computed(() => this.viewportService.readableViewport().x % this.scaledGap())

  protected y = computed(() => this.viewportService.readableViewport().y % this.scaledGap())

  protected patternColor = computed(() => {
    const bg = this.backgroundSignal()

    if (bg.type === 'dots') {
      return bg.color ?? defaultDotColor
    }

    return defaultDotColor
  })

  protected patternSize = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'dots') {
      return (this.viewportService.readableViewport().zoom * (background.size ?? defaultDotSize)) / 2
    }

    return 0
  })

  // IMAGE PATTERN
  protected bgImageSrc = computed(() => {
    const background = this.backgroundSignal()

    return background.type === 'image' ? background.src : ''
  })

  protected imageSize = toSignal(
    toObservable(this.backgroundSignal).pipe(
      switchMap(() => createImage(this.bgImageSrc())),
      map((image) => ({ width: image.naturalWidth, height: image.naturalHeight })),
    ),
    { initialValue: { width: 0, height: 0 } }
  )

  protected scaledImageWidth = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'image') {
      const zoom = background.fixed ? 1 : this.viewportService.readableViewport().zoom

      return this.imageSize().width * zoom * (background.scale ?? defaultImageScale)
    }

    return 0
  })

  protected scaledImageHeight = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'image') {
      const zoom = background.fixed ? 1 : this.viewportService.readableViewport().zoom

      return this.imageSize().height * zoom * (background.scale ?? defaultImageScale)
    }

    return 0
  });

  protected imageX = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'image') {
      if (!background.repeat) {
        return background.fixed ? 0 : this.viewportService.readableViewport().x
      }

      return background.fixed
        ? 0
        : this.viewportService.readableViewport().x % this.scaledImageWidth()
    }

    return 0
  });

  protected imageY = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'image') {
      if (!background.repeat) {
        return background.fixed ? 0 : this.viewportService.readableViewport().y
      }

      return background.fixed
        ? 0
        : this.viewportService.readableViewport().y % this.scaledImageHeight()
    }

    return 0
  });

  protected repeated = computed(() => {
    const background = this.backgroundSignal()

    return background.type === 'image' && (background.repeat ?? defaultRepeated)
  })

  // Without ID there will be pattern collision for several flows on the page
  // Later pattern ID may be exposed to API
  protected patternId = id();
  protected patternUrl = `url(#${this.patternId})`

  constructor() {
    effect(() => {
      const background = this.backgroundSignal()

      if (background.type === 'dots') {
        this.rootSvg.style.backgroundColor = background.backgroundColor ?? defaultBg
      }

      if (background.type === 'solid') {
        this.rootSvg.style.backgroundColor = background.color
      }
    })
  }
}

function createImage(url: string) {
  const image = new Image()

  image.src = url

  return new Promise<HTMLImageElement>(resolve => {
    image.onload = () => resolve(image)
  })
}
