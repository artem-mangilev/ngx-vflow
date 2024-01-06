import { Observable, combineLatest, fromEvent, map, merge, startWith } from "rxjs";

export interface UISnapshot {
  classes: Set<string>
}

export function uiChange$(target: Element): Observable<UISnapshot> {
  return combineLatest([
    classChange$(target),
    hover$(target)
  ])
    .pipe(
      map(([classSet, hoverSet]) => {
        return {
          classes: new Set([...classSet, ...hoverSet])
        }
      })
    )
}

const classChange$ = (target: Element) => new Observable<Set<string>>((subscriber) => {
  let ro = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const isClass = mutation.type === 'attributes' && mutation.attributeName === 'class'

      if (isClass) {
        const classList = Array.from(target.classList)
        const set = new Set(classList)
        subscriber.next(set)
      }
    }
  });

  ro.observe(target, { attributes: true })

  return () => ro.disconnect()
})
  .pipe(
    startWith(new Set(Array.from(target.classList)))
  );

const hover$ = (target: Element) => merge(
  fromEvent(target, 'mouseenter').pipe(map(() => new Set<string>([':hover']))),
  fromEvent(target, 'mouseleave').pipe(map(() => new Set<string>()))
)
  .pipe(
    startWith(new Set<string>())
  )
