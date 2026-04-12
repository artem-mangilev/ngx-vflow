import { Injectable } from '@angular/core';

@Injectable()
export class RequestAnimationFrameBatchingService {
  private callbacks: (() => void)[] = [];
  private requestAnimationFrameStarted = false;

  public batchAnimationFrame(callback: () => void) {
    this.callbacks.push(callback);
    if (!this.requestAnimationFrameStarted) {
      this.requestAnimationFrameStarted = true;
      requestAnimationFrame(() => {
        this.callbacks.forEach((x) => {
          if (x) {
            x();
          }
        });
        this.callbacks = [];
        this.requestAnimationFrameStarted = false;
      });
    }
  }
}
