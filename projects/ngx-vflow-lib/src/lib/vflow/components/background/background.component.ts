import { Component, Input, computed, effect, inject, signal } from '@angular/core';
import { Background } from '../../types/background.type';
import { ViewportService } from '../../services/viewport.service';
import { RootSvgReferenceDirective } from '../../directives/reference.directive';

const defaultBg = '#fff'
const defaultGap = 20
const defaultDotSize = 2

@Component({
  selector: 'g[background]',
  templateUrl: './background.component.html'
})
export class BackgroundComponent {
  private viewportService = inject(ViewportService)
  private rootSvg = inject(RootSvgReferenceDirective).element

  @Input({ required: true, transform })
  set background(value: Background) {
    this.backgroundSignal.set(value)
  }

  protected backgroundSignal = signal<Background>({ type: 'solid', color: defaultBg })

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

  protected patternSize = computed(() => {
    const background = this.backgroundSignal()

    if (background.type === 'dots') {
      return (this.viewportService.readableViewport().zoom * (background.size ?? defaultDotSize)) / 2
    }

    return 0
  })

  constructor() {
    effect(() => {
      const background = this.backgroundSignal()

      if (background.type === 'dots') {
        this.rootSvg.style.backgroundColor = background.backgroundColor ?? defaultBg
      }

      if (background.type === 'solid') {
        this.rootSvg.style.backgroundColor = background.color ?? defaultBg
      }
    })
  }
}

function transform(background: Background | string) {
  return typeof background === 'string'
    ? { type: 'color', color: background }
    : background
}
