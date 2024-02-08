import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';

@Directive({ selector: 'g[spacePointContext]' })
export class SpacePointContextDirective {
  /**
   * Signal with current mouse position in svg space
   */
  public svgCurrentSpacePoint: Signal<Point> = computed(() => {
    const movement = this.mouseMovement()

    if (movement) {
      const point = this.rootSvgRef.element.createSVGPoint()
      point.x = movement.clientX
      point.y = movement.clientY

      return point.matrixTransform(
        this.hostRef.nativeElement.getScreenCTM()!.inverse()
      );
    }

    return { x: 0, y: 0 }
  })

  private rootSvgRef = inject(RootSvgReferenceDirective)
  private hostRef = inject<ElementRef<SVGGElement>>(ElementRef)

  private mouseMovement = toSignal(
    fromEvent<MouseEvent>(this.rootSvgRef.element, 'mousemove')
  )
}
