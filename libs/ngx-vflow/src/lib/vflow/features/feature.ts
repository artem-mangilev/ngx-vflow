import { InjectionToken, Provider } from '@angular/core';

/**
 * An optional capability of a flow: a kind, unique per flow, and the providers that install it. Built with
 * {@link vflowFeature} and passed to {@link provideVflow}.
 */
export class VflowFeature<K extends string = string> {
  // A private member keeps the type nominal: an object literal with the same shape is not a feature.
  declare private readonly brand: never;

  private constructor(
    public readonly kind: K,
    public readonly providers: readonly Provider[],
  ) {}

  /** @internal */
  public static create<K extends string>(kind: K, providers: readonly Provider[]): VflowFeature<K> {
    return new VflowFeature(kind, providers);
  }
}

/**
 * Builds a feature. Library features use documented kinds such as `'snap-grid'`; a third party picks a namespaced
 * one such as `'acme:proximity-connect'`.
 */
export function vflowFeature<K extends string>(kind: K, providers: readonly Provider[]): VflowFeature<K> {
  return VflowFeature.create(kind, providers);
}

/** One value per `provideVflow` call, so a flow can tell when it was called twice in one injector. */
export const VFLOW_PROVIDE_MARKER = new InjectionToken<true[]>('VFLOW_PROVIDE_MARKER');

/**
 * Installs features on the flows below the injector it is placed in, normally the `providers` of the component that
 * hosts `<vflow>`. The nearest `provideVflow` up the injector tree wins; features of two levels are not merged.
 */
export function provideVflow(...features: VflowFeature[]): Provider[] {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    const kinds = new Set<string>();
    for (const feature of features) {
      if (!(feature instanceof VflowFeature)) {
        throw new Error('[ngx-vflow] provideVflow accepts features built with vflowFeature() or a withX() function.');
      }
      if (kinds.has(feature.kind)) {
        throw new Error(`[ngx-vflow] Feature "${feature.kind}" was provided twice; a flow has at most one of a kind.`);
      }
      kinds.add(feature.kind);
    }
  }

  return [{ provide: VFLOW_PROVIDE_MARKER, useValue: true, multi: true }, ...features.flatMap((f) => f.providers)];
}
