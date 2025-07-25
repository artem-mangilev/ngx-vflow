import { Directive, ElementRef, NgZone, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, ZoomTransform, zoom, zoomIdentity } from 'd3-zoom';
import { ViewportService } from '../services/viewport.service';
import { isDefined } from '../utils/is-defined';
import { RootSvgReferenceDirective } from './reference.directive';
import { ViewportState } from '../interfaces/viewport.interface';
import { SelectionService, ViewportForSelection } from '../services/selection.service';
import { FlowSettingsService } from '../services/flow-settings.service';

@Directive({
  standalone: true,
  selector: 'g[mapContext]',
  host: {
    '[attr.transform]': 'transform()',
  },
})
export class MapContextDirective implements OnInit {
  protected rootSvg = inject(RootSvgReferenceDirective).element;
  protected host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement;
  protected selectionService = inject(SelectionService);
  protected viewportService = inject(ViewportService);
  protected flowSettingsService = inject(FlowSettingsService);
  protected zone = inject(NgZone);

  protected rootSvgSelection = select(this.rootSvg);

  protected transform = signal<string>('');

  protected viewportForSelection: Partial<ViewportForSelection> = {};

  // under the hood this effect triggers handleZoom, so error throws without this flag
  protected manualViewportChangeEffect = effect(
    () => {
      const viewport = this.viewportService.writableViewport();
      const state = viewport.state;

      if (viewport.changeType === 'initial') {
        return;
      }

      // If only zoom provided
      if (isDefined(state.zoom) && !isDefined(state.x) && !isDefined(state.y)) {
        this.rootSvgSelection.transition().duration(viewport.duration).call(this.zoomBehavior.scaleTo, state.zoom);

        return;
      }

      // If only pan provided
      if (isDefined(state.x) && isDefined(state.y) && !isDefined(state.zoom)) {
        // remain same zoom value
        const zoom = untracked(this.viewportService.readableViewport).zoom;

        this.rootSvgSelection
          .transition()
          .duration(viewport.duration)
          .call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(zoom));

        return;
      }

      // If whole viewort state provided
      if (isDefined(state.x) && isDefined(state.y) && isDefined(state.zoom)) {
        this.rootSvgSelection
          .transition()
          .duration(viewport.duration)
          .call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(state.zoom));

        return;
      }
    },
    { allowSignalWrites: true },
  );

  protected zoomBehavior!: ZoomBehavior<SVGSVGElement, unknown>;

  public ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.zoomBehavior = zoom<SVGSVGElement, unknown>()
        .scaleExtent([this.flowSettingsService.minZoom(), this.flowSettingsService.maxZoom()])
        .filter(this.filterCondition)
        .on('start', this.handleZoomStart)
        .on('zoom', this.handleZoom)
        .on('end', this.handleZoomEnd);

      this.rootSvgSelection.call(this.zoomBehavior).on('dblclick.zoom', null);
    });
  }

  private handleZoom = ({ transform }: ZoomEvent) => {
    // update public signal for user to read
    this.viewportService.readableViewport.set(mapTransformToViewportState(transform));

    this.transform.set(transform.toString());
  };

  private handleZoomStart = ({ transform }: ZoomEvent) => {
    this.viewportForSelection = {
      start: mapTransformToViewportState(transform),
    };
  };

  private handleZoomEnd = ({ transform, sourceEvent }: ZoomEvent) => {
    this.zone.run(() => {
      this.viewportForSelection = {
        ...this.viewportForSelection,
        end: mapTransformToViewportState(transform),
        target: evTarget(sourceEvent),
      };

      this.viewportService.triggerViewportChangeEvent('end');

      // TODO: maybe use triggerViewportChangeEvent instead of this method?
      this.selectionService.setViewport(this.viewportForSelection as ViewportForSelection);
    });
  };

  private filterCondition = (event: Event) => {
    if (event.type === 'mousedown' || event.type === 'touchstart') {
      return (event.target as Element).closest('.vflow-node') === null;
    }

    return true;
  };
}

const mapTransformToViewportState = (transform: ZoomTransform): ViewportState => ({
  zoom: transform.k,
  x: transform.x,
  y: transform.y,
});

const evTarget = (anyEvent: any): Element | undefined => {
  if (anyEvent instanceof Event && anyEvent.target instanceof Element) {
    return anyEvent.target;
  }

  return undefined;
};

declare module 'd3-selection' {
  interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    transition(): Selection<GElement, Datum, PElement, PDatum>;
    duration(duration: number): Selection<GElement, Datum, PElement, PDatum>;
  }
}

type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>;
