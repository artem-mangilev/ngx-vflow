import { Directive, Signal, computed, inject } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { RootPointerDirective } from './root-pointer.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewportService } from '../services/viewport.service';
import { FlowCoordinateMapperService } from '../services/flow-coordinate-mapper.service';

@Directive({
  standalone: true,
  selector: 'g[spacePointContext]',
})
export class SpacePointContextDirective {
  private pointerMovementDirective = inject(RootPointerDirective);
  private viewportService = inject(ViewportService);
  private coordinateMapper = inject(FlowCoordinateMapperService);

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
    return this.coordinateMapper.documentPointToFlowPoint(documentPoint);
  }
}
