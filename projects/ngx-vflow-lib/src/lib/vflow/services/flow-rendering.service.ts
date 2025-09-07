import { inject, Injectable, NgZone, signal } from '@angular/core';
import { NodeRenderingService } from './node-rendering.service';
import { EdgeRenderingService } from './edge-rendering.service';
import { FlowSettingsService } from './flow-settings.service';
import { FlowEntitiesService } from './flow-entities.service';

@Injectable()
export class FlowRenderingService {
  private readonly nodeRenderingService = inject(NodeRenderingService);
  private readonly edgeRenderingService = inject(EdgeRenderingService);
  private readonly flowEntitiesService = inject(FlowEntitiesService);
  private readonly settingsService = inject(FlowSettingsService);

  public flowInitialized = signal(false);

  constructor() {
    inject(NgZone).runOutsideAngular(async () => {
      await skipFrames(2);

      this.flowInitialized.set(true);
    });
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
