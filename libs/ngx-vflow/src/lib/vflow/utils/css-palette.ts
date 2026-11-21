import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, distinctUntilChanged, fromEvent, map, merge, tap } from 'rxjs';

/** CSS colors as a canvas takes them, by the color as it is written. */
export type CssPalette = ReadonlyMap<string, string>;

const TRANSITION_EVENTS = ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel'];

/**
 * A canvas takes no `var()`, `light-dark()` or `color-mix()`. This resolves `colors` the way an element inside
 * `host` computes them, so custom properties set on `host` or an ancestor apply and `currentColor` is the color of
 * `host`.
 *
 * Each color is the `color` of a hidden element in `host` with a transition on it. The browser starts a transition
 * exactly when the computed color changes, whatever changed it: a class or an attribute anywhere, a stylesheet, a
 * media query. The palette is read again then, and it changes only when a resolved color does.
 *
 * An element that is not rendered runs no transitions, so `colors` should be empty while `host` is hidden: the
 * colors are then resolved anew when it is shown. On a server the palette stays empty.
 */
export function cssPalette(host: HTMLElement, colors: Signal<readonly string[]>): Signal<CssPalette> {
  const document = inject(DOCUMENT);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return signal<CssPalette>(new Map()).asReadonly();

  // Rendered, so that transitions run, and without a box of its own.
  const container = document.createElement('span');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden; visibility: hidden';
  const probes = new Map<string, HTMLElement>();

  /** One probe per color, so that only a change of the computed color starts a transition, never this function. */
  const reconcile = (list: readonly string[]) => {
    if (list.length && !container.isConnected) host.appendChild(container);
    for (const [color, probe] of probes) {
      if (list.includes(color)) continue;
      probe.remove();
      probes.delete(color);
    }
    for (const color of list) {
      if (probes.has(color)) continue;
      const probe = container.appendChild(document.createElement('span'));
      probe.style.color = color;
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && color && !probe.style.color) {
        console.warn(`[ngx-vflow] "${color}" is not a CSS color.`);
      }
      // Important, so that a reset of the application such as `* { transition: none !important }` does not win.
      probe.style.setProperty('transition', 'color 1ms step-start', 'important');
      probes.set(color, probe);
    }
  };

  const read = (): CssPalette => {
    const style = (probe: HTMLElement) => document.defaultView?.getComputedStyle(probe).color ?? '';
    return new Map(Array.from(probes, ([color, probe]) => [color, style(probe)]));
  };

  // The events stop here: a listener of the application on an ancestor must not take them for its own transitions.
  const transitions = merge(...TRANSITION_EVENTS.map((type) => fromEvent(container, type))).pipe(
    tap((event) => event.stopPropagation()),
  );
  // A system color keeps its computed value when the scheme changes, so no transition reports that.
  const scheme = document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  return toSignal(
    merge(toObservable(colors).pipe(tap(reconcile)), transitions, scheme ? fromEvent(scheme, 'change') : EMPTY).pipe(
      map(read),
      distinctUntilChanged(sameEntries),
    ),
    { initialValue: new Map<string, string>() },
  );
}

function sameEntries(a: CssPalette, b: CssPalette): boolean {
  if (a.size !== b.size) return false;
  for (const [color, resolved] of a) if (b.get(color) !== resolved) return false;
  return true;
}
