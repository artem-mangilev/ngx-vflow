import { Directive, ElementRef, HostBinding, inject } from '@angular/core';
import { compose, identity, toSVG, translate } from 'transformation-matrix';

@Directive({ selector: 'g[mapContext]' })
export class MapContextDirective {
  protected hostRef = inject<ElementRef<SVGGElement>>(ElementRef)

  protected transform = identity()

  @HostBinding('attr.transform')
  protected transformAttr = toSVG(this.transform)

  public pan(dx: number, dy: number) {
    this.transform = compose(this.transform, translate(dx, dy))

    this.transformAttr = toSVG(this.transform)
  }
}
