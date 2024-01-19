import { Directive, ElementRef, HostBinding, Input, inject } from '@angular/core';
import { compose, identity, scale, toSVG, translate } from 'transformation-matrix';
import { ZoomEvent } from './map-controller.directive';

@Directive({ selector: 'g[mapContext]' })
export class MapContextDirective {
  @Input()
  protected readonly scaleFactor = 0.1

  protected hostRef = inject<ElementRef<SVGGElement>>(ElementRef)

  protected transform = identity()

  @HostBinding('attr.transform')
  protected transformAttr = toSVG(this.transform)

  public pan(dx: number, dy: number) {
    this.transform = compose(this.transform, translate(dx, dy))
    this.transformAttr = toSVG(this.transform)
  }

  public zoom({ direction, mousePosition }: ZoomEvent) {
    const zoomLevel = direction === 'in' ? 1 + this.scaleFactor : 1 - this.scaleFactor

    this.transform = compose(this.transform,
      scale(zoomLevel, zoomLevel, mousePosition.x, mousePosition.y)
    )
    this.transformAttr = toSVG(this.transform)
  }
}
