import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';
import { RootPointerDirective } from './root-pointer.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewportService } from '../services/viewport.service';

@Directive({
  standalone: true,
  selector: 'g[spacePointContext]',
})
export class SpacePointContextDirective {
  private pointerMovementDirective = inject(RootPointerDirective);
  private rootSvg = inject(RootSvgReferenceDirective).element;
  private host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement;
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

    return this.documentPointToFlowPoint({
      x: point.x,
      y: point.y,
    });
  });

  private currentPoint = toSignal(this.pointerMovementDirective.pointerMovement$);

  public documentPointToFlowPoint(documentPoint: Point) {
    const point = this.rootSvg.createSVGPoint();
    point.x = documentPoint.x;
    point.y = documentPoint.y;

    return point.matrixTransform(this.host.getScreenCTM()!.inverse());
  }
}
