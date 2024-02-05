import { Directive, ElementRef, Injector, Input, OnInit, effect, inject, runInInjectionContext } from '@angular/core';
import { select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { ViewportService } from '../services/viewport.service';
import { isDefined } from '../utils/is-defined';

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
  protected viewportService = inject(ViewportService)
  protected injector = inject(Injector)

  protected rootSvgSelection = select(this.rootSvgElement)
  protected zoomableSelection = select(this.zoomableElement)

  public ngOnInit(): void {
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([this.minZoom, this.maxZoom])
      .on('zoom', this.handleZoom)

    this.rootSvgSelection.call(zoomBehavior)

    runInInjectionContext(this.injector, () => this.manualViewportChangeEffect(zoomBehavior))
  }

  private handleZoom = ({ transform }: ZoomEvent) => {
    // update public signal for user to read
    this.viewportService.readableViewport.set({ zoom: transform.k, x: transform.x, y: transform.y })

    this.zoomableSelection.attr('transform', transform.toString())
  }

  /**
   * Rescale if zoom signal was changed
   *
   * @param behavior zoom behavior
   */
  private manualViewportChangeEffect(behavior: ZoomBehavior<SVGSVGElement, unknown>) {
    // update zoom in d3 on each manual zoom zoom change
    effect(() => {
      // TODO: this hack fixes wrong node scaling (handle positions not matched with content size)
      setTimeout(() => {
        const viewport = this.viewportService.writableViewport()

        // If only zoom provided
        if (isDefined(viewport.zoom) && (!isDefined(viewport.x) && !isDefined(viewport.y))) {
          this.rootSvgSelection.call(behavior.scaleTo, viewport.zoom)

          return
        }

        // If only pan provided
        if ((isDefined(viewport.x) && isDefined(viewport.y)) && !isDefined(viewport.zoom)) {
          this.rootSvgSelection.call(behavior.translateTo, viewport.x, viewport.y)

          return
        }

        // If whole viewort state provided
        if (isDefined(viewport.x) && isDefined(viewport.y) && isDefined(viewport.zoom)) {
          this.rootSvgSelection.call(behavior.transform,
            zoomIdentity.translate(viewport.x, viewport.y).scale(viewport.zoom)
          )

          return
        }
      });

      // TODO: under the hood this effect triggers handleZoom, so error throws without this flag
    }, { allowSignalWrites: true })
  }


}
