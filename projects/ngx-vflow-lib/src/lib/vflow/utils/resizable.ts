import { Observable } from "rxjs";

export function resizable(elems: Element[]) {
  return new Observable<ResizeObserverEntry[]>((subscriber) => {
    let ro = new ResizeObserver((entries) => {
      subscriber.next(entries)
    });

    elems.forEach(e => ro.observe(e))

    return () => ro.disconnect()
  });
}
