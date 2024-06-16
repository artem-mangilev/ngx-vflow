import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';
import { RootPointerDirective } from './root-pointer.directive';

@Directive({ selector: 'g[spacePointContext]' })
export class SpacePointContextDirective {
  private pointerMovementDirective = inject(RootPointerDirective)
  private rootSvg = inject(RootSvgReferenceDirective).element
  private host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement

  /**
   * Signal with current mouse position in svg space
   */
  public svgCurrentSpacePoint: Signal<Point> = computed(() => {
    const movement = this.pointerMovement()

    if (!movement) {
      return { x: 0, y: 0 }
    }

    const point = this.rootSvg.createSVGPoint()
    point.x = movement.x
    point.y = movement.y

    return point.matrixTransform(this.host.getScreenCTM()!.inverse())
  })

  public pointerMovement = toSignal(
    this.pointerMovementDirective.pointerMovement$,
  )
}
