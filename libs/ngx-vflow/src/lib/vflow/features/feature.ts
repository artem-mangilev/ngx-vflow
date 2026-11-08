import { Provider } from '@angular/core';

/**
 * An optional capability of the flows below an injector: a kind, unique per `provideVflow` call, and the providers
 * that install it. Built by a `with*()` function of the library or by {@link vflowFeature}, passed to
 * {@link provideVflow}.
 */
export class VflowFeature<K extends string = string> {
  // A private member keeps the type nominal: an object literal of the same shape is not a feature.
  declare private readonly brand: never;

  // The typings keep `@internal` members (see tsconfig.lib.json), so a public constructor is the honest choice.
  constructor(
    public readonly kind: K,
    public readonly providers: readonly Provider[],
  ) {}
}

/**
 * Builds a feature for {@link provideVflow}. Library features use documented kinds such as `'settings'`; a package or
 * an application picks a namespaced one such as `'acme:proximity-connect'`.
 */
export function vflowFeature<K extends string>(kind: K, providers: readonly Provider[]): VflowFeature<K> {
  return new VflowFeature(kind, providers);
}

/**
 * Installs features on the flows below the injector it is placed in: the providers of `bootstrapApplication`, of a
 * route or of the component that hosts `<vflow>`. Each feature provides its own tokens, so the nearest provider of a
 * token wins and a feature of a closer level merges with, rather than replaces, the same feature of a level above.
 *
 * ```ts
 * // app.config.ts
 * provideVflow(withSettings({ minZoom: 0.2 }), withAccessibility(labels));
 * // a component hosting a flow
 * providers: [provideVflow(withSettings({ zoomOnDoubleClick: true }))]; // minZoom 0.2 still applies
 * ```
 */
export function provideVflow(...features: VflowFeature[]): Provider[] {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    const kinds = new Set<string>();
    for (const feature of features) {
      if (!(feature instanceof VflowFeature)) {
        throw new Error('[ngx-vflow] provideVflow() takes features built with a with*() function or vflowFeature().');
      }
      if (kinds.has(feature.kind)) {
        throw new Error(`[ngx-vflow] The feature "${feature.kind}" was provided twice in one provideVflow() call.`);
      }
      kinds.add(feature.kind);
    }
  }

  return features.flatMap((feature) => feature.providers);
}
