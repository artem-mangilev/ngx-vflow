import { Directive, ElementRef, inject } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { ViewportService } from '../services/viewport.service';
import { clientToFlowPosition as toFlowPosition, flowToClientPosition as toClientPosition } from '../utils/coordinates';

/** Converts between client space and flow space through the pane it is applied to. */
@Directive({
  standalone: true,
  selector: 'div[spacePointContext]',
})
export class SpacePointContextDirective {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private viewportService = inject(ViewportService);

  /** Reads the viewport, so a computed that calls it follows the viewport. */
  public clientToFlowPosition(point: Point): Point {
    const rect = this.host.getBoundingClientRect();
    return toFlowPosition(point, {
      viewport: this.viewportService.readableViewport(),
      containerPosition: { x: rect.left, y: rect.top },
    });
  }

  public flowToClientPosition(point: Point): Point {
    const rect = this.host.getBoundingClientRect();
    return toClientPosition(point, {
      viewport: this.viewportService.readableViewport(),
      containerPosition: { x: rect.left, y: rect.top },
    });
  }
}
