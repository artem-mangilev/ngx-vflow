import { DestroyRef, Directive, inject, Injector, OnInit } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, merge, fromEvent } from 'rxjs';
import { switchMap, tap, withLatestFrom, map, shareReplay, take, distinctUntilKeyChanged } from 'rxjs/operators';
import { FlowStatusService } from '../services/flow-status.service';
import { ViewportService } from '../services/viewport.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';
import { animationFrames } from '../utils/animation-frames';

const EDGE = 48; // px from edge to trigger pan
const BASE_SPEED = 10;

const START_STATES = ['node-drag', 'connection-start', 'reconnection-start'];

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
    if (this.flowSettingsService.autoPan()) {
      toObservable(this.statusService.status, { injector: this.injector })
        .pipe(
          distinctUntilKeyChanged('state'),
          switchMap((status) =>
            START_STATES.includes(status.state)
              ? this.documentPoint$.pipe(
                  take(1),
                  switchMap(() =>
                    animationFrames().pipe(
                      withLatestFrom(this.documentPoint$),
                      map(([, point]) => point),
                      tap((point) => this.pan(point)),
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

  private pan(point: Point): void {
    const viewport = this.viewportService.readableViewport();
    const { x, y, zoom } = viewport;

    const width = this.flowSettingsService.computedFlowWidth();
    const height = this.flowSettingsService.computedFlowHeight();

    const dL = point.x;
    const dR = width - point.x;
    const dT = point.y;
    const dB = height - point.y;

    let deltaX = 0;
    let deltaY = 0;

    // Left edge: pan right (increase x)
    if (dL < EDGE) {
      const speedL = BASE_SPEED * edgeFactor(dL);
      deltaX += speedL;
    }

    // Right edge: pan left (decrease x)
    if (dR < EDGE) {
      const speedR = BASE_SPEED * edgeFactor(dR);
      deltaX -= speedR;
    }

    // Top edge: pan down (increase y)
    if (dT < EDGE) {
      const speedT = BASE_SPEED * edgeFactor(dT);
      deltaY += speedT;
    }

    // Bottom edge: pan up (decrease y)
    if (dB < EDGE) {
      const speedB = BASE_SPEED * edgeFactor(dB);
      deltaY -= speedB;
    }

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

function edgeFactor(distance: number): number {
  const t = clamp01((EDGE - distance) / EDGE);
  return t * t; // ease-in: t^2
}
