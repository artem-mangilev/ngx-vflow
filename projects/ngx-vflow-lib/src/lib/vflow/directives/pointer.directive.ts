import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  effect,
  inject,
  output,
} from '@angular/core';
import { filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RootPointerDirective } from './root-pointer.directive';

@Directive({
  standalone: true,
  selector: '[pointerStart], [pointerEnd], [pointerOver], [pointerOut]',
})
export class PointerDirective {
  protected hostElement = inject<ElementRef<Element>>(ElementRef).nativeElement;
  protected pointerMovementDirective = inject(RootPointerDirective);

  protected readonly pointerOver = output<Event>();

  protected readonly pointerOut = output<Event>();

  /**
   * @todo the Angular may somehow ignore the event.
   * reproduced here: https://www.ngx-vflow.org/workshops/layout/vizdom-layout
   */
  protected readonly pointerStart = output<Event>();

  protected readonly pointerEnd = output<Event>();

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  protected onPointerStart(event: Event) {
    this.pointerStart.emit(event);

    if (event instanceof TouchEvent) {
      this.pointerMovementDirective.setInitialTouch(event);
    }
  }

  @HostListener('mouseup', ['$event'])
  protected onPointerEnd(event: Event) {
    this.pointerEnd.emit(event);
  }

  @HostListener('mouseover', ['$event'])
  protected onMouseOver(event: Event) {
    this.pointerOver.emit(event);
  }

  @HostListener('mouseout', ['$event'])
  protected onMouseOut(event: Event) {
    this.pointerOut.emit(event);
  }

  private wasPointerOver = false;

  // TODO check if i could avoid global touch end
  protected touchEnd = this.pointerMovementDirective.touchEnd$
    .pipe(
      filter(({ target }) => target === this.hostElement),
      tap(({ originalEvent }) => this.pointerEnd.emit(originalEvent)),
      takeUntilDestroyed(),
    )
    .subscribe();

  protected touchOverOut = this.pointerMovementDirective.touchMovement$
    .pipe(
      tap(({ target, originalEvent }) => {
        this.handleTouchOverAndOut(target, originalEvent);
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  // TODO: dirty imperative implementation
  private handleTouchOverAndOut(target: Element | null, event: TouchEvent) {
    if (target === this.hostElement) {
      this.pointerOver.emit(event);
      this.wasPointerOver = true;
    } else {
      // should not emit before pointerOver
      if (this.wasPointerOver) {
        this.pointerOut.emit(event);
      }

      this.wasPointerOver = false;
    }
  }
}
