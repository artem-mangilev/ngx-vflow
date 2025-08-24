import { inject, Injectable, NgZone, signal } from '@angular/core';

@Injectable()
export class FlowRenderingService {
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
