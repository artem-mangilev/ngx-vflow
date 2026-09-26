import { Directive, output } from '@angular/core';

/**
 * Pointer outputs of library elements: a press, a release, and the pointer entering or leaving the element or a
 * descendant. Touch pointers of a connection gesture are not captured, so they report the element under the finger.
 */
@Directive({
  standalone: true,
  selector: '[pointerStart], [pointerEnd], [pointerOver], [pointerOut]',
  host: {
    '(pointerdown)': 'pointerStart.emit($event)',
    '(pointerup)': 'pointerEnd.emit($event)',
    '(pointerover)': 'pointerOver.emit($event)',
    '(pointerout)': 'pointerOut.emit($event)',
  },
})
export class PointerDirective {
  protected readonly pointerOver = output<PointerEvent>();

  protected readonly pointerOut = output<PointerEvent>();

  protected readonly pointerStart = output<PointerEvent>();

  protected readonly pointerEnd = output<PointerEvent>();
}
