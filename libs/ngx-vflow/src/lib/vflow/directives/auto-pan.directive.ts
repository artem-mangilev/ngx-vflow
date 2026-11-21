import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, Directive, ElementRef, inject, Injector, OnInit } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, defer, merge, fromEvent, Observable } from 'rxjs';
import {
  switchMap,
  tap,
  withLatestFrom,
  map,
  shareReplay,
  take,
  distinctUntilChanged,
  startWith,
  pairwise,
  finalize,
} from 'rxjs/operators';
import { ViewportService } from '../services/viewport.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { DraggableService } from '../services/draggable.service';
import { ConnectionService } from '../services/connection.service';
import { Point } from '../interfaces/point.interface';
import { animationFrames } from '../utils/animation-frames';
import { clamp } from '../utils/viewport';
import { AutoPanSettings } from '../interfaces/auto-pan-settings.interface';

@Directive({ selector: '[autoPan]', standalone: true })
export class AutoPanDirective implements OnInit {
  private readonly draggable = inject(DraggableService);
  private readonly connection = inject(ConnectionService);
  private readonly viewportService = inject(ViewportService);
  private readonly flowSettingsService = inject(FlowSettingsService);
  /** The pane, which covers the whole flow. */
  private readonly pane = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  private readonly documentPoint$ = merge(
    fromEvent<PointerEvent>(this.document, 'pointerdown', { capture: true }),
    fromEvent<PointerEvent>(this.document, 'pointermove', { capture: true }),
  ).pipe(
    map((event) => ({ x: event.clientX, y: event.clientY })),
    map((point) => this.toViewportPoint(point)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  ngOnInit() {
    // A new binding replaces the running configuration, including during a drag.
    toObservable(this.flowSettingsService.autoPan, { injector: this.injector })
      .pipe(
        switchMap((value) => this.panning(value)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  /** Pans while one of the configured drags is in progress, or never when the settings disable auto-pan. */
  private panning(value: boolean | AutoPanSettings): Observable<unknown> {
    const options = typeof value === 'boolean' ? { nodeDrag: value, connectionDrag: value } : value;
    const nodeDrag = options.nodeDrag ?? true;
    const connectionDrag = options.connectionDrag ?? true;
    const speed = nonNegativeSetting(options.speed, 600);
    const margin = nonNegativeSetting(options.margin, 48);
    if ((!nodeDrag && !connectionDrag) || speed <= 0 || margin <= 0) return EMPTY;

    const active = computed(
      () => (nodeDrag && this.draggable.dragging()) || (connectionDrag && this.connection.active()),
    );

    return toObservable(active, { injector: this.injector }).pipe(
      distinctUntilChanged(),
      switchMap((panning) => (panning ? this.panFrames(speed, margin) : EMPTY)),
    );
  }

  /**
   * Pans every frame while the pointer is near an edge. The steps from the first one to the end of the drag are one
   * viewport gesture, so the flow reports one `viewportChangeEnd` for them, not one per frame.
   */
  private panFrames(speed: number, margin: number): Observable<unknown> {
    return defer(() => {
      let started = false;
      return this.documentPoint$.pipe(
        take(1),
        switchMap(() =>
          animationFrames().pipe(
            startWith({ timestamp: 0, elapsed: 0 }),
            pairwise(),
            withLatestFrom(this.documentPoint$),
          ),
        ),
        tap(([[previous, current], point]) => {
          const delta = this.panDelta(point, (speed * (current.elapsed - previous.elapsed)) / 1000, margin);
          if (!delta) return;
          if (!started) {
            started = true;
            this.viewportService.beginGesture();
          }
          const { x, y, zoom } = this.viewportService.readableViewport();
          this.viewportService.change({ x: x + delta.x, y: y + delta.y, zoom });
        }),
        finalize(() => {
          if (started) this.viewportService.endGesture();
        }),
      );
    });
  }

  private toViewportPoint(event: Point): Point {
    const rect = this.pane.getBoundingClientRect();
    return {
      x: event.x - rect.left,
      y: event.y - rect.top,
    };
  }

  /** How far the viewport moves this frame; `null` while the pointer is away from the edges. */
  private panDelta(point: Point, distance: number, margin: number): Point | null {
    const width = this.flowSettingsService.computedFlowWidth();
    const height = this.flowSettingsService.computedFlowHeight();

    const x = distance * (edgeFactor(point.x, margin) - edgeFactor(width - point.x, margin));
    const y = distance * (edgeFactor(point.y, margin) - edgeFactor(height - point.y, margin));

    return x !== 0 || y !== 0 ? { x, y } : null;
  }
}

function edgeFactor(distance: number, margin: number): number {
  const t = clamp((margin - distance) / margin);
  return t * t; // ease-in: t^2
}

/** A finite, non-negative setting; anything else takes the fallback. */
function nonNegativeSetting(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}
