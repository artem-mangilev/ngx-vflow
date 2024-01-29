import { NgZone } from "@angular/core";
import { Observable } from "rxjs";

export function resizable(elem: Element, zone: NgZone) {
  return new Observable<ResizeObserverEntry>((subscriber) => {
    let ro = new ResizeObserver(([entry]) => {
      zone.run(() => subscriber.next(entry))
    });

    ro.observe(elem);

    return () => ro.disconnect()
  });
}
