import { Directive, ElementRef, NgZone, OnDestroy, OnInit, effect, inject, untracked } from '@angular/core';
import { pointer, select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, ZoomTransform, zoom, zoomIdentity } from 'd3-zoom';
import { ViewportService } from '../services/viewport.service';
import { isDefined } from '../utils/is-defined';
import { ViewportState } from '../interfaces/viewport.interface';
import { SelectionService, ViewportForSelection } from '../services/selection.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { KeyboardService } from '../services/keyboard.service';
import { isTouchEvent } from '../utils/event';
import { allowRootZoomForNodeTarget } from '../utils/allow-root-zoom-for-node-target';

@Directive({
  standalone: true,
  selector: 'div[mapContext]',
})
export class MapContextDirective implements OnInit, OnDestroy {
  protected host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected selectionService = inject(SelectionService);
  protected viewportService = inject(ViewportService);
  protected flowSettingsService = inject(FlowSettingsService);
  protected keyboardService = inject(KeyboardService);
  protected zone = inject(NgZone);

  protected paneSelection = select(this.host);

  protected viewportForSelection: Partial<ViewportForSelection> = {};

  // under the hood this effect triggers handleZoom, so error throws without this flag
  protected manualViewportChangeEffect = effect(() => {
    const viewport = this.viewportService.writableViewport();
    const state = viewport.state;

    if (viewport.changeType === 'initial') {
      return;
    }

    // Auto-pan updates every frame; a zero-duration transition still queues work in D3.
    // D3 applies selection transforms synchronously and interrupts older animations.
    const target =
      viewport.duration > 0 ? this.paneSelection.transition().duration(viewport.duration) : this.paneSelection;

    // If only zoom provided
    if (isDefined(state.zoom) && !isDefined(state.x) && !isDefined(state.y)) {
      target.call(this.zoomBehavior.scaleTo, state.zoom);

      return;
    }

    // If only pan provided
    if (isDefined(state.x) && isDefined(state.y) && !isDefined(state.zoom)) {
      // remain same zoom value
      const zoom = untracked(this.viewportService.readableViewport).zoom;

      target.call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(zoom));

      return;
    }

    // If whole viewort state provided
    if (isDefined(state.x) && isDefined(state.y) && isDefined(state.zoom)) {
      target.call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(state.zoom));

      return;
    }
  });

  private touchCenter?: [number, number];

  protected zoomBehavior!: ZoomBehavior<HTMLElement, unknown>;

  public ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.zoomBehavior = zoom<HTMLElement, unknown>()
        .scaleExtent([this.flowSettingsService.minZoom(), this.flowSettingsService.maxZoom()])
        .filter(this.filterCondition)
        .on('start', this.handleZoomStart)
        .on('zoom', this.handleZoom)
        .on('end', this.handleZoomEnd);

      this.paneSelection.call(this.zoomBehavior);
      const wheelZoom = this.paneSelection.on('wheel.zoom')!;
      const doubleClickZoom = this.paneSelection.on('dblclick.zoom')!;
      this.paneSelection
        .on(
          'wheel.zoom',
          (event: WheelEvent) => {
            if (this.excluded(event, '[data-vflow-no-wheel]')) return;
            if (!event.ctrlKey && this.scrollPanning()) {
              if (
                this.keyboardService.isActiveAction('selection') ||
                this.excluded(event, '[data-vflow-no-pan], [data-vflow-no-drag]')
              )
                return;
              event.preventDefault();
              const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.host.clientHeight : 1;
              const k = this.viewportService.readableViewport().zoom;
              this.zoomBehavior.translateBy(this.paneSelection, (-event.deltaX * unit) / k, (-event.deltaY * unit) / k);
            } else {
              wheelZoom.call(this.host, event, undefined);
            }
          },
          { passive: false },
        )
        .on('dblclick.zoom', (event: MouseEvent) => {
          if (this.flowSettingsService.zoomOnDoubleClick() && this.filterCondition(event)) {
            doubleClickZoom.call(this.host, event, undefined);
          }
        });
      // D3 consumes accepted touch gestures itself; controls must retain native scrolling.
      this.paneSelection.style('touch-action', null);
    });
  }

  public ngOnDestroy() {
    this.paneSelection.on('.zoom', null);
  }

  private handleZoom = ({ transform, sourceEvent }: ZoomEvent) => {
    if (sourceEvent && isTouchEvent(sourceEvent)) {
      const current = this.viewportService.readableViewport();
      const touches = Array.from(sourceEvent.touches);
      const rect = this.host.getBoundingClientRect();
      const center: [number, number] = [
        touches.reduce((sum, touch) => sum + touch.clientX, 0) / touches.length - rect.left,
        touches.reduce((sum, touch) => sum + touch.clientY, 0) / touches.length - rect.top,
      ];
      const pan = this.dragPanning() && !this.excluded(sourceEvent, '[data-vflow-no-pan], [data-vflow-no-drag]');
      if (!this.flowSettingsService.zoomOnPinch()) {
        const ratio = current.zoom / transform.k;
        transform = zoomIdentity
          .translate(center[0] - (center[0] - transform.x) * ratio, center[1] - (center[1] - transform.y) * ratio)
          .scale(current.zoom);
      }
      if (!pan) {
        const ratio = touches.length > 1 ? transform.k / current.zoom : 1;
        const anchor = this.touchCenter ?? center;
        transform = zoomIdentity
          .translate(anchor[0] - (anchor[0] - current.x) * ratio, anchor[1] - (anchor[1] - current.y) * ratio)
          .scale(current.zoom * ratio);
      }
      this.touchCenter = center;
      this.paneSelection.property('__zoom', transform);
    }
    // update public signal for user to read
    this.viewportService.readableViewport.set(mapTransformToViewportState(transform));
  };

  private handleZoomStart = ({ transform, sourceEvent }: ZoomEvent) => {
    this.touchCenter = undefined;
    if (sourceEvent && isTouchEvent(sourceEvent)) {
      const points = Array.from(sourceEvent.touches).map((touch) => pointer(touch, this.host));
      this.touchCenter = [
        points.reduce((sum, p) => sum + p[0], 0) / points.length,
        points.reduce((sum, p) => sum + p[1], 0) / points.length,
      ];
    }
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

  private excluded(event: Event, selector: string) {
    return event.target instanceof Element && !!event.target.closest(selector);
  }

  private dragPanning() {
    return this.keyboardService.isActiveAction('pan') || this.flowSettingsService.panOnDrag() !== false;
  }

  private scrollPanning() {
    return (
      (this.flowSettingsService.panOnScroll() || this.keyboardService.isActiveAction('pan')) &&
      !this.keyboardService.isActiveAction('zoom')
    );
  }

  private filterCondition = (event: Event) => {
    if (event.type === 'wheel') {
      const wheel = event as WheelEvent;
      return (
        !this.excluded(event, '[data-vflow-no-wheel]') &&
        (wheel.ctrlKey
          ? this.flowSettingsService.zoomOnPinch()
          : this.keyboardService.isActiveAction('zoom') || this.flowSettingsService.zoomOnScroll())
      );
    }
    if (event.type === 'dblclick') return this.flowSettingsService.zoomOnDoubleClick();
    const selecting = this.keyboardService.isActiveAction('selection');
    const panTarget = allowRootZoomForNodeTarget(event, selecting);
    if (isTouchEvent(event)) {
      return (
        !selecting &&
        ((panTarget && this.dragPanning()) || (event.touches.length > 1 && this.flowSettingsService.zoomOnPinch()))
      );
    }
    if (!panTarget) return false;
    const buttons = this.flowSettingsService.panOnDrag();
    return (
      this.dragPanning() &&
      (!(event instanceof MouseEvent) || !Array.isArray(buttons) || buttons.includes(event.button))
    );
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

type ZoomEvent = D3ZoomEvent<HTMLElement, unknown>;
