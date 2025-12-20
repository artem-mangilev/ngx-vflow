import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { animationFrames, EMPTY, merge, switchMap, tap, withLatestFrom, map, shareReplay, take, fromEvent } from 'rxjs';
import { FlowStatusService } from '../services/flow-status.service';
import { ViewportService } from '../services/viewport.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';

const EDGE = 48; // px from edge to trigger pan
const BASE_SPEED = 5; // px per frame

const START_STATES = ['node-drag-start', 'connection-start', 'reconnection-start'];

@Directive({ selector: '[autoPan]', standalone: true })
export class AutoPanDirective {
  private readonly statusService = inject(FlowStatusService);
  private readonly viewportService = inject(ViewportService);
  private readonly flowSettingsService = inject(FlowSettingsService);
  private readonly rootSvg = inject(RootSvgReferenceDirective).element;

  private readonly documentPoint$ = merge(
    fromEvent<PointerEvent>(document, 'pointerdown', { capture: true }),
    fromEvent<PointerEvent>(document, 'pointermove', { capture: true }),
  ).pipe(
    map((event) => ({ x: event.clientX, y: event.clientY })),
    map((point) => this.toViewportPoint(point)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor() {
    toObservable(this.statusService.status)
      .pipe(
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
        takeUntilDestroyed(),
      )
      .subscribe();
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

    const speed = BASE_SPEED;
    let deltaX = 0;
    let deltaY = 0;

    if (dL < EDGE) deltaX = +speed;
    if (dR < EDGE) deltaX = -speed;
    if (dT < EDGE) deltaY = +speed;
    if (dB < EDGE) deltaY = -speed;

    if (deltaX !== 0 || deltaY !== 0) {
      this.viewportService.writableViewport.set({
        changeType: 'absolute',
        state: { x: x + deltaX, y: y + deltaY, zoom },
        duration: 0,
      });
    }
  }
}
