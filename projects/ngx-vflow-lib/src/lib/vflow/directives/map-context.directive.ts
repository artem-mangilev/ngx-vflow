import { Directive, ElementRef, Injector, Input, OnInit, effect, inject, runInInjectionContext, untracked } from '@angular/core';
import { select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, ZoomTransform, zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import * as d3 from 'd3-selection'
import { ViewportService } from '../services/viewport.service';
import { isDefined } from '../utils/is-defined';
import { RootSvgReferenceDirective } from './reference.directive';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { BehaviorSubject, Subject, combineLatest, filter, map, pairwise, switchMap, tap } from 'rxjs';
import { ViewportState } from '../interfaces/viewport.interface';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>

@Directive({ selector: 'g[mapContext]' })
export class MapContextDirective implements OnInit {
  private static delta = 6

  @Input()
  public minZoom!: number

  @Input()
  public maxZoom!: number

  protected rootSvg = inject(RootSvgReferenceDirective).element
  protected host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement
  protected viewportService = inject(ViewportService)
  protected flowEntitiesService = inject(FlowEntitiesService)

  protected rootSvgSelection = select(this.rootSvg)
  protected zoomableSelection = select(this.host)

  protected viewportStart$ = new BehaviorSubject<ViewportState>(
    this.viewportService.readableViewport()
  )
  protected viewportEnd$ = new BehaviorSubject<ViewportState>(
    this.viewportService.readableViewport()
  )

  protected panStart = toSignal(
    this.viewportStart$.pipe(
      pairwise(),
      filter(([prevState, currentState]) => {
        // pass only pan changes
        return prevState.zoom === currentState.zoom
      }),
      map(([, currentState]) => currentState),
    )
  )

  protected panEnd = toSignal(
    this.viewportEnd$.pipe(
      pairwise(),
      filter(([prevState, currentState]) => {
        // pass only pan changes
        return prevState.zoom === currentState.zoom
      }),
      map(([, currentState]) => currentState),
    )
  )

  protected resetSelection = effect(() => {
    const panStart = untracked(this.panStart)
    const panEnd = this.panEnd()

    if (panStart && panEnd) {
      const delta = MapContextDirective.delta

      const diffX = Math.abs(panEnd.x - panStart.x)
      const diffY = Math.abs(panEnd.y - panStart.y)

      // click (not drag)
      if (diffX < delta && diffY < delta) {
        this.flowEntitiesService.select(null)
      }
    }

    // TODO: allowSignalWrites
  }, { allowSignalWrites: true })


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
      .on('zoom', this.handleZoom)
      .on('end', (event: ZoomEvent) => this.onD3zoomEnd(event))

    this.rootSvgSelection.call(this.zoomBehavior)
  }

  private handleZoom = ({ transform }: ZoomEvent) => {
    // update public signal for user to read
    this.viewportService.readableViewport.set(mapTransformToViewportState(transform))

    this.zoomableSelection.attr('transform', transform.toString())
  }

  private onD3zoomStart({ transform }: ZoomEvent) {
    this.viewportStart$.next(mapTransformToViewportState(transform))
  }

  private onD3zoomEnd({ transform }: ZoomEvent) {
    this.viewportEnd$.next(mapTransformToViewportState(transform))
  }
}

const mapTransformToViewportState = (transform: ZoomTransform): ViewportState => ({ zoom: transform.k, x: transform.x, y: transform.y })
