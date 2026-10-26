import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgDocThemeService } from '@ng-doc/app/services/theme';

/**
 * The vflow UI theme that follows the docs theme toggle: `dark`, `light` (no attribute) or `auto`, which follows the
 * operating system as the ng-doc stylesheet does. Bind it to `data-vui-theme` of a demo.
 */
export function injectDocsTheme(): Signal<'light' | 'dark'> {
  const themes = inject(NgDocThemeService);
  const id = toSignal(themes.themeChanges(), { initialValue: themes.currentTheme });
  const media = matchMedia('(prefers-color-scheme: dark)');
  const systemDark = signal(media.matches);
  const update = (event: MediaQueryListEvent) => systemDark.set(event.matches);
  media.addEventListener('change', update);
  inject(DestroyRef).onDestroy(() => media.removeEventListener('change', update));

  return computed(() => (id() === 'dark' || (id() === 'auto' && systemDark()) ? 'dark' : 'light'));
}
