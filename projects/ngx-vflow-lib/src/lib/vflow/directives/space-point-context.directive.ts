import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { RootPointerDirective } from './root-pointer.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewportService } from '../services/viewport.service';
import { clientToFlowPosition as toFlowPosition, flowToClientPosition as toClientPosition } from '../utils/coordinates';

@Directive({
  standalone: true,
  selector: 'div[spacePointContext]',
})
export class SpacePointContextDirective {
  private pointerMovementDirective = inject(RootPointerDirective);
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private viewportService = inject(ViewportService);

  /**
   * Signal with current mouse position in svg space
   */
  public svgCurrentSpacePoint: Signal<Point> = computed(() => {
    // Add dependency on viewport to recalculate when auto-pan changes viewport
    // TODO: hacky solution, need to find a better way
    this.viewportService.readableViewport();

    const point = this.currentPoint();

    if (!point) {
      return { x: 0, y: 0 };
    }

    return this.clientToFlowPosition({
      x: point.x,
      y: point.y,
    });
  });

  private currentPoint = toSignal(this.pointerMovementDirective.pointerMovement$);

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
