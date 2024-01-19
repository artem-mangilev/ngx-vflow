import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({ selector: 'svg[mapController]' })
export class MapControllerDirective {
  @Output()
  public movement = new EventEmitter<{ x: number, y: number }>()

  private isDragging = false

  @HostListener('mousedown')
  protected onMouseDown() {
    this.isDragging = true
  }

  @HostListener('mousemove', ['$event'])
  protected onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.movement.emit({ x: event.movementX, y: event.movementY })
    }
  }

  /**
   * TODO use global token for document events
   */
  @HostListener('document:mouseup')
  protected onMouseUp() {
    this.isDragging = false
  }
}
