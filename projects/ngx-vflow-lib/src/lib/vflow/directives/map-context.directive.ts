import { Directive, ElementRef, HostBinding, Injector, Input, OnInit, effect, inject, runInInjectionContext } from '@angular/core';
// import { compose, identity, scale, toSVG, translate } from 'transformation-matrix';
import { select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, zoom } from 'd3-zoom';
import { ZoomService } from '../services/zoom.service';

type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>

@Directive({ selector: 'g[mapContext]' })
export class MapContextDirective implements OnInit {
  @Input()
  public minZoom!: number

  @Input()
  public maxZoom!: number

  private get zoomableElement() {
    return this.hostRef.nativeElement
  }

  /**
   * TODO: find more type-safe way
   */
  private get rootSvgElement() {
    return this.zoomableElement.parentElement as Element as SVGSVGElement
  }

  protected hostRef = inject<ElementRef<SVGGElement>>(ElementRef)
  protected zoomService = inject(ZoomService)
  protected injector = inject(Injector)

  protected rootSvgSelection = select(this.rootSvgElement)
  protected zoomableSelection = select(this.zoomableElement)

  public ngOnInit(): void {
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([this.minZoom, this.maxZoom])
      .on('zoom', this.handleZoom)

    this.rootSvgSelection.call(zoomBehavior)

    runInInjectionContext(this.injector,
      () => this.manualZoomChangeEffect(zoomBehavior)
    )
  }

  private handleZoom = (event: ZoomEvent) => {
    this.zoomService.zoom.set(event.transform.k)
    this.zoomableSelection.attr('transform', event.transform.toString())
  }

  /**
   * Rescale if zoom signal was changed
   *
   * @param behavior zoom behavior
   */
  private manualZoomChangeEffect(behavior: ZoomBehavior<SVGSVGElement, unknown>) {
    // update zoom in d3 on each zoom zoom change
    effect(() => {
      this.rootSvgSelection.call(behavior.scaleTo, this.zoomService.zoom())

      // TODO: research how to avoid writing to signal from effect
      // this may lead to bugs
    }, { allowSignalWrites: true })
  }
}
