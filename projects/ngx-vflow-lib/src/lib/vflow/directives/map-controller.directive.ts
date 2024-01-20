import { Directive, ElementRef, EventEmitter, HostListener, OnInit, Output, inject } from '@angular/core';
import { zoom, D3ZoomEvent } from 'd3-zoom';
import { select } from 'd3-selection'

export type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>

@Directive({ selector: 'svg[mapController]' })
export class MapControllerDirective implements OnInit {
  @Output()
  public movement = new EventEmitter<{ x: number, y: number }>()

  @Output()
  public zoom = new EventEmitter<ZoomEvent>()

  private isDragging = false

  protected hostRef = inject<ElementRef<SVGSVGElement>>(ElementRef)

  public ngOnInit(): void {
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .on('zoom', (e) => this.zoom.emit(e))

    select(this.hostRef.nativeElement).call(zoomBehavior)
  }

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

  private getMousePosition(event: WheelEvent) {
    const CTM = this.hostRef.nativeElement.getScreenCTM()

    return {
      x: (event.clientX - CTM!.e) / CTM!.a,
      y: (event.clientY - CTM!.f) / CTM!.d
    };
  }
}
