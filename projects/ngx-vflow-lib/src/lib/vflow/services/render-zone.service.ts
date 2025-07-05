import { inject, Injectable } from '@angular/core';
import { ViewportService } from './viewport.service';
import { Point } from '../interfaces/point.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, throttleTime } from 'rxjs';
import { getViewportBounds } from '../utils/viewport';
import { FlowSettingsService } from './flow-settings.service';
import { Rect } from '../interfaces/rect';

const RENDER_AREA = 100000; // 10000px
const ZONE_SIZE = 1000; // 1000px

@Injectable()
export class RenderZoneService {
  protected viewportService = inject(ViewportService);
  protected flowSettingsService = inject(FlowSettingsService);

  private zones = getZones(RENDER_AREA, ZONE_SIZE);

  public viewportZones = toSignal(
    toObservable(this.viewportService.readableViewport).pipe(
      throttleTime(1000),
      map((viewport) => {
        const viewportBounds = getViewportBounds(
          viewport,
          this.flowSettingsService.computedFlowWidth(),
          this.flowSettingsService.computedFlowHeight(),
        );

        return this.zones
          .filter((zone) => {
            return (
              zone.x + ZONE_SIZE >= viewportBounds.x &&
              zone.x <= viewportBounds.x + viewportBounds.width &&
              zone.y + ZONE_SIZE >= viewportBounds.y &&
              zone.y <= viewportBounds.y + viewportBounds.height
            );
          })
          .map(({ x, y }) => {
            return {
              x,
              y,
              width: ZONE_SIZE,
              height: ZONE_SIZE,
            } as Rect;
          });
      }),
      distinctUntilChanged((prev, curr) => {
        if (prev.length !== curr.length) {
          return false;
        }

        return prev.every((zone, index) => {
          const currentZone = curr[index];
          return (
            zone.x === currentZone.x &&
            zone.y === currentZone.y &&
            zone.width === currentZone.width &&
            zone.height === currentZone.height
          );
        });
      }),
    ),
    { initialValue: [] as Rect[] },
  );
}

function getZones(renderArea: number, zoneSize: number): Point[] {
  const halfArea = renderArea / 2;
  const startX = Math.floor(-halfArea / zoneSize) * zoneSize;
  const endX = Math.ceil(halfArea / zoneSize) * zoneSize;
  const startY = Math.floor(-halfArea / zoneSize) * zoneSize;
  const endY = Math.ceil(halfArea / zoneSize) * zoneSize;

  const zones: Point[] = [];

  for (let x = startX; x < endX; x += zoneSize) {
    for (let y = startY; y < endY; y += zoneSize) {
      zones.push({ x, y });
    }
  }

  return zones;
}
