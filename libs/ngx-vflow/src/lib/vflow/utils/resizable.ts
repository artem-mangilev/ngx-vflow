import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export function resizable(elems: Element[], zone: NgZone) {
  return new Observable<ResizeObserverEntry[]>((subscriber) => {
    const ro = new ResizeObserver((entries) => {
      zone.run(() => subscriber.next(entries));
    });

    elems.forEach((e) => ro.observe(e));

    return () => ro.disconnect();
  });
}
