import { Directive, ElementRef, HostBinding, Input, inject } from '@angular/core';
// import { compose, identity, scale, toSVG, translate } from 'transformation-matrix';
import { ZoomEvent } from './map-controller.directive';
import { select } from 'd3-selection';

@Directive({ selector: 'g[mapContext]' })
export class MapContextDirective {
  protected hostRef = inject<ElementRef<SVGGElement>>(ElementRef)

  protected selection = select(this.hostRef.nativeElement)

  // protected transform = identity()

  // protected zoomLevel = 1

  // @HostBinding('attr.transform')
  // protected transformAttr = toSVG(this.transform)

  // public pan(dx: number, dy: number) {
  //   this.transform = compose(this.transform, translate(dx, dy))
  //   this.transformAttr = toSVG(this.transform)
  // }

  public zoom(event: ZoomEvent) {
    this.selection.attr('transform', event.transform.toString())
  }
}
