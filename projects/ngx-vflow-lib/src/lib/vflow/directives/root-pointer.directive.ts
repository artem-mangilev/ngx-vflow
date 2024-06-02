import { Directive, ElementRef, inject } from '@angular/core';
import { Observable, fromEvent, map, merge, share, tap } from 'rxjs';
import { Point } from '../interfaces/point.interface';

@Directive({ selector: 'svg[rootPointer]' })
export class RootPointerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement

  public mouseMovement$ = fromEvent<MouseEvent>(this.host, 'mousemove').pipe(
    map(event => ({
      x: event.clientX,
      y: event.clientY,
      originalEvent: event
    })),
    share()
  ) satisfies Observable<Point>;

  public touchMovement$ = fromEvent<TouchEvent>(this.host, 'touchmove').pipe(
    tap((event) => event.preventDefault()),
    map((event) => ({
      x: event.touches[0]?.clientX ?? 0,
      y: event.touches[0]?.clientY ?? 0,
      originalEvent: event
    })),
    share()
  ) satisfies Observable<Point>;

  public touchEnd$ = fromEvent<TouchEvent>(this.host, 'touchend').pipe(
    map((event) => ({
      x: event.changedTouches[0]?.clientX ?? 0,
      y: event.changedTouches[0]?.clientY ?? 0,
      originalEvent: event
    })),
    share()
  ) satisfies Observable<Point>

  public pointerMovement$ = merge(
    this.mouseMovement$,
    this.touchMovement$
  )

}
