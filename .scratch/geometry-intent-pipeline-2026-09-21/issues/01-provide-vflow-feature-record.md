# Add `provideVflow()` and the feature record

Status: resolved
Tier: 3.0-additive
Depends on: —

## Problem

There is no Angular-idiomatic way to register optional behavior on a flow. Anything beyond inputs needs `ɵ` services,
which the platform-parity spec forbids in public contracts.

## Required behavior

- `provideVflow(...features: VflowFeature[]): Provider[]` flattens `feature.providers` into one array. It is
  documented for the `providers` of the component hosting `<vflow>`; the nearest one up the injector tree wins.
- `VflowFeature<K extends string = string>` is a class with readonly `kind: K` and `providers` and a private brand
  field; no `ɵ` names and no enum. `kind` is unique per flow; library kinds are the literals `'snap-grid'`,
  `'auto-pan'`, `'alignment-helper'`, and third parties pick namespaced strings.
  `vflowFeature(kind, providers)` is the only constructor and is public, so third parties can author features.

- `VFLOW_GEOMETRY_TRANSFORMS` is an exported multi-provider token holding `GeometryTransform | Type<GeometryTransform>`.
  A feature registers an entry with `{ provide: VFLOW_GEOMETRY_TRANSFORMS, useValue: SnapTransform, multi: true }` in
  its `vflowFeature(kind, providers)` list. The public helper `provideGeometryTransform(entry)` builds that provider;
  `withX()` is reserved for functions returning a `VflowFeature`. Classes are instantiated by the `<vflow>` injector;
  values are used as given.
- A `FeatureRegistryService` on `<vflow>` collects the token with `inject(..., { optional: true })`, resolves
  order once (precedence category, then flattened array position), dedupes by `id`, and caches per kind and phase.
- Dev-mode errors behind `ngDevMode`: duplicate kinds, duplicate entry ids, a non-`VflowFeature` argument, `provideVflow` twice in one
  injector (detected through a sentinel token).
- `<vflow>` works when no `provideVflow` is present; the core entry `core:node-extent` registers through the same
  registry with the reserved `core:` prefix.

## Acceptance

- Public-contract tests: a feature provided on the host component is seen by `<vflow>`; two features with the same
  precedence run in array order; `high` runs before `default` regardless of array order; a duplicate id errors in dev
  mode; a `<vflow>` without `provideVflow` behaves as before.
- `VflowFeature`, `vflowFeature`, `provideVflow`, `provideGeometryTransform` and the token are in the built
  `index.d.ts`; nothing new under `ɵ`.

## Out of scope

- Merging features across injector levels; a root-level defaults variant.
- Any token other than the two named here.

## Comments

- 2026-09-21: Implemented. New folder `libs/ngx-vflow/src/lib/vflow/features/` holds `VflowFeature` (private
  constructor, `declare private brand` for nominal typing, `@internal static create` stripped from the typings),
  `vflowFeature`, `provideVflow` with the `VFLOW_PROVIDE_MARKER` sentinel, the token with the `provideGeometryTransform` helper, and the entry types (`FeatureEntry`, `FeaturePrecedence`,
  `GeometryTransform` with the intent types of decision 7). `utils/resolve-feature-entries.ts` is the pure ordering
  step. `services/feature-registry.service.ts` is provided on `<vflow>`, creates class entries in a child injector
  (`Injector.create`, destroyed with the flow, so `inject(DestroyRef)` and the flow's services work inside an entry)
  and caches `transformsFor(kind, phase)`.
- The entry helper was first named `withGeometryTransform` and exported; renamed on review, because `withX()` reads
  as "returns a feature" and it returns providers for one entry. `VflowContext` is exported now as an empty abstract
  class because `GeometryTransform.transform` takes it; issue 02 fills it. The connection policy token, its helper
  and its types were removed with issue 05 (deferred, spec decision 15). `GestureSession.initial` is a `ReadonlyMap<string, Rect>` in
  parent space rather than the flow-space `NodeGeometry`, to match `GeometryChange.point`.
- Dev-mode checks use `typeof ngDevMode === 'undefined' || ngDevMode` per decision 19, where the rest of the library
  uses `isDevMode()`; both are fine, this one tree-shakes.
- Verified: 294 library tests green (8 new in `features/provide-vflow.spec.ts`, 3 in
  `utils/resolve-feature-entries.spec.ts`), ESLint and Prettier clean, `nx build ngx-vflow` succeeds and the built
  `index.d.ts` exports every symbol of the acceptance list with nothing new under `ɵ`.
