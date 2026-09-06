import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';

@Injectable()
export class ResizeObserverService implements OnDestroy {
  private zone = inject(NgZone);
  private readonly thingsToObserve = new Map<Element, Set<(resizeEntry: ResizeObserverEntry) => void>>();

  private resizeObserver: ResizeObserver;

  constructor() {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.zone.run(() => {
        for (const entry of entries) {
          const callbacks = this.thingsToObserve.get(entry.target);
          if (callbacks !== undefined) {
            callbacks.forEach((callback) => callback(entry));
          }
        }
      });
    });
  }

  public addObserver(element: Element, callback: (resizeEntry: ResizeObserverEntry) => void) {
    const callbacks = this.thingsToObserve.get(element);
    if (callbacks === undefined) {
      this.thingsToObserve.set(element, new Set([callback]));
      this.resizeObserver.observe(element);
    } else {
      callbacks.add(callback);
    }
  }

  public removeObserver(element: Element, callback?: (resizeEntry: ResizeObserverEntry) => void) {
    const callbacks = this.thingsToObserve.get(element);

    if (!callbacks) {
      return;
    }

    if (callback) {
      callbacks.delete(callback);
    } else {
      callbacks.clear();
    }

    if (callbacks.size === 0) {
      this.thingsToObserve.delete(element);
      this.resizeObserver.unobserve(element);
    }
  }

  public ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }
}
