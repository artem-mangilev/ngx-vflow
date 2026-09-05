import { FlowStatusService } from '../services/flow-status.service';
import { Directive, ElementRef, inject } from '@angular/core';
import { Observable, Subject, animationFrameScheduler, fromEvent, merge } from 'rxjs';
import { map, observeOn, share, tap } from 'rxjs/operators';
import { Point } from '../interfaces/point.interface';

export interface PointerEvent {
  x: number;
  y: number;
  movementX: number;
  movementY: number;
  target: Element | null;
  originalEvent: MouseEvent | TouchEvent;
}

@Directive({
  standalone: true,
  selector: 'div[rootPointer]',
})
export class RootPointerDirective {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private status = inject(FlowStatusService);

  private initialTouch$ = new Subject<TouchEvent>();

  private prevTouchEvent: TouchEvent | null = null;

  public pointerStart$ = merge(
    fromEvent<MouseEvent>(this.host, 'mousedown').pipe(
      map((event) => ({
        x: event.clientX,
        y: event.clientY,
        target: event.target as Element | null,
        originalEvent: event as Event,
      })),
    ),
    fromEvent<TouchEvent>(this.host, 'touchstart').pipe(
      map((event) => ({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        target: event.target as Element | null,
        originalEvent: event as Event,
      })),
    ),
  ).pipe(observeOn(animationFrameScheduler), share()) satisfies Observable<Point>;

  // TODO: do not emit if mouse not down
  public mouseMovement$ = fromEvent<MouseEvent>(this.host, 'mousemove').pipe(
    map((event) => ({
      x: event.clientX,
      y: event.clientY,
      movementX: event.movementX,
      movementY: event.movementY,
      target: event.target as Element | null,
      originalEvent: event,
    })),
    observeOn(animationFrameScheduler),
    share(),
  ) satisfies Observable<Point>;

  public touchMovement$ = merge(
    this.initialTouch$,
    fromEvent<TouchEvent>(this.host, 'touchmove', { passive: false }),
  ).pipe(
    tap((event) => {
      const state = this.status.status().state;
      if (state.startsWith('connection-') || state.startsWith('reconnection-')) event.preventDefault();
    }),
    map((originalEvent) => {
      const x = originalEvent.touches[0]?.clientX ?? 0;
      const y = originalEvent.touches[0]?.clientY ?? 0;
      const movementX =
        (originalEvent.touches[0]?.pageX ?? 0) -
        (this.prevTouchEvent?.touches[0]?.pageX ?? originalEvent.touches[0]?.pageX ?? 0);
      const movementY =
        (originalEvent.touches[0]?.pageY ?? 0) -
        (this.prevTouchEvent?.touches[0]?.pageY ?? originalEvent.touches[0]?.pageY ?? 0);

      const target = document.elementFromPoint(x, y);

      return { x, y, movementX, movementY, target, originalEvent };
    }),
    tap((event) => (this.prevTouchEvent = event.originalEvent)),
    observeOn(animationFrameScheduler),
    share(),
  ) satisfies Observable<Point>;

  public pointerMovement$: Observable<PointerEvent> = merge(this.mouseMovement$, this.touchMovement$);

  public touchEnd$ = fromEvent<TouchEvent>(this.host, 'touchend').pipe(
    map((originalEvent) => {
      const x = originalEvent.changedTouches[0]?.clientX ?? 0;
      const y = originalEvent.changedTouches[0]?.clientY ?? 0;
      const target = document.elementFromPoint(x, y);

      return { x, y, target, originalEvent };
    }),
    tap(() => (this.prevTouchEvent = null)),
    share(),
  ) satisfies Observable<Point>;

  public mouseUp$ = fromEvent<MouseEvent>(this.host, 'mouseup').pipe(
    map((originalEvent) => {
      const x = originalEvent.clientX;
      const y = originalEvent.clientY;
      const target = originalEvent.target;

      return { x, y, target, originalEvent };
    }),
    share(),
  ) satisfies Observable<Point>;

  public documentMouseMovement$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(share());

  public documentMouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(share());

  public documentTouchEnd$ = fromEvent<TouchEvent>(document, 'touchend').pipe(share());

  public documentPointerEnd$ = merge(this.documentMouseUp$, this.documentTouchEnd$).pipe(share());

  /**
   * We should know when user started a touch in order to not
   * show old touch position when connection creation is started
   */
  public setInitialTouch(event: TouchEvent) {
    this.initialTouch$.next(event);
  }
}
