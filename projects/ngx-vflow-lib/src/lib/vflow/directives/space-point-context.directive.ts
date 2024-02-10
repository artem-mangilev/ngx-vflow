import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, startWith } from 'rxjs';
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

  private mouseMovement = toSignal(
    fromEvent<MouseEvent>(this.rootSvg, 'mousemove').pipe(
      map(event => ({ x: event.clientX, y: event.clientY })),
    ),
    { initialValue: { x: 0, y: 0 } }
  )
}
