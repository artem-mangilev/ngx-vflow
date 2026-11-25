import { Provider } from '@angular/core';

// A brand only the library can name: an object literal of the same shape is not a feature.
declare const FEATURE_BRAND: unique symbol;

/**
 * An optional capability of the flows below an injector: a kind, unique per `provideVflow` call, and the providers
 * that install it. Built only by a `with*()` function of the library and passed to {@link provideVflow}. It is a
 * type: an application cannot build one.
 */
export interface VflowFeature<K extends string = string> {
  readonly kind: K;
  readonly providers: readonly Provider[];
  readonly [FEATURE_BRAND]: K;
}

/** The runtime class of every feature, so `provideVflow` can tell a feature from anything else. */
class Feature<K extends string> {
  constructor(
    public readonly kind: K,
    public readonly providers: readonly Provider[],
  ) {}
}

/** Builds a feature for {@link provideVflow}. Internal: the library's `with*()` functions are the only callers. */
export function vflowFeature<K extends string>(kind: K, providers: readonly Provider[]): VflowFeature<K> {
  return new Feature(kind, providers) as unknown as VflowFeature<K>;
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
      if (!(feature instanceof Feature)) {
        throw new Error('[ngx-vflow] provideVflow() takes features built with a with*() function.');
      }
      if (kinds.has(feature.kind)) {
        throw new Error(`[ngx-vflow] The feature "${feature.kind}" was provided twice in one provideVflow() call.`);
      }
      kinds.add(feature.kind);
    }
  }

  return features.flatMap((feature) => feature.providers);
}
