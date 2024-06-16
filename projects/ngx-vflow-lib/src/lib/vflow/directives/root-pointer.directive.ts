import { Directive, ElementRef, inject } from '@angular/core';
import { Observable, Subject, fromEvent, map, merge, share, skip, tap } from 'rxjs';
import { Point } from '../interfaces/point.interface';

@Directive({ selector: 'svg[rootPointer]' })
export class RootPointerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement

  private initialTouch$ = new Subject<TouchEvent>()

  // TODO: do not emit if mouse not down
  public mouseMovement$ = fromEvent<MouseEvent>(this.host, 'mousemove').pipe(
    map(event => ({
      x: event.clientX,
      y: event.clientY,
      originalEvent: event
    })),
    share()
  ) satisfies Observable<Point>;

  public touchMovement$ = merge(
    this.initialTouch$,
    fromEvent<TouchEvent>(this.host, 'touchmove')
  ).pipe(
    tap((event) => event.preventDefault()),
    map((originalEvent) => {
      const x = originalEvent.touches[0]?.clientX ?? 0
      const y = originalEvent.touches[0]?.clientY ?? 0
      const target = document.elementFromPoint(x, y)

      return { x, y, target, originalEvent }
    }),
    share()
  ) satisfies Observable<Point>;

  public touchEnd$ = fromEvent<TouchEvent>(this.host, 'touchend').pipe(
    map((originalEvent) => {
      const x = originalEvent.changedTouches[0]?.clientX ?? 0
      const y = originalEvent.changedTouches[0]?.clientY ?? 0
      const target = document.elementFromPoint(x, y)

      return { x, y, target, originalEvent }
    }),
    share()
  ) satisfies Observable<Point>

  public pointerMovement$ = merge(
    this.mouseMovement$,
    this.touchMovement$
  )
  /**
   * We should know when user started a touch in order to not
   * show old touch position when connection creation is started
   */
  public setInitialTouch(event: TouchEvent) {
    this.initialTouch$.next(event)
  }
}
