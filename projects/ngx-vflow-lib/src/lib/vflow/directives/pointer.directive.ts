import { Directive, ElementRef, EventEmitter, HostListener, Output, effect, inject } from '@angular/core';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RootPointerDirective } from './root-pointer.directive';

@Directive({ selector: '[pointerStart], [pointerEnd], [pointerOver], [pointerOut]' })
export class PointerDirective {
  protected hostElement = inject<ElementRef<Element>>(ElementRef).nativeElement
  protected pointerMovementDirective = inject(RootPointerDirective)

  @Output()
  protected pointerOver = new EventEmitter()

  @Output()
  protected pointerOut = new EventEmitter()

  @Output()
  protected pointerStart = new EventEmitter<Event>()

  @Output()
  protected pointerEnd = new EventEmitter<Event>()

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  protected onPointerStart(event: Event) {
    this.pointerStart.emit(event)
  }

  @HostListener('mouseup', ['$event'])
  protected onPointerEnd(event: Event) {
    this.pointerEnd.emit(event)
  }

  @HostListener('mouseover', ['$event'])
  protected onMouseOver(event: Event) {
    this.pointerOver.emit(event)
  }

  @HostListener('mouseout', ['$event'])
  protected onMouseOut(event: Event) {
    this.pointerOut.emit(event)
  }

  private wasPointerOver = false;

  touchEnd = this.pointerMovementDirective.touchEnd$
    .pipe(
      tap((event) => {
        const touchEndElement = document.elementFromPoint(
          event.changedTouches[0].clientX,
          event.changedTouches[0].clientY
        )

        if (touchEndElement === this.hostElement) {
          this.pointerEnd.emit(event)
        }
      }),
      takeUntilDestroyed()
    )
    .subscribe()

  touchOverOut = this.pointerMovementDirective.touchMovement$
    .pipe(
      tap((point) => {
        const touchedElement = document.elementFromPoint(point.x, point.y)

        if (touchedElement === this.hostElement) {
          this.pointerOver.emit()
          this.wasPointerOver = true;
        } else {
          // should not emit before pointerOver
          if (this.wasPointerOver) {
            this.pointerOut.emit()
          }

          this.wasPointerOver = false;
        }
      }),
      takeUntilDestroyed()
    )
    .subscribe()
}
