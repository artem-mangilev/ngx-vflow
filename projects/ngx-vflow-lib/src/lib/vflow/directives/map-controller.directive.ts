import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

export interface ZoomEvent {
  direction: 'in' | 'out'
  mousePosition: { x: number; y: number }
}

@Directive({ selector: 'svg[mapController]' })
export class MapControllerDirective {
  @Output()
  public movement = new EventEmitter<{ x: number, y: number }>()

  @Output()
  public zoom = new EventEmitter<ZoomEvent>()

  private isDragging = false

  protected hostRef = inject<ElementRef<SVGSVGElement>>(ElementRef)

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

  @HostListener('wheel', ['$event'])
  protected onWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      this.zoom.emit({ direction: 'in', mousePosition: this.getMousePosition(event) })
    } else if (event.deltaY > 0) {
      this.zoom.emit({ direction: 'out', mousePosition: this.getMousePosition(event) })
    }
  }

  private getMousePosition(event: WheelEvent) {
    const CTM = this.hostRef.nativeElement.getScreenCTM()

    return {
      x: (event.clientX - CTM!.e) / CTM!.a,
      y: (event.clientY - CTM!.f) / CTM!.d
    };
  }
}
