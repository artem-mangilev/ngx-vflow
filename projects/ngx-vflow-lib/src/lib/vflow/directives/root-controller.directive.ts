import { Directive, ElementRef, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Directive({ selector: 'svg[rootController]' })
export class RootControllerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef)

  private mouseMove = toSignal(fromEvent<MouseEvent>(this.host.nativeElement, 'mousemove'))

  public svgSpacePoint = computed(() => {
    const move = this.mouseMove()

    if (move) {
      const point = this.host.nativeElement.createSVGPoint()
      point.x = move.clientX
      point.y = move.clientY

      return point.matrixTransform(this.host.nativeElement.getScreenCTM()!.inverse());
    }

    return { x: 0, y: 0 }
  })
}
