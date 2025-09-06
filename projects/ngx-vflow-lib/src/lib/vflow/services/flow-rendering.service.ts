import { computed, inject, Injectable, Injector, NgZone, signal } from '@angular/core';
import { NodeRenderingService } from './node-rendering.service';
import { EdgeRenderingService } from './edge-rendering.service';
import { FlowSettingsService } from './flow-settings.service';
import { FlowEntitiesService } from './flow-entities.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap, throttleTime } from 'rxjs';

@Injectable()
export class FlowRenderingService {
  private readonly nodeRenderingService = inject(NodeRenderingService);
  private readonly edgeRenderingService = inject(EdgeRenderingService);
  private readonly flowEntitiesService = inject(FlowEntitiesService);
  private readonly settingsService = inject(FlowSettingsService);

  public flowInitialized = signal(false);

  private readonly viewportEntities = computed(() => [
    ...this.nodeRenderingService.viewportNodes(),
    ...this.edgeRenderingService.viewportEdges(),
  ]);

  constructor() {
    inject(NgZone).runOutsideAngular(async () => {
      await skipFrames(2);

      this.flowInitialized.set(true);
    });

    const injector = inject(Injector);

    toObservable(this.settingsService.optimization)
      .pipe(
        map(({ lazyLoadTrigger }) => lazyLoadTrigger),
        switchMap((trigger) =>
          trigger === 'viewport'
            ? toObservable(this.viewportEntities, { injector })
            : toObservable(this.flowEntitiesService.entities, { injector }),
        ),
        filter((entities) => !!entities.length),
        throttleTime(300),
        tap((entities) => entities.forEach((e) => e.shouldLoad.set(true))),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}

// TODO may break on edge cases
function skipFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    let frames = 0;

    function checkFrame() {
      frames++;

      if (frames < count) {
        requestAnimationFrame(checkFrame);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(checkFrame);
  });
}
