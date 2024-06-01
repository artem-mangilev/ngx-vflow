import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge, startWith, tap } from 'rxjs';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';

@Directive({ selector: 'g[spacePointContext]' })
export class SpacePointContextDirective {
  /**
   * Signal with current mouse position in svg space
   */
  public svgCurrentSpacePoint: Signal<Point> = computed(() => {
    const movement = this.mouseMovement()

    const point = this.rootSvg.createSVGPoint()
    point.x = movement.x
    point.y = movement.y

    return point.matrixTransform(this.host.getScreenCTM()!.inverse())
  })

  private rootSvg = inject(RootSvgReferenceDirective).element
  private host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement

  public mouseMovement$ = merge(
    fromEvent<MouseEvent>(this.rootSvg, 'mousemove').pipe(
      map(event => ({ x: event.clientX, y: event.clientY })),
    ),
    fromEvent<TouchEvent>(this.rootSvg, 'touchmove').pipe(
      tap((event) => event.preventDefault()),
      map(({ touches }) => touches[0]),
      map(touch => ({ x: touch.clientX, y: touch.clientY })),
    ),
  )

  public mouseMovement = toSignal(this.mouseMovement$, { initialValue: { x: 0, y: 0 } })
}
