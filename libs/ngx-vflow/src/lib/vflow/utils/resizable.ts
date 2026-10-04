import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export function resizable(elems: Element[], zone: NgZone) {
  return new Observable<ResizeObserverEntry[]>((subscriber) => {
    // A DOM without layout, such as jsdom, has no ResizeObserver: the elements never report a size.
    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver((entries) => {
      zone.run(() => subscriber.next(entries));
    });

    elems.forEach((e) => ro.observe(e));

    return () => ro.disconnect();
  });
}
