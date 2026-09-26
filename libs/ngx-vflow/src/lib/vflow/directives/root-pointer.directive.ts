import { Directive, ElementRef, inject } from '@angular/core';
import { Observable, animationFrameScheduler, fromEvent, merge } from 'rxjs';
import { map, observeOn, share } from 'rxjs/operators';
import { Point } from '../interfaces/point.interface';

export interface RootPointerEvent extends Point {
  target: Element | null;
  originalEvent: PointerEvent;
}

function toRootPointerEvent(event: PointerEvent): RootPointerEvent {
  return { x: event.clientX, y: event.clientY, target: event.target as Element | null, originalEvent: event };
}

/**
 * Pointer streams of the flow root. Touch pointers that start a library gesture release their implicit capture, so
 * that, like the mouse, they report the element under the finger.
 */
@Directive({
  standalone: true,
  selector: 'div[rootPointer]',
})
export class RootPointerDirective {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Presses inside the flow that no library gesture took over. */
  public pointerStart$: Observable<RootPointerEvent> = fromEvent<PointerEvent>(this.host, 'pointerdown').pipe(
    map(toRootPointerEvent),
    observeOn(animationFrameScheduler),
    share(),
  );

  /** Pointer movement over the flow, on animation frames. */
  public pointerMovement$: Observable<RootPointerEvent> = fromEvent<PointerEvent>(this.host, 'pointermove').pipe(
    map(toRootPointerEvent),
    observeOn(animationFrameScheduler),
    share(),
  );

  public documentPointerMove$ = fromEvent<PointerEvent>(document, 'pointermove').pipe(share());

  public documentPointerEnd$ = merge(
    fromEvent<PointerEvent>(document, 'pointerup'),
    fromEvent<PointerEvent>(document, 'pointercancel'),
  ).pipe(share());
}
