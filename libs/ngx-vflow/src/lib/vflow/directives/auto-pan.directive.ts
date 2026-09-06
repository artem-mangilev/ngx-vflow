import { DestroyRef, Directive, inject, Injector, OnInit, isDevMode } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, merge, fromEvent } from 'rxjs';
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
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';
import { animationFrames } from '../utils/animation-frames';

@Directive({ selector: '[autoPan]', standalone: true })
export class AutoPanDirective implements OnInit {
  private readonly statusService = inject(FlowStatusService);
  private readonly viewportService = inject(ViewportService);
  private readonly flowSettingsService = inject(FlowSettingsService);
  private readonly rootSvg = inject(RootSvgReferenceDirective).element;
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
    const value = this.flowSettingsService.autoPan();
    const options = typeof value === 'boolean' ? { nodeDrag: value, connectionDrag: value } : value;
    const states = [
      ...((options.nodeDrag ?? true) ? ['node-drag'] : []),
      ...((options.connectionDrag ?? true) ? ['connection-start', 'reconnection-start'] : []),
    ];
    const speed = nonNegativeSetting('speed', options.speed, 600);
    const margin = nonNegativeSetting('margin', options.margin, 48);
    if (states.length && speed > 0 && margin > 0) {
      toObservable(this.statusService.status, { injector: this.injector })
        .pipe(
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
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    }
  }

  private toViewportPoint(event: Point): Point {
    const rect = this.rootSvg.getBoundingClientRect();
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
      this.viewportService.writableViewport.set({
        changeType: 'absolute',
        state: { x: x + deltaX, y: y + deltaY, zoom },
        duration: 0,
      });
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

function nonNegativeSetting(name: string, value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (Number.isFinite(value) && value >= 0) return value;
  if (isDevMode()) console.warn(`[ngx-vflow] autoPan.${name} must be finite and non-negative; using ${fallback}.`);
  return fallback;
}
