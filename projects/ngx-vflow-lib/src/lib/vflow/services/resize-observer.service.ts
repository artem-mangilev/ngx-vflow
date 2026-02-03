import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';

@Injectable()
export class ResizeObserverService implements OnDestroy {
  private zone = inject(NgZone);
  private readonly thingsToObserve: Map<Element, [(resizeEntry: ResizeObserverEntry) => void]> = new Map();

  private resizeObserver: ResizeObserver;

  constructor() {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.zone.run(() => {
        for (const entry of entries) {
          const callbacks = this.thingsToObserve.get(entry.target);
          if (callbacks !== undefined) {
            callbacks.forEach((c) => c(entry));
          }
        }
      });
    });
  }

  public addObserver(element: Element, callback: (resizeEntry: ResizeObserverEntry) => void) {
    const callbacks = this.thingsToObserve.get(element);
    if (callbacks === undefined) {
      this.thingsToObserve.set(element, [callback]);
    } else {
      callbacks.push(callback);
    }

    this.resizeObserver.observe(element);
  }

  public removeObserver(element: Element) {
    this.thingsToObserve.delete(element);
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(element);
    }
  }

  public ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }
}
