import { Directive, ElementRef, EventEmitter, HostListener, Output, effect, inject } from '@angular/core';
import { SpacePointContextDirective } from './space-point-context.directive';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({ selector: '[pointerOver], [pointerOut]' })
export class PointerDirective {
  protected hostElement = inject<ElementRef<Element>>(ElementRef).nativeElement
  protected spacePointContext = inject(SpacePointContextDirective)

  @Output()
  protected pointerOver = new EventEmitter<Event>()

  @Output()
  protected pointerOut = new EventEmitter<Event>()

  @HostListener('mouseover', ['$event'])
  protected onMouseOver(event: Event) {
    this.pointerOver.emit(event)
  }

  @HostListener('mouseout', ['$event'])
  protected onMouseOut(event: Event) {
    this.pointerOut.emit(event)
  }

  touchOverOut = this.spacePointContext.mouseMovement$
    .pipe(
      tap((point) => {
        const touchedElement = document.elementFromPoint(point.x, point.y)

        if (touchedElement === this.hostElement) {
          this.pointerOver.emit(event)
        } else {
          // TODO: should not emit before pointerOver
          this.pointerOut.emit(event)
        }
      }),
      takeUntilDestroyed()
    )
    .subscribe()
}
