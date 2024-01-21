import { Directive, ElementRef, Injector, Input, OnInit, effect, inject, runInInjectionContext } from '@angular/core';
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
      () => {
        this.manualZoomChangeEffect(zoomBehavior)
        this.manualPanChangeEffect(zoomBehavior)
      }
    )
  }

  private handleZoom = ({ transform }: ZoomEvent) => {
    // update public signal for user to read
    this.zoomService.zoomPan.set({ zoom: transform.k, x: transform.x, y: transform.y })

    this.zoomableSelection.attr('transform', transform.toString())
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

  private manualPanChangeEffect(behavior: ZoomBehavior<SVGSVGElement, unknown>) {
    effect(() => {
      this.rootSvgSelection.call(behavior.translateTo, this.zoomService.pan().x, this.zoomService.pan().y)

      // TODO: research how to avoid writing to signal from effect
      // this may lead to bugs
    }, { allowSignalWrites: true })

  }
}
