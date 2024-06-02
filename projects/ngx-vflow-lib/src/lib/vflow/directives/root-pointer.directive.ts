import { Directive, ElementRef, inject } from '@angular/core';
import { Observable, fromEvent, map, merge, tap } from 'rxjs';
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
  ) satisfies Observable<Point>;

  public touchMovement$ = fromEvent<TouchEvent>(this.host, 'touchmove').pipe(
    tap((event) => event.preventDefault()),
    map((event) => ({
      x: event.touches[0]?.clientX,
      y: event.touches[0]?.clientY,
      originalEvent: event
    })),
  ) satisfies Observable<Point>;

  public touchEnd$ = fromEvent<TouchEvent>(this.host, 'touchend')

  public pointerMovement$ = merge(
    this.mouseMovement$,
    this.touchMovement$
  )
}
