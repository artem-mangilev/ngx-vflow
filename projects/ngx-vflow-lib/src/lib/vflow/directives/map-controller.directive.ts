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

  protected hostRef = inject<ElementRef<SVGSVGElement>>(ElementRef)

  public ngOnInit(): void {
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .on('zoom', (e) => this.zoom.emit(e))

    select(this.hostRef.nativeElement).call(zoomBehavior)
  }

}
