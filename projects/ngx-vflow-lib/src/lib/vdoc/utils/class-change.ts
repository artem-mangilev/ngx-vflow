import { Observable, startWith } from "rxjs";

export function classChange(target: Element) {
  return new Observable<string[]>((subscriber) => {
    let ro = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const isClass = mutation.type === 'attributes' && mutation.attributeName === 'class'

        if (isClass) {
          subscriber.next(Array.from(target.classList))
        }
      }
    });

    ro.observe(target, { attributes: true })

    return () => ro.disconnect()
  })
    .pipe(
      startWith(Array.from(target.classList))
    );
}
