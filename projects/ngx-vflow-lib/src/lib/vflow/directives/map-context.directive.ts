import { Directive, ElementRef, Injector, Input, OnInit, effect, inject, runInInjectionContext, untracked } from '@angular/core';
import { select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, ZoomTransform, zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import * as d3 from 'd3-selection'
import { ViewportService } from '../services/viewport.service';
import { isDefined } from '../utils/is-defined';
import { RootSvgReferenceDirective } from './reference.directive';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { ViewportState } from '../interfaces/viewport.interface';
import { SelectionService } from '../services/selection.service';

type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>

@Directive({ selector: 'g[mapContext]' })
export class MapContextDirective implements OnInit {
  @Input()
  public minZoom!: number

  @Input()
  public maxZoom!: number

  protected rootSvg = inject(RootSvgReferenceDirective).element
  protected host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement
  protected selectionService = inject(SelectionService)
  protected viewportService = inject(ViewportService)

  protected rootSvgSelection = select(this.rootSvg)
  protected zoomableSelection = select(this.host)

  // under the hood this effect triggers handleZoom, so error throws without this flag
  // TODO: hack with timer fixes wrong node scaling (handle positions not matched with content size)
  protected manualViewportChangeEffect = effect(() => setTimeout(() => {
    const viewport = this.viewportService.writableViewport()
    const state = viewport.state

    if (viewport.changeType === 'initial') {
      return
    }

    // If only zoom provided
    if (isDefined(state.zoom) && (!isDefined(state.x) && !isDefined(state.y))) {
      this.rootSvgSelection.call(this.zoomBehavior.scaleTo, state.zoom)

      return
    }

    // If only pan provided
    if ((isDefined(state.x) && isDefined(state.y)) && !isDefined(state.zoom)) {
      this.rootSvgSelection.call(this.zoomBehavior.translateTo, state.x, state.y)

      return
    }

    // If whole viewort state provided
    if (isDefined(state.x) && isDefined(state.y) && isDefined(state.zoom)) {
      this.rootSvgSelection.call(this.zoomBehavior.transform,
        zoomIdentity.translate(state.x, state.y).scale(state.zoom)
      )

      return
    }
  }), { allowSignalWrites: true })

  protected zoomBehavior!: ZoomBehavior<SVGSVGElement, unknown>;

  public ngOnInit(): void {
    this.zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([this.minZoom, this.maxZoom])
      .on('start', (event: ZoomEvent) => this.onD3zoomStart(event))
      .on('zoom', (event: ZoomEvent) => this.handleZoom(event))
      .on('end', (event: ZoomEvent) => this.onD3zoomEnd(event))

    this.rootSvgSelection.call(this.zoomBehavior)
  }

  private handleZoom = ({ transform }: ZoomEvent) => {
    // update public signal for user to read
    this.viewportService.readableViewport.set(mapTransformToViewportState(transform))

    this.zoomableSelection.attr('transform', transform.toString())
  }

  private onD3zoomStart({ transform }: ZoomEvent) {
    this.selectionService.setViewpostStart(mapTransformToViewportState(transform))
  }

  private onD3zoomEnd({ transform }: ZoomEvent) {
    this.selectionService.setViewportEnd(mapTransformToViewportState(transform))
  }
}

const mapTransformToViewportState = (transform: ZoomTransform): ViewportState => ({ zoom: transform.k, x: transform.x, y: transform.y })
