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
        const callbacks = this.callbacks;
        this.callbacks = [];
        this.requestAnimationFrameStarted = false;

        callbacks.forEach((callback) => callback());
      });
    }
  }
}
