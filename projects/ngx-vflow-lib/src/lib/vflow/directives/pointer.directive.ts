import { Directive, ElementRef, EventEmitter, HostListener, Output, effect, inject } from '@angular/core';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RootPointerDirective } from './root-pointer.directive';

@Directive({ selector: '[pointerStart], [pointerEnd], [pointerOver], [pointerOut]' })
export class PointerDirective {
  protected hostElement = inject<ElementRef<Element>>(ElementRef).nativeElement
  protected pointerMovementDirective = inject(RootPointerDirective)

  @Output()
  protected pointerOver = new EventEmitter<Event>()

  @Output()
  protected pointerOut = new EventEmitter<Event>()

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

  // TODO check if i could avoid global touch end
  touchEnd = this.pointerMovementDirective.touchEnd$
    .pipe(
      tap(({ x, y, originalEvent }) => {
        const touchEndElement = document.elementFromPoint(x, y)

        if (touchEndElement === this.hostElement) {
          this.pointerEnd.emit(originalEvent)
        }
      }),
      takeUntilDestroyed()
    )
    .subscribe()

  touchOverOut = this.pointerMovementDirective.touchMovement$
    .pipe(
      tap(({ x, y, originalEvent }) => {
        // TODO Performance
        const touchedElement = document.elementFromPoint(x, y)

        if (touchedElement === this.hostElement) {
          this.pointerOver.emit(originalEvent)
          this.wasPointerOver = true;
        } else {
          // should not emit before pointerOver
          if (this.wasPointerOver) {
            this.pointerOut.emit(originalEvent)
          }

          this.wasPointerOver = false;
        }
      }),
      takeUntilDestroyed()
    )
    .subscribe()
}
