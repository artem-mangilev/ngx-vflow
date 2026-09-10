import { DOCUMENT } from '@angular/common';
import { DestroyRef, ElementRef, afterRenderEffect, inject, signal, untracked, Signal } from '@angular/core';

import { Background } from '../../types/background.type';

const defaults = {
  background: '#fff',
  surface: '#fff',
  foreground: '#1b262c',
  muted: '#b1b1b7',
  border: '#c8c8c8',
  selection: '#0f4c75',
};
type Palette = Record<keyof typeof defaults, string>;

/** Resolve CSS through a real color property; canvas cannot consume custom-property expressions.
 * Only ancestor attributes and explicit refreshes are observed, not arbitrary stylesheet changes.
 * The probes never participate in graph layout or node measurement.
 */
export function minimapTheme(revision: Signal<number>, background: Signal<Background>): Signal<Palette> {
  const document = inject(DOCUMENT);
  const canvas = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  const palette = signal<Palette>(defaults, {
    equal: (a, b) => Object.keys(defaults).every((k) => a[k as keyof Palette] === b[k as keyof Palette]),
  });
  const probes = Object.entries(defaults).map(([key, fallback]) => {
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;color:var(--vflow-${key}, ${fallback})`;
    return { key: key as keyof Palette, probe };
  });
  let observer: MutationObserver | undefined;
  const resolve = () => {
    const view = document.defaultView;
    if (!view) return;
    palette.set(
      Object.fromEntries(probes.map(({ key, probe }) => [key, view.getComputedStyle(probe).color])) as Palette,
    );
  };
  afterRenderEffect(() => {
    revision();
    // Compatibility until appearance inputs are removed: resolve explicit legacy backgrounds too.
    const legacy = background();
    const color =
      legacy.type === 'solid'
        ? legacy.color
        : legacy.type === 'dots' || legacy.type === 'grid'
          ? legacy.backgroundColor
          : undefined;
    probes[0].probe.style.color = color ?? 'var(--vflow-background, #fff)';
    if (!observer) {
      probes.forEach(({ probe }) => canvas.parentElement?.appendChild(probe));
      observer = new MutationObserver(resolve);
      for (let element: HTMLElement | null = canvas.parentElement; element; element = element.parentElement) {
        observer.observe(element, { attributes: true });
      }
    }
    untracked(resolve);
  });
  inject(DestroyRef).onDestroy(() => {
    observer?.disconnect();
    probes.forEach(({ probe }) => probe.remove());
  });
  return palette.asReadonly();
}
