import { DestroyRef, Directive, ElementRef, inject, Injector, OnInit } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, merge, fromEvent, Observable } from 'rxjs';
import {
  switchMap,
  tap,
  withLatestFrom,
  map,
  shareReplay,
  take,
  distinctUntilKeyChanged,
  startWith,
  pairwise,
} from 'rxjs/operators';
import { FlowStatusService } from '../services/flow-status.service';
import { ViewportService } from '../services/viewport.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { Point } from '../interfaces/point.interface';
import { animationFrames } from '../utils/animation-frames';
import { AutoPanSettings } from '../interfaces/auto-pan-settings.interface';

@Directive({ selector: '[autoPan]', standalone: true })
export class AutoPanDirective implements OnInit {
  private readonly statusService = inject(FlowStatusService);
  private readonly viewportService = inject(ViewportService);
  private readonly flowSettingsService = inject(FlowSettingsService);
  /** The pane, which covers the whole flow. */
  private readonly pane = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly documentPoint$ = merge(
    fromEvent<PointerEvent>(document, 'pointerdown', { capture: true }),
    fromEvent<PointerEvent>(document, 'pointermove', { capture: true }),
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

  /** Pans while the status is one of the configured drags, or never when the settings disable auto-pan. */
  private panning(value: boolean | AutoPanSettings): Observable<unknown> {
    const options = typeof value === 'boolean' ? { nodeDrag: value, connectionDrag: value } : value;
    const states = [
      ...((options.nodeDrag ?? true) ? ['node-drag'] : []),
      ...((options.connectionDrag ?? true) ? ['connection-start', 'reconnection-start'] : []),
    ];
    const speed = nonNegativeSetting(options.speed, 600);
    const margin = nonNegativeSetting(options.margin, 48);
    if (!states.length || speed <= 0 || margin <= 0) return EMPTY;

    return toObservable(this.statusService.status, { injector: this.injector }).pipe(
      distinctUntilKeyChanged('state'),
      switchMap((status) =>
        states.includes(status.state)
          ? this.documentPoint$.pipe(
              take(1),
              switchMap(() =>
                animationFrames().pipe(
                  startWith({ timestamp: 0, elapsed: 0 }),
                  pairwise(),
                  withLatestFrom(this.documentPoint$),
                  tap(([[previous, current], point]) =>
                    this.pan(point, (speed * (current.elapsed - previous.elapsed)) / 1000, margin),
                  ),
                ),
              ),
            )
          : EMPTY,
      ),
    );
  }

  private toViewportPoint(event: Point): Point {
    const rect = this.pane.getBoundingClientRect();
    return {
      x: event.x - rect.left,
      y: event.y - rect.top,
    };
  }

  private pan(point: Point, distance: number, margin: number): void {
    const viewport = this.viewportService.readableViewport();
    const { x, y, zoom } = viewport;

    const width = this.flowSettingsService.computedFlowWidth();
    const height = this.flowSettingsService.computedFlowHeight();

    const deltaX = distance * (edgeFactor(point.x, margin) - edgeFactor(width - point.x, margin));
    const deltaY = distance * (edgeFactor(point.y, margin) - edgeFactor(height - point.y, margin));

    if (deltaX !== 0 || deltaY !== 0) {
      this.viewportService.change({ x: x + deltaX, y: y + deltaY, zoom });
    }
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function edgeFactor(distance: number, margin: number): number {
  const t = clamp01((margin - distance) / margin);
  return t * t; // ease-in: t^2
}

/** A finite, non-negative setting; anything else takes the fallback. */
function nonNegativeSetting(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}
