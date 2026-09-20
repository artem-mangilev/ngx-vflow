# Plugin / extension architectures in mature Angular libraries

> Scope note: every code block below was either read verbatim from a primary source (GitHub raw source, or the
> published `@angular/*` v20.3.30 packages installed in this repo under `node_modules/`) or is quoted from official
> docs. Where a claim could not be verified against a primary source it is moved to **Gaps**.

---

## Q1. Angular framework built-ins as extension models

### Takeaway

Angular itself ships four distinct extension mechanisms that library authors copy: (a) **multi-provider token arrays**
(`NG_VALIDATORS`, `HTTP_INTERCEPTORS`, `ENVIRONMENT_INITIALIZER`), (b) the **typed feature pattern**
`provideX(withA(), withB())` where each `withX()` returns an opaque `{ɵkind, ɵproviders}` record, (c) **`hostDirectives`**
for statically composing behavior onto a host element, and (d) **lightweight abstract-class tokens** so a host can
discover optional collaborators without a value-position reference. The feature pattern is the current idiom for
"optional, tree-shakable capability"; multi-providers remain the idiom for "N contributors to one hook".

### Cited Findings

**The `provideX(withFeature())` pattern — exact shape (Angular Router, v20.3.30)**

- `RouterFeature` is a _branded_ record, not a provider array; the brand is a `const enum` kind used only for dev-mode
  conflict detection. Verbatim from `node_modules/@angular/router/index.d.ts` (lines 345–353, 781, 785) and
  `node_modules/@angular/router/fesm2022/router_module.mjs` (lines 1007, 1030) — [angular/angular `packages/router/src/provide_router.ts`](https://github.com/angular/angular/blob/main/packages/router/src/provide_router.ts):

```ts
declare function provideRouter(routes: Routes, ...features: RouterFeatures[]): EnvironmentProviders;

interface RouterFeature<FeatureKind extends RouterFeatureKind> {
  ɵkind: FeatureKind;
  ɵproviders: Array<Provider | EnvironmentProviders>;
}

// The public union — this is what constrains the varargs:
type RouterFeatures = PreloadingFeature | DebugTracingFeature | InitialNavigationFeature | InMemoryScrollingFeature | RouterConfigurationFeature | NavigationErrorHandlerFeature | ComponentInputBindingFeature | ViewTransitionsFeature | RouterHashLocationFeature;

type ComponentInputBindingFeature = RouterFeature<RouterFeatureKind.ComponentInputBindingFeature>;

// runtime (fesm2022/router_module.mjs:1030)
function routerFeature(kind, providers) {
  return { ɵkind: kind, ɵproviders: providers };
}
```

- `provideRouter` simply flattens `feature.ɵproviders` into one `makeEnvironmentProviders(...)` call; features are _not_
  ordered or deduped by the router (verbatim, `fesm2022/router_module.mjs:1007`):

```ts
function provideRouter(routes, ...features) {
  return makeEnvironmentProviders([{ provide: ROUTES, multi: true, useValue: routes }, { provide: ActivatedRoute, useFactory: rootRoute, deps: [Router] }, { provide: APP_BOOTSTRAP_LISTENER, multi: true, useFactory: getBootstrapListener }, features.map((feature) => feature.ɵproviders)]);
}
```

- A feature is just a factory closing over options and returning providers (verbatim, `router_module.mjs:1470`):

```ts
function withComponentInputBinding() {
  const providers = [RoutedComponentInputBinder, { provide: INPUT_BINDER, useExisting: RoutedComponentInputBinder }];
  return routerFeature(8 /* RouterFeatureKind.ComponentInputBindingFeature */, providers);
}
```

- The same pattern, independently implemented, in `@angular/common/http` — `makeHttpFeature` is byte-for-byte the same
  idea (verbatim, `node_modules/@angular/common/fesm2022/module.mjs:2872`):

```ts
function makeHttpFeature(kind, providers) {
  return { ɵkind: kind, ɵproviders: providers };
}

declare function provideHttpClient(...features: HttpFeature<HttpFeatureKind>[]): EnvironmentProviders;
declare function withInterceptors(fns: HttpInterceptorFn[]): HttpFeature<HttpFeatureKind.Interceptors>;
declare function withFetch(): HttpFeature<HttpFeatureKind.Fetch>;
```

- **The `ɵkind` brand is used for mutual-exclusion validation in dev mode.** `provideHttpClient` builds a `Set` of kinds
  and throws on contradictory combinations (verbatim, `module.mjs:2907`):

```ts
function provideHttpClient(...features) {
  if (ngDevMode) {
    const featureKinds = new Set(features.map((f) => f.ɵkind));
    if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) && featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
      throw new Error(`Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() ...`);
    }
    if (featureKinds.has(HttpFeatureKind.RequestsMadeViaParent) && featureKinds.has(HttpFeatureKind.Fetch)) {
      throw new Error(`Configuration error: withRequestsMadeViaParent() cannot be combined with withFetch() ...`);
    }
  }
  const providers = [/* base providers */];
  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }
  return makeEnvironmentProviders(providers);
}
```

- Note the _typing difference_: Router constrains varargs to a **closed union** (`RouterFeatures[]`), while HttpClient
  accepts an **open generic** (`HttpFeature<HttpFeatureKind>[]`). The Router's closed union means a third party
  **cannot** author a `RouterFeature` that type-checks; HttpClient's is open but `HttpFeatureKind` is an exported enum,
  so a third party can technically construct one — [`@angular/common/http` public API](https://github.com/angular/angular/blob/main/packages/common/http/src/provider.ts).

**Multi-provider tokens**

- `NG_VALIDATORS` / `NG_ASYNC_VALIDATORS` / `NG_VALUE_ACCESSOR` are `InjectionToken<readonly ...[]>` consumed as arrays;
  the canonical registration is on the directive itself so it is scoped to the element
  (`node_modules/@angular/forms/index.d.ts:4918, 4950, 218`, docs example at line 4905) — [angular/angular `packages/forms/src/validators.ts`](https://github.com/angular/angular/blob/main/packages/forms/src/validators.ts):

```ts
declare const NG_VALIDATORS: InjectionToken<readonly (Function | Validator)[]>;
declare const NG_VALUE_ACCESSOR: InjectionToken<readonly ControlValueAccessor[]>;

@Directive({
  selector: '[customValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => CustomValidatorDirective), multi: true }],
})
class CustomValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    /* ... */
  }
  registerOnValidatorChange?(fn: () => void): void;
}
```

- `ENVIRONMENT_INITIALIZER` is **deprecated** in Angular 20 in favour of `provideEnvironmentInitializer()`; its
  functions are _not awaited_, unlike `APP_INITIALIZER` (`node_modules/@angular/core/index.d.ts:351, 371, 1814, 1819`):

```ts
declare const ENVIRONMENT_INITIALIZER: InjectionToken<readonly (() => void)[]>;
declare function provideEnvironmentInitializer(initializerFn: () => void): EnvironmentProviders;
// "Note: As opposed to the `APP_INITIALIZER` token, the `ENVIRONMENT_INITIALIZER` functions are not awaited"
```

- `APP_INITIALIZER` is likewise deprecated in favour of `provideAppInitializer()`, which accepts
  `() => Observable<unknown> | Promise<unknown> | void` (`@angular/core/index.d.ts:4328, 4342, 4367`).

- Angular's own docs describe multi-providers only at the level of "results collected into an array"; they do **not**
  document array ordering or parent/child merge semantics — [Defining dependency providers • Angular](https://angular.dev/guide/di/defining-dependency-providers).

**`hostDirectives` (directive composition API)**

- Host directives must be standalone ("Directives used in `hostDirectives` may not specify `standalone: false`"), their
  inputs/outputs are **hidden by default** and must be explicitly re-exported (with optional aliasing
  `inputs: ['menuId: id']`), Angular **ignores the directive's own `selector`** when applied this way, duplicates in the
  host-directive graph are de-duplicated to a single instance, and they are **static at compile time — no runtime
  addition** — [Directive composition API • Angular](https://angular.dev/guide/directives/directive-composition-api).
- Ordering: host directives instantiate and run their lifecycle hooks **before** the host component, and their host
  bindings apply first so the component can override them; this ordering extends transitively through nested
  `hostDirectives` — [Directive composition API • Angular](https://angular.dev/guide/directives/directive-composition-api).
- DI: host and host-directives can inject each other; when both declare the same token, the **host component's providers
  win** — [Directive composition API • Angular](https://angular.dev/guide/directives/directive-composition-api).

**Tokens, `providedIn`, `DestroyRef`, `afterRenderEffect`**

- `InjectionToken` with a `factory` "results in `providedIn: 'root'` by default (but can be overridden via the
  `providedIn` prop)" and is described by Angular as "Tree-shakeable — Only included if actually used" —
  [Defining dependency providers • Angular](https://angular.dev/guide/di/defining-dependency-providers). Constructor
  signature (`@angular/core` d.ts): `constructor(_desc: string, options?: {providedIn?: Type<any>|'root'|'platform'|'any'|null; factory: () => T})`.
- `DestroyRef.onDestroy(cb)` "Registers a destroy callback in a given lifecycle scope. Returns a cleanup function that
  can be invoked to unregister the callback" — verbatim doc comment in `@angular/core` type defs; API page:
  [DestroyRef • Angular](https://angular.dev/api/core/DestroyRef).
- `afterRenderEffect` has a **phase-spec overload** whose phases are chained by signal type — the write phase receives
  the earlyRead result, etc. (verbatim, `@angular/core/index.d.ts:2630`):

```ts
declare function afterRenderEffect<E = never, W = never, M = never>(
  spec: {
    earlyRead?: (onCleanup: EffectCleanupRegisterFn) => E;
    write?: (...args: [...ɵFirstAvailableSignal<[E]>, EffectCleanupRegisterFn]) => W;
    mixedReadWrite?: (...args: [...ɵFirstAvailableSignal<[W, E]>, EffectCleanupRegisterFn]) => M;
    read?: (...args: [...ɵFirstAvailableSignal<[M, W, E]>, EffectCleanupRegisterFn]) => void;
  },
  options?: AfterRenderOptions,
): AfterRenderRef;
```

Docs for the phases (`earlyRead` = read DOM before write, `write` = never read, `read` = after write) are in the same
doc comment; see [afterRenderEffect • Angular](https://angular.dev/api/core/afterRenderEffect).

**Community codification of the pattern**

- Manfred Steyer names six reusable patterns for standalone-API library design: _Provider Factory_ (returns
  `EnvironmentProviders` via `makeEnvironmentProviders`), _Feature_ (`{kind: FeatureKind, providers: Provider[]}`),
  _Configuration Provider Factory_ (uses `ENVIRONMENT_INITIALIZER` + a generated per-call `InjectionToken` to push
  config into an already-provided service from a nested scope), _NgModule Bridge_ (`forRoot` delegating to the provider
  factory), _Service Chain_ (`inject(Self, {optional: true, skipSelf: true})` to delegate to the parent-scope instance),
  and _Functional Service_ (token typed `Class | Fn`) —
  [Patterns for Custom Standalone APIs in Angular, ANGULARarchitects](https://www.angulararchitects.io/en/blog/patterns-for-custom-standalone-apis-in-angular/).
  The _Configuration Provider Factory_ snippet from that article is the closest published Angular-idiomatic "register a
  plugin into a central registry from a nested injector" recipe:

```ts
export function provideCategory(category: string, appender: Type<LogAppender>): EnvironmentProviders {
  const appenderToken = new InjectionToken<LogAppender>('APPENDER_' + category);
  return makeEnvironmentProviders([
    { provide: appenderToken, useClass: appender },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const appender = inject(appenderToken);
        const logger = inject(LoggerService);
        logger.categories[category] = appender; // self-registration into the host service
      },
    },
  ]);
}
```

- Angular's own library guidance: "If you register global service providers expose a `provideXYZ()` provider function";
  services should declare their own providers because "Declaring a provider makes that service _tree-shakable_"; for
  npm publication "use the partial-Ivy format as it is stable between patch versions" (`"compilationMode": "partial"`),
  and "Avoid compiling libraries with full-Ivy code ... the generated Ivy instructions are not part of Angular's public
  API" — [Creating libraries • Angular](https://angular.dev/tools/libraries/creating-libraries).

### Inferences

- The `{ɵkind, ɵproviders}` brand buys three things at once: (1) nominal typing so a bare `Provider[]` can't be passed
  where a feature is expected, (2) a cheap runtime discriminator for _conflict detection_ without reflection, and (3) a
  private field name (`ɵ`) that signals "do not construct this by hand". For ngx-vflow, the same trio maps directly onto
  "two layout plugins both claiming the viewport" style errors.
- The Router's **closed union** vs HttpClient's **open generic** is the single most important design fork: closed = the
  library owns the feature set and third parties extend via other seams; open = third parties can ship
  `withMyThing(): VflowFeature<VflowFeatureKind.Custom>`. ngx-vflow almost certainly wants the open form plus a
  `Custom`/`Plugin` kind reserved for third parties.
- `hostDirectives` being compile-time-static makes it unsuitable as _the_ plugin seam (a consumer cannot add a host
  directive to a library-owned node component without forking), but ideal as the mechanism a plugin uses to _compose_
  its own behavior onto a consumer-authored node component.
- `provideEnvironmentInitializer` + a per-call generated token is the deprecation-safe replacement for the old
  `ENVIRONMENT_INITIALIZER` self-registration recipe; notes written against Steyer's article should be transposed to
  `provideEnvironmentInitializer(() => { ... })`.

### Gaps

- Angular does not document (a) the **order** of values in a multi-provider array, or (b) whether a child injector's
  multi-providers merge with or shadow the parent's. Angular's general hierarchical-DI doc only states that a nearer
  provider "shadows" a farther one — [Hierarchical injectors • Angular](https://angular.dev/guide/di/hierarchical-dependency-injection).
  Strong _indirect_ evidence that they shadow (do not merge) is that Angular had to introduce a **second** token,
  `HTTP_ROOT_INTERCEPTOR_FNS`, and merge it manually — see Q7.
- No primary source found stating a hard limit on how many `withX()` features `provideX` can accept (this is a TS
  inference concern, not an Angular one; see NgRx in Q5).

---

## Q2. Angular CDK

### Takeaway

The CDK's dominant extensibility mechanism is **"child directive self-provides a token; parent injects it optionally /
skipSelf and keeps a registry"**, plus **strategy objects behind narrow interfaces** (overlay position/scroll), plus a
**single config token** (`CDK_DRAG_CONFIG`) whose values are overridable at any injector level. This is the closest
existing Angular-native analogue to a node/edge plugin registry.

### Cited Findings

**The self-provide + parent-registry pattern (drag-drop), verbatim from `@angular/cdk@20 fesm2022/drag-drop.mjs`**

```ts
const CDK_DROP_LIST_GROUP = new InjectionToken('CdkDropListGroup'); // :3966

class CdkDropListGroup {
  _items = new Set(); // :3975  the registry
  ngOnDestroy() {
    this._items.clear();
  }
  // @Directive({ selector: '[cdkDropListGroup]', exportAs: 'cdkDropListGroup',
  //   providers: [{ provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup }] })   :3989
}

class CdkDropList {
  _group = inject(CDK_DROP_LIST_GROUP, { optional: true, skipSelf: true }); // :4002
  // ... later: this._group._items.add(this)  (:4127) / this._group._items.delete(this) (:4172)
  // @Directive({ selector: '[cdkDropList]', providers: [
  //   { provide: CDK_DROP_LIST_GROUP, useValue: undefined },                    // :4297 — cut the chain
  //   { provide: CDK_DROP_LIST, useExisting: CdkDropList },                     // :4298
  // ]})
}
```

- Three separate tricks in that snippet, all directly reusable:
  1. **`useExisting` self-provide** so descendants can `inject()` the directive by token without importing the class.
  2. **`skipSelf: true`** on the child so it binds to an _ancestor_ group, never itself.
  3. **`{provide: CDK_DROP_LIST_GROUP, useValue: undefined}` on `CdkDropList`** — deliberately poisoning the token on the
     child so that a _nested_ drop list does not accidentally join its ancestor list's group.
     Source: [angular/components `src/cdk/drag-drop`](https://github.com/angular/components/tree/main/src/cdk/drag-drop).

- The same shape repeats for every drag sub-part: `CDK_DRAG_PARENT` (`providers: [{provide: CDK_DRAG_PARENT,
useExisting: CdkDrag}]` on `CdkDrag`), `CDK_DRAG_HANDLE` on `CdkDragHandle`, `CDK_DRAG_PREVIEW` on `CdkDragPreview`,
  `CDK_DRAG_PLACEHOLDER` on `CdkDragPlaceholder`. `CdkDragHandle` and `CdkDragPreview` then do
  `inject(CDK_DRAG_PARENT, {optional: true, skipSelf: true})` / `{optional: true}` respectively
  (`fesm2022/drag-drop.mjs:3368, 3390, 3428, 3891, 4383, 4422`).

**Config token with hierarchical override**

```ts
declare const CDK_DRAG_CONFIG: InjectionToken<DragDropConfig>; // cdk/drag-drop/index.d.ts:24
interface DragDropConfig extends Partial<DragRefConfig> {
  // :29
  lockAxis?: DragAxis | null;
  dragStartDelay?: DragStartDelay;
  constrainPosition?: DragConstrainPosition;
  previewClass?: string | string[];
  boundaryElement?: string;
  rootElementSelector?: string;
  draggingDisabled?: boolean;
  sortingDisabled?: boolean;
  listAutoScrollDisabled?: boolean;
  listOrientation?: DropListOrientation;
  zIndex?: number;
  previewContainer?: 'global' | 'parent';
}
```

Every one of these fields also exists as a per-element `@Input` on `CdkDrag` (`cdkDragConstrainPosition`,
`cdkDragStartDelay`, `cdkDragPreviewContainer`, `cdkDragScale`, …), i.e. **token = default, input = override** — verbatim
from the installed `@angular/cdk/drag-drop/index.d.ts` (lines 24–41, 773); docs:
[CDK drag-drop API • Angular Material](https://material.angular.dev/cdk/drag-drop/api).

- `constrainPosition` is a **pure function strategy** (`DragConstrainPosition`), not a subclass hook — it is the CDK's
  answer to "let the consumer change drag math without forking" (`index.d.ts:32, 690, 1140`).
- `DragDropRegistry` is exported as public API (`index.d.ts:1409` export list) — a singleton that tracks all active
  `DragRef`/`DropListRef` instances; `DragDrop`, `DragRef` and `DropListRef` are also exported, i.e. the CDK exposes the
  **imperative core beneath the directives** as a supported seam.

**Overlay: strategies as narrow injectable interfaces**

Verbatim from `@angular/cdk/overlay-module.d.d.ts` (lines 81–90, 224–233):

```ts
interface ScrollStrategy {
  enable: () => void; // called when the overlay is attached to a portal
  disable: () => void; // called when detached
  attach: (overlayRef: OverlayRef) => void;
  detach?: () => void;
}

interface PositionStrategy {
  attach(overlayRef: OverlayRef): void;
  apply(): void; // update the position of the overlay element
  detach?(): void;
  dispose(): void;
}

declare class OverlayConfig {
  positionStrategy?: PositionStrategy;
  scrollStrategy?: ScrollStrategy;
  /* ... */
}
```

Source: [angular/components `src/cdk/overlay`](https://github.com/angular/components/tree/main/src/cdk/overlay).
Four methods, zero Angular types in the contract beyond `OverlayRef` — a plugin can implement either without
depending on the DI graph, and they are handed in as plain objects through a config bag rather than through DI.

**a11y: fluent `with*` builders on a plain class**

`ListKeyManager<T extends ListKeyManagerOption>` uses a **third flavour of `with`** — chained mutator methods returning
`this`, not DI features (verbatim member list from `@angular/cdk/list-key-manager.d.d.ts:5, 17, 50–92`):

```ts
class ListKeyManager<T extends ListKeyManagerOption> {
  skipPredicate(predicate: (item: T) => boolean): this;
  withWrap(shouldWrap?: boolean): this;
  withVerticalOrientation(enabled?: boolean): this;
  withHorizontalOrientation(direction: 'ltr' | 'rtl' | null): this;
  withTypeAhead(debounceInterval?: number): this;
  withHomeAndEnd(enabled?: boolean): this;
  withPageUpDown(enabled?: boolean, delta?: number): this;
}
```

Source: [angular/components `src/cdk/a11y/key-manager`](https://github.com/angular/components/tree/main/src/cdk/a11y/key-manager).

**cdk-table: content-projected definition directives collected by the parent**

- `CdkTable` collects its column/row definitions through `ContentChildren` query lists and _also_ exposes an imperative
  registration API for programmatically-created defs (verbatim, `@angular/cdk/table/index.d.ts:460, 463, 646, 648, 673, 809`):

```ts
class CdkTable<T> {
  _contentColumnDefs: QueryList<CdkColumnDef>; // :646
  _contentRowDefs: QueryList<CdkRowDef<T>>; // :648
  addColumnDef(columnDef: CdkColumnDef): void; // :673  — escape hatch for dynamic/extension columns
  private _columnDefsByName; // :463  "Collection populated by the column definitions
  //        gathered by ContentChildren as well as any
  //        custom row definitions added to _customRowDefs"
}
declare const CDK_TABLE: InjectionToken<any>; // :886  — parent handle injected by children
```

- `CdkColumnDef` takes the name via `@Input('cdkColumnDef')`, implements `CanStick`, optionally injects `CDK_TABLE`
  (`_table?: any`) to ask the table for cell roles, and content-queries its own `CdkCellDef`/`CdkHeaderCellDef`/
  `CdkFooterCellDef` templates — [angular/components `src/cdk/table/cell.ts`](https://github.com/angular/components/blob/main/src/cdk/table/cell.ts)
  and installed `@angular/cdk/table/index.d.ts:66–78`. Note `CDK_TABLE` is typed `InjectionToken<any>` — the CDK
  deliberately keeps the parent handle **untyped** to break the circular type dependency.
- Other table seams: `STICKY_POSITIONING_LISTENER` and `TEXT_COLUMN_OPTIONS` tokens, and `CdkRecycleRows` — all in the
  public export list (`@angular/cdk/table/index.d.ts:900`).

### Inferences

- The CDK never uses "one giant plugin interface". Each seam is a **separate, tiny token** with the smallest possible
  contract (`ScrollStrategy` = 3 required methods). For ngx-vflow this argues for `VFLOW_NODE_BEHAVIOR`,
  `VFLOW_CONNECTION_VALIDATOR`, `VFLOW_LAYOUT` … rather than one `VflowPlugin` god-interface.
- `{provide: TOKEN, useValue: undefined}` as an explicit chain-breaker is an underused trick that matters for a nested
  graph (subflows / grouped nodes in ngx-vflow): without it, a nested `<vflow>` would silently register into the outer
  one.
- Because directive-level DI is per-element, the CDK pattern gives _free_ scoping: a plugin provided on `<vflow>` is
  global to that canvas; the same token provided on a node host is node-local. No registry bookkeeping needed.
- `CdkTable.addColumnDef()` shows the CDK's habit of pairing every declarative seam with an imperative one, which is
  what makes the pattern testable (a unit test registers defs without a template).

### Gaps

- I did not verify the **order** in which `QueryList`-collected defs are processed relative to programmatically added
  ones (`_customRowDefs`), only that both feed `_columnDefsByName`.

---

## Q3. Angular Material — default-options tokens, swappable strategies, implement-and-register contracts

### Takeaway

Material has **three** distinct seams: (1) `MAT_*_DEFAULT_OPTIONS` config tokens — note that Material _replaces_ rather
than _merges_ down the injector tree, unlike Taiga; (2) an abstract class as a DI-able contract that a consumer
implements and self-registers (`MatFormFieldControl`); (3) a swappable strategy with a **small abstract primitive
surface plus a large concrete derived surface** (`DateAdapter`).

### Cited Findings

**Two token shapes, and the difference matters**

- With a root factory (always resolvable) — [`src/material/tooltip/tooltip.ts`](https://github.com/angular/components/blob/main/src/material/tooltip/tooltip.ts):

```ts
export const MAT_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<MatTooltipDefaultOptions>('mat-tooltip-default-options', { providedIn: 'root', factory: () => ({ showDelay: 0, hideDelay: 0, touchendHideDelay: 1500 }) });
```

Same shape for [`MAT_CHECKBOX_DEFAULT_OPTIONS`](https://github.com/angular/components/blob/main/src/material/checkbox/checkbox-config.ts)
(`{color: 'accent', clickAction: 'check-indeterminate', disabledInteractive: false}`).

- Bare token, no factory — [`MAT_FORM_FIELD_DEFAULT_OPTIONS`](https://github.com/angular/components/blob/main/src/material/form-field/form-field.ts)
  and [`MAT_SORT_DEFAULT_OPTIONS`](https://github.com/angular/components/blob/main/src/material/sort/sort.ts) are
  `new InjectionToken<T>('NAME')` with no factory, hence always consumed as
  `inject<MatFormFieldDefaultOptions>(MAT_FORM_FIELD_DEFAULT_OPTIONS, {optional: true})` with per-field `??` fallbacks.
- `MatTooltipDefaultOptions` also carries `position`, `positionAtOrigin`, `touchGestures`, `tooltipClass`,
  `disableTooltipInteractivity`, `detectHoverCapability`, `touchLongPressShowDelay` — i.e. options tokens grow into
  _behavior_ config, not just styling — [`tooltip.ts`](https://github.com/angular/components/blob/main/src/material/tooltip/tooltip.ts).

**Deferred-strategy token: the token holds a factory, not an instance**

```ts
export const MAT_TOOLTIP_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('mat-tooltip-scroll-strategy', {
  providedIn: 'root',
  factory: () => {
    const injector = inject(Injector);
    return () => createRepositionScrollStrategy(injector, { scrollThrottle: SCROLL_THROTTLE_MS });
  },
});
// consumed lazily: scrollStrategy: this._injector.get(MAT_TOOLTIP_SCROLL_STRATEGY)()
```

Source: [`src/material/tooltip/tooltip.ts`](https://github.com/angular/components/blob/main/src/material/tooltip/tooltip.ts).
The indirection exists because each overlay needs its **own stateful strategy instance**.

**`MatFormFieldControl<T>` — implement-and-self-register**

Full member list from [`src/material/form-field/form-field-control.ts`](https://github.com/angular/components/blob/main/src/material/form-field/form-field-control.ts):
`value: T | null`, `stateChanges: Observable<void>`, `id: string`, `placeholder: string`,
`ngControl: NgControl | AbstractControlDirective | null`, `focused: boolean`, `empty: boolean`,
`shouldLabelFloat: boolean`, `required: boolean`, `disabled: boolean`, `errorState: boolean`, `controlType?: string`,
`autofilled?: boolean`, `userAriaDescribedBy?: string`, `disableAutomaticLabeling?: boolean`, `describedByIds?: string[]`,
plus abstract `setDescribedByIds(ids: string[]): void` and `onContainerClick(event: MouseEvent): void`.

```ts
@Component({ providers: [{ provide: MatFormFieldControl, useExisting: MyTelInput }] })
export class MyTelInput implements MatFormFieldControl<MyTel> {
  /* ... */
}
```

Source: [`guides/creating-a-custom-form-field-control.md`](https://github.com/angular/components/blob/main/guides/creating-a-custom-form-field-control.md).
It is an **abstract class, not an interface**, precisely so it can be a DI token; `stateChanges: Observable<void>` is
the pre-signals change-notification channel the parent subscribes to.

**`DateAdapter<D, L = any>` — small abstract surface, large concrete surface**

- ~22 abstract methods (`getYear`, `getMonth`, `getDate`, `getDayOfWeek`, `getMonthNames(style)`, `getDateNames`,
  `getDayOfWeekNames(style)`, `getYearName`, `getFirstDayOfWeek`, `getNumDaysInMonth`, `clone`, `createDate`, `today`,
  `parse`, `format`, `addCalendarYears`, `addCalendarMonths`, `addCalendarDays`, `toIso8601`, `isDateInstance`,
  `isValid`, `invalid`) plus ~14 **concrete** methods implemented in terms of them (`compareDate`, `sameDate`,
  `clampDate`, `deserialize`, `getValidDateOrNull`, `addSeconds`, `setLocale`, `parseTime`, `compareTime`, `sameTime`,
  `getHours/Minutes/Seconds`, `setTime`) —
  [`src/material/core/datetime/date-adapter.ts`](https://github.com/angular/components/blob/main/src/material/core/datetime/date-adapter.ts).
- Behavior is separated from config: `DateAdapter` (strategy) vs
  [`MAT_DATE_FORMATS`](https://github.com/angular/components/blob/main/src/material/core/datetime/date-formats.ts)
  (`new InjectionToken<MatDateFormats>('mat-date-formats')`, no factory → must be provided) vs `MAT_DATE_LOCALE`
  (`{providedIn: 'root', factory: () => inject(LOCALE_ID)}` — delegates to an existing framework token rather than
  inventing a default).
- The provider function ships the triple together and returns **`Provider[]`, not `EnvironmentProviders`** —
  deliberately, so it also works in a component's `providers` array
  ([`src/material-moment-adapter/adapter/index.ts`](https://github.com/angular/components/blob/main/src/material-moment-adapter/adapter/index.ts)):

```ts
export function provideNativeDateAdapter(formats: MatDateFormats = MAT_NATIVE_DATE_FORMATS): Provider[] {
  return [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: formats },
  ];
}
export function provideMomentDateAdapter(formats: MatDateFormats = MAT_MOMENT_DATE_FORMATS, options?: MatMomentDateAdapterOptions): Provider[] {
  /* conditionally pushes MAT_MOMENT_DATE_ADAPTER_OPTIONS */
}
```

`makeEnvironmentProviders` is the explicit opt-_out_: it "wraps an array of `Provider`s into `EnvironmentProviders`,
preventing them from being accidentally referenced in `@Component`" —
[makeEnvironmentProviders • Angular](https://angular.dev/api/core/makeEnvironmentProviders).

- Legacy NgModules are kept as zero-cost wrappers: `@NgModule({providers: [provideMomentDateAdapter()]}) export class MatMomentDateModule {}`.
- `MatSortable` is a plain **interface** (`{id: string; start: SortDirection; disableClear: boolean}`), not a DI token —
  [`src/material/sort/sort.ts`](https://github.com/angular/components/blob/main/src/material/sort/sort.ts).

**CDK Overlay strategy details supplementing Q2**

- `ScrollStrategy` uses **property-arrow syntax**, so implementations can be plain object literals, not classes;
  `PositionStrategy` on `main` also has an optional `getPopoverInsertionPoint?()` —
  [`scroll-strategy.ts`](https://github.com/angular/components/blob/main/src/cdk/overlay/scroll/scroll-strategy.ts),
  [`position-strategy.ts`](https://github.com/angular/components/blob/main/src/cdk/overlay/position/position-strategy.ts).
- `getMatScrollStrategyAlreadyAttachedError()` is an exported error factory guarding double-attach.
- Strategies are produced by **factories, not injected as singletons**:
  [`OverlayPositionBuilder`](https://github.com/angular/components/blob/main/src/cdk/overlay/position/overlay-position-builder.ts)
  holds only an `Injector` and returns fresh instances (`global()`, `flexibleConnectedTo(origin)`), and
  [`ScrollStrategyOptions`](https://github.com/angular/components/blob/main/src/cdk/overlay/scroll/scroll-strategy-options.ts)
  exposes `noop`, `close(config?)`, `block()`, `reposition(config?)` as **arrow-function properties** (pre-bound `this`,
  safe to destructure). Trend on `main`: `create*Strategy(injector, config)` standalone functions — strategies are
  constructed _from_ an `Injector` argument rather than by DI of the class.
- `OverlayConfig` defaults `scrollStrategy` to `new NoopScrollStrategy()` — **a no-op object, never `null`**, so
  consumers never branch on absence ([`overlay-config.ts`](https://github.com/angular/components/blob/main/src/cdk/overlay/overlay-config.ts)).
- `CDK_DRAG_PARENT` is `new InjectionToken<CdkDrag>('CDK_DRAG_PARENT')`, documented as "Used primarily to avoid
  circular imports" and marked `@docs-private` —
  [`src/cdk/drag-drop/drag-parent.ts`](https://github.com/angular/components/blob/main/src/cdk/drag-drop/drag-parent.ts).
- `constrainPosition`'s exact type leaks the internal `DragRef` into the public callback —
  [`src/cdk/drag-drop/drag-drop.ts`](https://github.com/angular/components/blob/main/src/cdk/drag-drop/drag-ref.ts):

```ts
export type DragConstrainPosition = (userPointerPosition: Point, dragRef: DragRef, dimensions: DOMRect, pickupPositionInElement: Point) => Point;
```

- `DragDropRegistry` API: `registerDropContainer`/`removeDropContainer`, `registerDragItem`/`removeDragItem`,
  `registerDirectiveNode`/`removeDirectiveNode`/`getDragDirectiveForNode`, `startDragging`/`stopDragging`/`isDragging`,
  `scrolled()`, plus `pointerMove`/`pointerUp` observables; it binds global document listeners **only while a drag is
  active** —
  [`src/cdk/drag-drop/drag-drop-registry.ts`](https://github.com/angular/components/blob/main/src/cdk/drag-drop/drag-drop-registry.ts).

### Inferences

- Material's `{optional: true}` + per-field `??` costs verbosity but **preserves "not set" vs "set to the default"**.
  Taiga's merge (below) is more composable but loses that distinction unless the injection site keeps `Partial<T>`.
- `stateChanges: Observable<void>` is exactly the member ngx-vflow should _not_ copy: a signals-era equivalent exposes
  reactive `Signal` members directly, removing subscription lifecycle and working natively with zoneless + OnPush.
- `DateAdapter`'s abstract/concrete split is the single best template for a `VflowLayout`/`VflowNodeAdapter` base class:
  plugin authors implement a handful of primitives; all shared algorithmic behavior is inherited and stays consistent.
- `Provider[]` vs `EnvironmentProviders` is a **deliberate API decision**, not a style choice: `Provider[]` = plugin can
  be scoped to one `<vflow>`; `EnvironmentProviders` = app-wide only.

### Gaps

- One fetched Overlay source showed services decorated `@Service()` rather than `@Injectable({providedIn: 'root'})`.
  That would be a very recent addition on `main`; **treat the decorator name as unverified** and check against the
  Angular version ngx-vflow targets.

---

## Q4. ag-grid — global module registry + component-by-reference

### Takeaway

ag-grid v33 replaced ~25 scoped npm packages with a **runtime module registry** (`ModuleRegistry.registerModules([...])`)
over two packages. It is the clearest example of the _registry_ archetype: maximum flexibility, weak type safety
(missing module = runtime error), global mutable state that is awkward for tests and SSR, and a per-grid `[modules]`
input added as the safer alternative.

### Cited Findings

- v33 collapsed ~25 scoped packages into `ag-grid-community` + `ag-grid-enterprise` (plus the `ag-grid-angular`
  wrapper); modules are now **objects you register**, not packages you install —
  [ag-grid modules docs](https://www.ag-grid.com/angular-data-grid/modules/),
  [upgrading to v33](https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-33/):

```ts
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]); // global, before any grid
// fine-grained: [ClientSideRowModelModule, PaginationModule, RowSelectionModule, TextEditorModule]
// enterprise + charts: ModuleRegistry.registerModules([AllEnterpriseModule.with(AgChartsEnterpriseModule)])
// per-grid override: <ag-grid-angular [modules]="modules"/>   with  modules: Module[]
```

- Introspection and dev-time validation: `api.isModuleRegistered('SetFilterModule')` and `enableDevValidations()`
  (to be guarded behind `NODE_ENV !== 'production'`); `ModuleRegistry.register(module)` (singular) is deprecated —
  [modules docs](https://www.ag-grid.com/angular-data-grid/modules/).
- Enterprise gating is a **separate singleton**, not a module: `LicenseManager.setLicenseKey()` before grid init —
  [v33 upgrade](https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-33/).
- Claimed tree-shaking payoff: "reducing the size of your grids by up to 40%" (20–40% depending on features; CSS also
  split per module) — [What's new in AG Grid 33](https://blog.ag-grid.com/whats-new-in-ag-grid-33/). The earlier
  module-vs-package measurement was 300 kB vs 520 kB compressed (43%) —
  [minimising bundle size](https://www.ag-grid.com/blog/minimising-bundle-size/).
- Module granularity is versioned aggressively: `MenuModule` → `ColumnMenuModule` + `ContextMenuModule`,
  `RangeSelectionModule` → `CellSelectionModule`, `RowGroupingModule` → five modules, `GridChartsModule` →
  `IntegratedChartsModule` — [v33 upgrade](https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-33/).
- Angular-specific wrapper contract — [custom cell renderer docs](https://www.ag-grid.com/angular-data-grid/component-cell-renderer/):

```ts
interface ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void;
  refresh(params: ICellRendererParams): boolean; // true = handled; false = grid destroys + recreates
}
// colDef: { field: 'sport', cellRenderer: MyRendererComponent }   // direct class reference (recommended)
// colDef: { field: 'age',   cellRenderer: 'agGroupCellRenderer' } // string name → registry lookup
```

- `frameworkComponents` and the `*Framework` suffixes (`cellRendererFramework`, `detailCellRendererFramework`,
  `loadingOverlayComponentFramework`) were deprecated in v27 and removed by v30 in favour of `components` / plain
  `cellRenderer` — [v27 upgrade](https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-27/),
  [v30 upgrade](https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-30/).

### Inferences

- The global mutable singleton is order-dependent at init, leaks between test specs, and is shared across SSR requests
  (harmless here because it is config-only, but a per-instance `[modules]` input is the safer seam — and ag-grid added
  exactly that).
- **String-name lookup defeats both tree-shaking and type checking**; direct class reference is strictly better, which
  is what ag-grid now pushes. Same conclusion applies to ngx-graph's string layout registry (below).
- Maintaining _two_ registration paths (global + per-grid) is real API-surface cost; ngx-vflow should pick the scoped
  one first and only add a global convenience if demanded.

### Gaps

- `gridApi.addEventListener`/`removeEventListener` exact signatures were not confirmed from source.

---

## Q5. NgRx — `signalStoreFeature`, `META_REDUCERS`, `provideState`/`provideEffects`

### Takeaway

`signalStoreFeature` is the closest existing precedent for typed, composable, signals-native plugins: a feature is just
`(store) => store` whose _phantom_ `Input`/`Output` generics carry only the **delta** it adds, with accumulation spelled
out by hand in per-arity overloads. It buys near-perfect type inference at the cost of ~1400 lines of overloads, a hard
arity cap (10 for `signalStoreFeature`, 15 for `signalStore`), and a documented inference bug. NgRx Store's
`META_REDUCERS` is the contrasting onion/middleware model with library-before-user ordering.

### Cited Findings

**Core type vocabulary** — [`modules/signals/src/signal-store-models.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store-models.ts):

```ts
export type SignalStoreFeatureResult = { state: object; props: object; methods: MethodsDictionary };
export type EmptyFeatureResult = { state: {}; props: {}; methods: {} };

export type InnerSignalStore<State extends object = object, Props extends object = object, Methods extends MethodsDictionary = MethodsDictionary> = {
  stateSignals: StateSignals<State>;
  props: Props;
  methods: Methods;
  hooks: SignalStoreHooks; // { onInit?(): void; onDestroy?(): void }
} & WritableStateSource<State>;

export type SignalStoreFeature<Input extends SignalStoreFeatureResult = SignalStoreFeatureResult, Output extends SignalStoreFeatureResult = SignalStoreFeatureResult> = (store: InnerSignalStore<Input['state'], Input['props'], Input['methods']>) => InnerSignalStore<Output['state'], Output['props'], Output['methods']>;
```

- **`Output` is only the delta, not the accumulation.** `withState({count: 0})` returns
  `SignalStoreFeature<EmptyFeatureResult, {state: {count: number}; props: {}; methods: {}}>` —
  [`with-state.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/with-state.ts).
- Each `with*` receives a **flattened** view of everything accumulated so far, which is why destructuring works —
  [`with-methods.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/with-methods.ts):

```ts
export function withMethods<Input extends SignalStoreFeatureResult, Methods extends MethodsDictionary>(
  methodsFactory: (store: Prettify<StateSignals<Input['state']> & Input['props'] & Input['methods']
                                    & WritableStateSource<Input['state']>>) => Methods
): SignalStoreFeature<Input, { state: {}; props: {}; methods: Methods }> {
  return (store) => {
    const methods = methodsFactory({
      [STATE_SOURCE]: store[STATE_SOURCE], ...store.stateSignals, ...store.props, ...store.methods,
    });
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      assertUniqueStoreMembers(store, Reflect.ownKeys(methods));   // dev-only collision check
    }
    return { ...store, methods: { ...store.methods, ...methods } } as ...;
  };
}
```

- `withComputed` is implemented **on top of** `withProps`, mapping `() => T` to `computed(...)` and passing `isSignal`
  values through — [`with-computed.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/with-computed.ts).
  (Naming history: the third bucket was `signals` pre-v19, is `props` now.)

**The accumulation is hand-written per arity** — [`signal-store-feature.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store-feature.ts):

```ts
type PrettifyFeatureResult<Result extends SignalStoreFeatureResult> = Prettify<{
  state: Prettify<Result['state']>;
  props: Prettify<Result['props']>;
  methods: Prettify<Result['methods']>;
}>;

export function signalStoreFeature<F1, F2, F3 /* … extends SignalStoreFeatureResult */>(
  f1: SignalStoreFeature<EmptyFeatureResult, F1>,
  f2: SignalStoreFeature<{} & F1, F2>, // `{} & F1` defers inference so f1 resolves first
  f3: SignalStoreFeature<F1 & F2, F3>,
): SignalStoreFeature<EmptyFeatureResult, PrettifyFeatureResult<F1 & F2 & F3>>;

// runtime: a trivial left fold — all cost is compile-time
export function signalStoreFeature(...args) {
  const features = (typeof args[0] === 'function' ? args : args.slice(1)) as SignalStoreFeature[];
  return (inputStore) => features.reduce((store, feature) => feature(store), inputStore);
}

export function type<T>(): T {
  return undefined as T;
} // phantom value, erased at runtime
```

- The **input-requiring** overload family wraps the declared input in `NoInfer<>` at every downstream position so it is
  never widened by later features:

```ts
export function signalStoreFeature<Input extends Partial<SignalStoreFeatureResult>, F1, F2, F3>(input: Input, f1: SignalStoreFeature<EmptyFeatureResult & NoInfer<Input>, F1>, f2: SignalStoreFeature<NoInfer<Input> & F1, F2>, f3: SignalStoreFeature<NoInfer<Input> & F1 & F2, F3>): SignalStoreFeature<Prettify<EmptyFeatureResult & Input>, PrettifyFeatureResult<F1 & F2 & F3>>;
```

Usage — [ngrx.io custom store features](https://ngrx.io/guide/signals/signal-store/custom-store-features):

```ts
export function withSelectedEntity<Entity>() {
  return signalStoreFeature(
    { state: type<EntityState<Entity>>() }, // declares a *requirement*
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const id = selectedEntityId();
        return id ? entityMap()[id] : null;
      }),
    })),
  );
}
```

- **`withFeature` is the escape hatch** for _runtime_ rather than _structural_ input — pass real store members into a
  feature factory, avoiding structural coupling entirely
  ([`with-feature.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/with-feature.ts)):

```ts
export function withFeature<Input extends SignalStoreFeatureResult, Output extends SignalStoreFeatureResult>(featureFactory: (store: Prettify<StateSignals<Input['state']> & Input['props'] & Input['methods'] & WritableStateSource<Input['state']>>) => SignalStoreFeature<Input, Output>): SignalStoreFeature<Input, Output> {
  return (store) =>
    featureFactory({
      [STATE_SOURCE]: store[STATE_SOURCE],
      ...store.stateSignals,
      ...store.props,
      ...store.methods,
    })(store);
}
// signalStore(withEntities<Book>(), withFeature(({ entities }) => withBooksFilter(entities)))
```

`withFeature` shipped in `@ngrx/signals` **19.1** as the successor to ngrx-toolkit's now-deprecated
`withFeatureFactory()` — [NgRx Toolkit docs](https://ngrx-toolkit.angulararchitects.io/docs/with-feature-factory).

**Verified arity limits**

- `signalStoreFeature` caps at **10** features: 10 no-input overloads + 10 input overloads + 1 implementation = 21
  declarations — [`signal-store-feature.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store-feature.ts).
- `signalStore` caps at **15** features, and the overload list is _tripled_ for config variants (no-config,
  `ProvidedInConfig & {protectedState?: true}`, `ProvidedInConfig & {protectedState: false}`) = 46 declarations, ~1432
  lines for one function — [`signal-store.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store.ts).
- **Documented TS bug**: two input-requiring features with no generic parameters cannot be combined; the official
  workaround is an unused generic parameter — [ngrx.io](https://ngrx.io/guide/signals/signal-store/custom-store-features):

```ts
function withZ() {
  return signalStoreFeature({ state: type<{ x: number }>() }, withState({ z: 10 }));
}
function withW() {
  return signalStoreFeature({ state: type<{ y: number }>() }, withState({ w: 100 }));
}
signalStore(withState({ x: 10, y: 100 }), withZ(), withW()); // ❌ compilation error

function withZ<_>() {
  /* same body */
} // 👈 unused generic
function withW<_>() {
  /* same body */
}
signalStore(withState({ x: 10, y: 100 }), withZ(), withW()); // ✅
```

**Other mechanics worth copying**

- **Privacy by naming convention, enforced in the type system**:
  `OmitPrivate<T> = { [K in keyof T as K extends \`_${string}\` ? never : K]: T[K] }`, applied only at the `signalStore`boundary — features see each other's`_`-prefixed members, consumers don't —
[`ts-helpers.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/ts-helpers.ts),
  [private store members](https://github.com/ngrx/platform/blob/main/projects/www/src/app/pages/guide/signals/signal-store/private-store-members.md).
- **Hooks chain rather than replace**: `withHooks` does `mergeHooks(store.hooks.onInit, hooks.onInit)` so every
  feature's `onInit` runs in registration order; `onDestroy` is wired via `inject(DestroyRef).onDestroy(...)` in the
  generated class constructor — [`with-hooks.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/with-hooks.ts).
- The store is a generated `@Injectable` class whose constructor folds features and copies members onto `this`, so
  `inject()` works inside any feature factory —
  [`signal-store.ts`](https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store.ts):

```ts
@Injectable({ providedIn: config.providedIn || null })
class SignalStore {
  constructor() {
    const innerStore = features.reduce((store, feature) => feature(store), getInitialInnerStore());
    const { stateSignals, props, methods, hooks } = innerStore;
    const storeMembers = { ...stateSignals, ...props, ...methods };
    (this as any)[STATE_SOURCE] = innerStore[STATE_SOURCE];
    for (const key of Reflect.ownKeys(storeMembers)) (this as any)[key] = storeMembers[key];
    if (hooks.onInit) hooks.onInit();
    if (hooks.onDestroy) inject(DestroyRef).onDestroy(hooks.onDestroy);
  }
}
```

- Docs explicitly recommend **standalone updater functions over feature methods** for tree-shaking + testability
  (`setPending()` instead of `store.setPending()`) — [ngrx.io](https://ngrx.io/guide/signals/signal-store/custom-store-features).

**NgRx Store: `META_REDUCERS` and the onion model**

Tokens, verbatim from [`modules/store/src/tokens.ts`](https://github.com/ngrx/platform/blob/main/modules/store/src/tokens.ts):

```ts
export const USER_PROVIDED_META_REDUCERS = new InjectionToken<MetaReducer[]>('@ngrx/store User Provided Meta Reducers');
export const META_REDUCERS = new InjectionToken<MetaReducer[]>('@ngrx/store Meta Reducers');
export const _RESOLVED_META_REDUCERS = new InjectionToken<MetaReducer>('@ngrx/store Internal Resolved Meta Reducers');
export const ROOT_STORE_PROVIDER = new InjectionToken<void>('@ngrx/store Root Store Provider');
export const FEATURE_STATE_PROVIDER = new InjectionToken<void>('@ngrx/store Feature State Provider');
```

`ROOT_STORE_PROVIDER` / `FEATURE_STATE_PROVIDER` are **void tokens used purely as ordering hooks** — injecting them
guarantees root/feature state is initialized first.

- Ordering is two-stage. First, multi-token (library-author) contributions are concatenated **before** user config —
  [`store_config.ts`](https://github.com/ngrx/platform/blob/main/modules/store/src/store_config.ts),
  [`provide_store.ts`](https://github.com/ngrx/platform/blob/main/modules/store/src/provide_store.ts):

```ts
export function _concatMetaReducers(metaReducers: MetaReducer[], userProvidedMetaReducers: MetaReducer[]) {
  return metaReducers.concat(userProvidedMetaReducers);
}
// { provide: _RESOLVED_META_REDUCERS, deps: [META_REDUCERS, USER_PROVIDED_META_REDUCERS],
//   useFactory: _concatMetaReducers },
// { provide: REDUCER_FACTORY, deps: [_REDUCER_FACTORY, _RESOLVED_META_REDUCERS], useFactory: createReducerFactory },
```

- Then composition — [`utils.ts`](https://github.com/ngrx/platform/blob/main/modules/store/src/utils.ts):

```ts
export function compose(...functions: any[]) {
  return function (arg: any) {
    if (functions.length === 0) return arg;
    const last = functions[functions.length - 1];
    const rest = functions.slice(0, -1);
    return rest.reduceRight((composed, fn) => fn(composed), last(arg));
  };
}
```

**Net semantics:** with `[m1, m2, m3]` the composed reducer is `m1(m2(m3(base)))` — the _first_ meta-reducer is
outermost, sees the action first and the others' results last.

- `createFeature` derives selectors with template-literal mapped types, and uses
  `string extends keyof ExtraSelectors ? Feature<...> : Omit<Feature<...>, keyof ExtraSelectors> & ExtraSelectors` —
  a reusable idiom for "detect an un-inferred open record and fall back", with `Omit` letting user selectors
  deterministically override generated ones —
  [`feature_creator.ts`](https://github.com/ngrx/platform/blob/main/modules/store/src/feature_creator.ts).
- `provideEffects` accepts varargs _or_ an array (`effects.flat()`) and uses `provideEnvironmentInitializer` to inject
  the ordering tokens before starting —
  [`provide_effects.ts`](https://github.com/ngrx/platform/blob/main/modules/effects/src/provide_effects.ts):

```ts
return makeEnvironmentProviders([
  effectsClasses,
  provideEnvironmentInitializer(() => {
    inject(ROOT_STORE_PROVIDER);
    inject(FEATURE_STATE_PROVIDER, { optional: true });
    const effectsRunner = inject(EffectsRunner);
    const effectSources = inject(EffectSources);
    if (!effectsRunner.isStarted) effectsRunner.start();
    /* ... */
  }),
]);
```

- `provideState` returns `EnvironmentProviders` and is documented as **not usable at the component level**, intended for
  lazy `Route.providers`.

**Design write-ups**

- Rainer Hahnekamp recommends **declaring the public feature type in an overload signature and typing the
  implementation as bare `SignalStoreFeature`**, because "the required helper types are not part of the Signal Store's
  public API"; he shows configurable member names via mapped + template-literal types
  (`type NamedCallState<Prop extends string> = { [K in Prop as \`${K}CallState\`]: CallState }`) paired with a runtime
  key-builder that must be kept in sync by hand, and states that explicitly defining the _internal_ view "is a bit
  annoying and currently not really possible" —
  [NgRx Signal Store Deep Dive: Flexible and Type-Safe Custom Extensions](https://www.angulararchitects.io/en/blog/ngrx-signal-store-deep-dive-flexible-and-type-safe-custom-extensions/);
  applied companion piece:
  [Smarter, Not Harder](https://www.angulararchitects.io/en/blog/smarter-not-harder-simplifying-your-application-with-ngrx-signal-store-and-custom-features/).
- Original design rationale lives in the [SignalStore RFC discussion #3796](https://github.com/ngrx/platform/discussions/3796)
  by Marko Stanimirović (not fetched in full — see Gaps).

### Inferences

- The `Input`/`Output`-delta design is _the_ transferable idea: a ngx-vflow plugin should declare only what it adds
  (`{state, props, methods}` → e.g. `{viewportProps, nodeBehaviors, commands}`), and accumulation should live in the
  variadic `provideVflow(...)`/`withPlugins(...)` overloads.
- **Cap arity deliberately.** If ngx-vflow wants both a config object _and_ variadic plugins, expect NgRx's 3×
  overload multiplication; designing config as a plugin itself (`withConfig({...})`) avoids it entirely.
- Dev-only collision assertions + `_`-prefix privacy are two cheap NgRx ideas that give plugin authors an internal
  namespace with zero production cost.
- NgRx exhibits the **ordering-vs-typing tradeoff** starkly: `signalStoreFeature` has perfect type accumulation and no
  priority control (purely positional left-fold, a feature sees only what came before it); `META_REDUCERS` has explicit
  onion ordering and essentially no type safety (`MetaReducer[]`, untyped w.r.t. state shape).

### Gaps

- Did not fetch RFC #3796 in full, so no direct quotes from the original design rationale.
- **No post by Chau Tran or Enea Jahollari specifically about `signalStoreFeature` / composable feature API design was
  found.** Treat as "not found", not "does not exist".

---

## Q6. Other libraries — Taiga UI, TanStack Table, ngx-formly

_(ag-grid, ngx-graph, angular-three, spartan-ng, PrimeNG, ng-zorro, FullCalendar, gridster2 and ngx-datatable are
covered in the final section below.)_

### Takeaway

Taiga UI contributes the best **hierarchical options-merge** primitive (~15 lines, `skipSelf` re-provision);
TanStack Table contributes the best **keyed-feature-map + declaration-merged extension point** and a signals adapter
that keeps the core framework-agnostic; ngx-formly contributes the only **explicit numeric-priority, multi-phase
lifecycle** registry among them — at the cost of zero compile-time type safety.

### Cited Findings

**Taiga UI — `tuiCreateOptions` / `tuiProvideOptions`**

```ts
// projects/cdk/utils/di/create-options.ts
export function tuiCreateOptions<T>(defaults: T): [token: InjectionToken<T>, provider: (item: Partial<T> | (() => Partial<T>)) => FactoryProvider] {
  const token = new InjectionToken(ngDevMode ? 'Options token' : '', { factory: () => defaults });
  return [token, (options) => tuiProvideOptions(token, options, defaults)];
}
```

Source: [taiga-ui `create-options.ts`](https://github.com/taiga-family/taiga-ui/blob/main/projects/cdk/utils/di/create-options.ts).
The tuple is destructured at the declaration site — that is where the `tuiXxxOptionsProvider` names come from
([`button.options.ts`](https://github.com/taiga-family/taiga-ui/blob/main/projects/core/components/button/button.options.ts)):

```ts
export const TUI_BUTTON_DEFAULT_OPTIONS: TuiButtonOptions = { appearance: 'primary', size: 'l' };
export const [TUI_BUTTON_OPTIONS, tuiButtonOptionsProvider] = tuiCreateOptions(TUI_BUTTON_DEFAULT_OPTIONS);
```

Note `ngDevMode ? 'Options token' : ''` — **token debug names are stripped in prod builds**.

- The inheritance trick is `skipSelf` re-provision of the _same_ token
  ([`provide-options.ts`](https://github.com/taiga-family/taiga-ui/blob/main/projects/cdk/utils/di/provide-options.ts)):

```ts
export function tuiProvideOptions<T>(provide: InjectionToken<T>, options: Partial<T> | (() => Partial<T>), fallback: T): FactoryProvider {
  return {
    provide,
    useFactory: (): T =>
      tuiOverride(
        inject(provide, { optional: true, skipSelf: true }) || fallback, // parent value first
        inject(options as unknown as InjectionToken<T>, { optional: true }) || // then own partial
          (typeof options === 'function' ? options() : options),
      ),
  };
}
```

Module-level → component-level → directive-level overrides compose automatically, and a component `inject`s the token
exactly once. `options` is double-purposed (cast to a token and injected optionally), so the generated provider
accepts a literal partial, a factory fn, **or a token**.

- Merge semantics via [`tuiOverride`](https://github.com/taiga-family/taiga-ui/blob/main/projects/cdk/utils/miscellaneous/override.ts):
  a shallow spread that **ignores explicit `undefined`** — important because `input()` signals default to `undefined`.
- Second, distinct pattern: **token aliasing for cross-cutting concerns**
  ([`appearance.options.ts`](https://github.com/taiga-family/taiga-ui/blob/main/projects/core/directives/appearance/appearance.options.ts)):

```ts
export function tuiAppearanceOptionsProvider(token: ProviderToken<TuiAppearanceOptions>): ExistingProvider {
  return tuiProvide(TUI_APPEARANCE_OPTIONS, token);
}
```

with [`tuiProvide`](https://github.com/taiga-family/taiga-ui/blob/main/projects/cdk/utils/di/provide.ts) a typed
`{provide, useExisting, multi}` wrapper (its 3-arg overload widens to `ProviderToken<T | T[]>` for multi). This lets
the superset `TUI_BUTTON_OPTIONS` _satisfy_ `TUI_APPEARANCE_OPTIONS` for a generic directive — **structural
subtyping through DI**.

- Directive-heavy composition; the whole `TuiButton` body is four lines:

```ts
@Directive({
  selector: 'a[tuiButton],button[tuiButton],label[tuiButton],a[tuiIconButton],...',
  providers: [tuiAppearanceOptionsProvider(TUI_BUTTON_OPTIONS)],
  hostDirectives: [TuiWithAppearance, TuiWithIcons],
  host: { '[attr.data-size]': 'size()' },
})
export class TuiButton {
  protected readonly nothing = tuiWithStyles(Styles);
  public readonly size = input(inject(TUI_BUTTON_OPTIONS).size); // DI default → signal input initial value
}
```

`tuiWithStyles(Styles)` injects styles via a zero-template companion `@Component` with `ViewEncapsulation.None`,
gated on `data-tui-version` so multiple Taiga versions coexist; `TUI_VERSION` is also used as `exportAs`.

- **`tuiCreateToken` is being removed**: Taiga's [v5 migration issue #11917](https://github.com/taiga-family/taiga-ui/issues/11917)
  lists migrating `tuiCreateToken` / `tuiCreateTokenFromFactory` to plain `InjectionToken`; it no longer exists in
  `projects/cdk/utils/miscellaneous/` on `main`.

**TanStack Table — v8 array-of-features vs v9 keyed map**

v8 `TableFeature` ([`packages/table-core/src/types.ts`](https://github.com/TanStack/table/blob/v8/packages/table-core/src/types.ts)):

```ts
export interface TableFeature<TData extends RowData = any> {
  createCell?: (cell, column, row, table) => void;
  createColumn?: (column, table) => void;
  createHeader?: (header, table) => void;
  createRow?: (row, table) => void;
  createTable?: (table) => void;
  getDefaultColumnDef?: () => Partial<ColumnDef<TData, unknown>>;
  getDefaultOptions?: (table) => Partial<TableOptionsResolved<TData>>;
  getInitialState?: (initialState?: InitialTableState) => Partial<TableState>;
}
```

`createTable` runs a fixed, hand-ordered built-in list with **dependency comments** and appends user `_features` last
([`core/table.ts`](https://github.com/TanStack/table/blob/v8/packages/table-core/src/core/table.ts)):

```ts
const builtInFeatures = [
  Headers,
  ColumnVisibility,
  ColumnOrdering,
  ColumnPinning,
  ColumnFaceting,
  ColumnFiltering,
  GlobalFaceting, //depends on ColumnFaceting
  GlobalFiltering, //depends on ColumnFiltering
  RowSorting,
  ColumnGrouping, //depends on RowSorting
  RowExpanding,
  RowPagination,
  RowPinning,
  RowSelection,
  ColumnSizing,
] as const;
const _features = [...builtInFeatures, ...(options._features ?? [])];
// four passes: getDefaultOptions → getInitialState → build core instance → createTable (mutates in place)
```

- Type contributions come from **TypeScript interface declaration merging**, not generics: `RowSorting` declares
  `SortingTableState`, `SortingOptions`, `SortingColumnDef` and merges them into `TableState` etc. —
  [`RowSorting.ts`](https://github.com/TanStack/table/blob/v8/packages/table-core/src/features/RowSorting.ts).
- **Row models, not features, are the tree-shaking boundary** in v8: `getCoreRowModel`, `getSortedRowModel`,
  `getFilteredRowModel` are imported and passed as options; the _feature_ (sorting API surface) always ships, the
  _algorithm_ only if imported. All 15 built-in features ship regardless of use.
- v9 (`main`, alpha) fixes that with a keyed object threaded through a `TFeatures` generic —
  [`constructTable.ts`](https://github.com/TanStack/table/blob/main/packages/table-core/src/core/table/constructTable.ts),
  [`TableFeatures.ts`](https://github.com/TanStack/table/blob/main/packages/table-core/src/types/TableFeatures.ts):

```ts
export type ExtractFeatureMapTypes<TFeatures extends TableFeatures, TFeatureMap extends object> = IsAny<TFeatures> extends true ? UnionToIntersection<TFeatureMap[keyof TFeatureMap]> : UnionToIntersectionOrEmpty<TFeatureMap[Extract<keyof TFeatures, keyof TFeatureMap>]>;

/** Declaration-merge target for custom table features. */
export interface Plugins {}

/** Maps each row model / fn registry slot to the feature(s) that must be registered alongside it. */
export interface FeatureSlotPrereqs {
  aggregationFns: 'rowAggregationFeature';
  columnResizingFeature: 'columnSizingFeature';
  expandedRowModel: 'rowExpandingFeature';
  filteredRowModel: 'columnFilteringFeature';
  // …
}
```

Three transferable ideas: a **keyed map** lets the type system ask "is feature X present?" and expose only that API;
`interface Plugins {}` is an explicit declaration-merge extension point for third parties; `FeatureSlotPrereqs`
encodes dependencies **declaratively and mergeably**, so a compile-time error can say "you passed `sortedRowModel`
but not `rowSortingFeature`". v9 also pre-computes init functions into arrays (`_columnInstanceInitFns`,
`_cellInstanceInitFns`) so per-row/per-cell construction doesn't re-walk the feature list.

- **Angular adapter**: signals are confined to the adapter; core stays framework-free
  ([`packages/angular-table/src/index.ts`](https://github.com/TanStack/table/blob/v8/packages/angular-table/src/index.ts),
  [`proxy.ts`](https://github.com/TanStack/table/blob/v8/packages/angular-table/src/proxy.ts)):

```ts
const tableSignal = computed(
  () => {
    table.setOptions(updatedOptions());
    return table;
  },
  { equal: () => false },
); // identity stable, always "changed"
return proxifyTable(tableSignal);

// proxifyTable: every `get*` (not `*Handler`) accessor is lazily replaced by a memoized computed
function toComputed<T>(signal: Signal<Table<T>>, fn: Function) {
  const hasArgs = fn.length > 0;
  if (!hasArgs)
    return computed(() => {
      void signal();
      return fn();
    });
  const computedCache: Record<string, Signal<unknown>> = {};
  return (...argsArray: any[]) => {
    const serializedArgs = JSON.stringify(argsArray);
    if (computedCache.hasOwnProperty(serializedArgs)) return computedCache[serializedArgs]?.();
    const computedSignal = computed(() => {
      void signal();
      return fn(...argsArray);
    });
    computedCache[serializedArgs] = computedSignal;
    return computedSignal();
  };
}
```

`lazyInit` defers construction until first property access or a `queueMicrotask`, using `untracked()` so creation
never registers reactive reads ([`lazy-signal-initializer.ts`](https://github.com/TanStack/table/blob/v8/packages/angular-table/src/lazy-signal-initializer.ts)).
Caveats: the arg cache is `JSON.stringify`-keyed and **never evicted**; `equal: () => false` means any option/state
read invalidates everything; the `get*`/`*Handler` string heuristic is a naming contract plugin authors must follow.

**ngx-formly — registry + priority-ordered lifecycle hooks**

```ts
// src/core/src/lib/core.config.ts
export const FORMLY_CONFIG = new InjectionToken<ConfigOption[]>('FORMLY_CONFIG');

export function withDefaultConfig(config: FormlyConfig): ConfigOption {
  return {
    types: [
      { name: 'formly-group', component: FormlyGroup },
      { name: 'formly-template', component: FormlyTemplateType },
    ],
    extensions: [
      { name: 'core', extension: new CoreExtension(config), priority: -250 },
      { name: 'field-validation', extension: new FieldValidationExtension(config), priority: -200 },
      { name: 'field-form', extension: new FieldFormExtension(), priority: -150 },
      { name: 'field-expression', extension: new FieldExpressionLegacyExtension(), priority: -100 },
    ],
  };
}

export const provideFormlyCore = (configs: ConfigOption | ConfigOption[] = []): Provider => [FormlyConfig, { provide: FORMLY_CONFIG, multi: true, useFactory: withDefaultConfig, deps: [FormlyConfig] }, provideFormlyConfig(configs)];
```

Source: [ngx-formly `core.config.ts`](https://github.com/ngx-formly/ngx-formly/blob/main/src/core/src/lib/core.config.ts).

- `provideFormlyConfig` contains a **`skipSelf` merge trick**: when a child injector shares the same `FormlyConfig`
  instance, the child's config is _appended to the parent's array_ rather than shadowing it — that is how route-level
  config composes without losing root config:

```ts
export const provideFormlyConfig = (configs: ConfigOption | ConfigOption[] = []): Provider => ({
  provide: FORMLY_CONFIG,
  multi: true,
  useFactory: () => {
    const currentConfig = inject(FORMLY_CONFIG, { skipSelf: true, optional: true });
    if (currentConfig && inject(FormlyConfig) === inject(FormlyConfig, { skipSelf: true, optional: true })) {
      configs = Array.isArray(configs) ? configs : [configs];
      currentConfig.push(...configs);
      return currentConfig;
    }
    return configs;
  },
});
```

- The extension contract and registry shape
  ([`models/config.ts`](https://github.com/ngx-formly/ngx-formly/blob/main/src/core/src/lib/models/config.ts)):

```ts
export interface FormlyExtension<F extends FormlyFieldConfig = FormlyFieldConfig> {
  priority?: number;
  prePopulate?(field: F): void;
  onPopulate?(field: F): void;
  postPopulate?(field: F): void;
}
export interface ExtensionOption {
  name: string;
  extension: FormlyExtension;
  priority?: number;
}
export interface TypeOption {
  name: string;
  component?: Type<FieldType>;
  wrappers?: string[];
  extends?: string;
  defaultOptions?: FormlyFieldConfig;
}
export interface WrapperOption {
  name: string;
  component: Type<FieldWrapper>;
  types?: string[];
}
export interface ConfigOption {
  types?: TypeOption[];
  wrappers?: WrapperOption[];
  validators?: ValidatorOption[];
  extensions?: ExtensionOption[];
  validationMessages?: ValidationMessageOption[];
  extras?: { immutable?; showError?; checkExpressionOn?: 'modelChange' | 'changeDetectionCheck'; lazyRender?; resetFieldOnHide?; renderFormlyFieldElement? };
  presets?: PresetOption[];
}
```

- Priority resolution is **two-level: priority bucket → name**; default priority is `1`, so built-ins at `-250…-100`
  always run first ([`formly.config.ts`](https://github.com/ngx-formly/ngx-formly/blob/main/src/core/src/lib/services/formly.config.ts)):

```ts
private extensionsByPriority: Record<number, { [name: string]: FormlyExtension }> = {};
private setSortedExtensions(extensionOptions: ExtensionOption[]) {
  extensionOptions.forEach((o) => {
    const priority = o.priority ?? 1;
    this.extensionsByPriority[priority] = { ...this.extensionsByPriority[priority], [o.name]: o.extension };
  });
  this.extensions = Object.keys(this.extensionsByPriority).map(Number).sort((a, b) => a - b)
    .reduce((acc, prio) => ({ ...acc, ...this.extensionsByPriority[prio] }), {});
}
```

**Name collision within a bucket is the intended override mechanism** (`withFormlyFieldExpression()` replaces
`field-expression` at the same name and priority −100).

- Hook execution — the recursion is the point
  ([`formly.builder.ts`](https://github.com/ngx-formly/ngx-formly/blob/main/src/core/src/lib/services/formly.builder.ts)):

```ts
const extensions = Object.values(this.config.extensions);
extensions.forEach((e) => e.prePopulate?.(field));
extensions.forEach((e) => e.onPopulate?.(field));
field.fieldGroup?.forEach((f) => this._build(f)); // 👈 recurse into children
extensions.forEach((e) => e.postPopulate?.(field)); // runs after the ENTIRE subtree is built
```

- `setType` copies only the whitelisted props `['component','extends','defaultOptions','wrappers']`, supports `extends`
  for type inheritance, and `getType`/`getWrapper` accept a raw `Type<...>` directly
  (`{ component: name, name: name.prototype.constructor.name }`) — a register-by-class escape hatch.

### Inferences

- Taiga's `tuiCreateOptions` + `skipSelf` merge is ~15 lines and directly portable; it is strictly more composable than
  Material's replace-semantics, and `input(inject(TOKEN).x)` is the cleanest way to make a DI default the initial value
  of a signal input (noting it reads the token once at construction and is not reactive to later provider changes).
- `interface Plugins {}` (TanStack v9) is the _only_ mechanism found that gives third-party features first-class types
  without arity-capped overloads — but it is globally additive: every instance in the app sees every registered
  feature's types unless a `TFeatures` generic narrows it.
- ngx-formly's two-level bucket→name registry has a real bug surface worth avoiding: re-registering the same name at a
  _different_ priority leaves the old entry in its original bucket, and the last-flattened wins.
- Formly's `resolveFieldTypeRef` creates and immediately destroys a component just to read `instance.defaultOptions` —
  an SSR/perf hazard explicitly worth _not_ copying.

### Gaps

- Taiga's `tuiCreateOptions` return-type tuple was read from `main`; it may differ in the version ngx-vflow would target.

---

## Q6 (continued). ngx-graph, ngx-charts, gridster2, ngx-datatable, FullCalendar, angular-three, spartan-ng, ng-primitives, PrimeNG, ng-zorro

### Takeaway

ngx-graph's `Layout` interface is the closest direct analogue to what ngx-vflow needs and is worth copying in _shape_
but not in _typing_ (`settings?: any`, undeclared `defaultSettings`). FullCalendar has the most disciplined multi-plugin
merge semantics found anywhere. angular-three has the best-engineered global catalogue (refcounted, cleanup-returning).
spartan-ng / ng-primitives show the cleanest signals-era config and state-composition idioms.

### Cited Findings

**ngx-graph — the `Layout` strategy interface (verbatim, master = published `@swimlane/ngx-graph@13.0.0`)**

```ts
// projects/swimlane/ngx-graph/src/lib/models/layout.model.ts
import { Graph } from './graph.model';
import { Edge } from './edge.model';
import { Node } from './node.model';
import { Observable } from 'rxjs';

export interface Layout {
  settings?: any;
  run(graph: Graph): Graph | Observable<Graph>;
  updateEdge(graph: Graph, edge: Edge): Graph | Observable<Graph>;
  onDragStart?(draggingNode: Node, $event: MouseEvent): void;
  onDrag?(draggingNode: Node, $event: MouseEvent): void;
  onDragEnd?(draggingNode: Node, $event: MouseEvent): void;
  parseTranslate?(transformStr: string | undefined): { tx: number; ty: number };
}
```

Source: [swimlane/ngx-graph `layout.model.ts`](https://raw.githubusercontent.com/swimlane/ngx-graph/master/projects/swimlane/ngx-graph/src/lib/models/layout.model.ts).
The data it operates on is tiny and fully host-owned:
`interface Graph { edges: Edge[]; nodes: Node[]; compoundNodes?: CompoundNode[]; clusters?: ClusterNode[]; edgeLabels?: any }`
— [graph.model.ts](https://raw.githubusercontent.com/swimlane/ngx-graph/master/projects/swimlane/ngx-graph/src/lib/models/graph.model.ts).

- The registry is a plain object map plus a throwing factory —
  [`layout.service.ts`](https://raw.githubusercontent.com/swimlane/ngx-graph/master/projects/swimlane/ngx-graph/src/lib/graph/layouts/layout.service.ts):

```ts
const layouts = { dagre: DagreLayout, dagreCluster: DagreClusterLayout, dagreNodesOnly: DagreNodesOnlyLayout, d3ForceDirected: D3ForceDirectedLayout, colaForceDirected: ColaForceDirectedLayout };
@Injectable()
export class LayoutService {
  getLayout(name: string): Layout {
    if (layouts[name]) {
      return new layouts[name]();
    } else {
      throw new Error(`Unknown layout type '${name}'`);
    }
  }
}
```

- The consumer seam accepts **a name or an instance**, and in v13 is a signal `model` —
  [`graph.component.ts`](https://raw.githubusercontent.com/swimlane/ngx-graph/master/projects/swimlane/ngx-graph/src/lib/graph/graph.component.ts):

```ts
readonly layout = model<string | Layout>(undefined);
readonly layoutSettings = input<any>(undefined);
setLayout(layout: string | Layout, layoutInputChanged = false): void {
  if (typeof layout === 'string') {
    this.layout.set(this.layoutService.getLayout(layout));
    this.setLayoutSettings(this.layoutSettings());
  }
}
setLayoutSettings(settings: any): void {
  const layout = this.layout();
  if (layout && typeof layout !== 'string') { layout.settings = settings; }
}
```

Every optional hook is invoked behind a `typeof layout !== 'string'` + truthiness guard (`layout.onDragStart?`,
`onDrag`, `onDragEnd` around lines 3301/3528/3546) — the "plugin" is duck-typed at each use site.

- **`defaultSettings` is a convention, not part of the interface.** `DagreLayout` / `D3ForceDirectedLayout` declare
  `defaultSettings: DagreSettings` / `D3ForceDirectedSettings` and merge internally with
  `Object.assign({}, this.defaultSettings, this.settings)`; the host also does
  `Object.assign({}, layout.defaultSettings ?? {}, layout.settings ?? {})` (graph.component.ts:1035) — reading a field
  the `Layout` type does not declare —
  [dagre.ts](https://raw.githubusercontent.com/swimlane/ngx-graph/master/projects/swimlane/ngx-graph/src/lib/graph/layouts/dagre.ts),
  [d3ForceDirected.ts](https://raw.githubusercontent.com/swimlane/ngx-graph/master/projects/swimlane/ngx-graph/src/lib/graph/layouts/d3ForceDirected.ts).
- **Sync and async in one signature**: `run(graph): Graph | Observable<Graph>` lets dagre return synchronously while
  d3-force returns `this.outputGraph$.asObservable()` and pushes a new graph on every simulation `tick`. Force layouts
  keep mutable instance state (`inputGraph`, `d3Graph`, `draggingStart`), which is why `getLayout` news up a fresh
  instance per graph.

**ngx-charts** — no plugin registry. The seams are component composition (`<ngx-charts-chart>` is a public primitive
rendering the outer div, the `<svg>` wrapper with `<ng-content>`, and the legend) and class inheritance
(`extends BaseChartComponent`, carrying `results`, `view`, `scheme`, `schemeType`, `customColors`, `animations`,
`select`, plus resize/visibility observation). Both are still `standalone: false` (NgModule-era) and
`@Input()`/`EventEmitter`-based. SSR is handled bluntly: `ngOnInit` sets `this.animations = false` when
`isPlatformServer(this.platformId)` —
[chart.component.ts](https://raw.githubusercontent.com/swimlane/ngx-charts/master/projects/swimlane/ngx-charts/src/lib/common/charts/chart.component.ts),
[base-chart.component.ts](https://raw.githubusercontent.com/swimlane/ngx-charts/master/projects/swimlane/ngx-charts/src/lib/common/base-chart.component.ts).

**angular-gridster2 — one optional-callback bag, with veto hooks**
[`gridsterConfig.ts`](https://raw.githubusercontent.com/tiberiuzuld/angular-gridster2/master/projects/angular-gridster2/src/lib/gridsterConfig.ts):

```ts
export type GridsterConfig = {
  initCallback?: (gridster: Gridster, gridsterApi: GridsterApi) => void;
  destroyCallback?: (gridster: Gridster) => void;
  gridSizeChangedCallback?: (gridster: Gridster) => void;
  itemChangeCallback?: (item: GridsterItemConfig, itemComponent: GridsterItem) => void;
  itemResizeCallback?: (item: GridsterItemConfig, itemComponent: GridsterItem) => void;
  itemInitCallback?: (item: GridsterItemConfig, itemComponent: GridsterItem) => void;
  itemRemovedCallback?: (item: GridsterItemConfig, itemComponent: GridsterItem) => void;
  itemValidateCallback?: (item: GridsterItemConfig) => boolean; // veto hook
  emptyCellClickCallback?: (event: MouseEvent, item: GridsterItemConfig) => void;
  draggable?: Draggable;
  resizable?: Resizable; /* … */
};
export type DragBase = {
  enabled?: boolean;
  stop?: (item, itemComponent, event: MouseEvent) => Promise<any> | void; // async veto (e.g. a modal)
  start?: (item, itemComponent, event: MouseEvent) => void;
  delayStart?: number;
};
export type GridsterConfigStrict = Required<GridsterConfig> & { draggable: Required<Draggable>; resizable: Required<Resizable> }; // "after defaults merged"
```

`itemValidateCallback: => boolean` is a **veto hook**; `DragBase.stop: => Promise<any> | void` allows asynchronous
drag confirmation. Defaults live in a separate constant object (`gridsterConfig.constant.ts`) with every callback
`undefined`, and the `Config` / `ConfigStrict = Required<…>` pair is a clean two-type idiom.

**ngx-datatable** (now [siemens/ngx-datatable](https://github.com/siemens/ngx-datatable)) — two seams:

- Global config via token + provider function:
  `export const NGX_DATATABLE_CONFIG = new InjectionToken<NgxDatatableConfig>('ngx-datatable.config')` and
  `providedNgxDatatableConfig(overrides): Provider`; config carries `messages`, `cssClasses`, `headerHeight`,
  `rowHeight?: number | 'auto' | ((row) => number)` —
  [`ngx-datatable.config.ts`](https://raw.githubusercontent.com/siemens/ngx-datatable/master/projects/ngx-datatable/src/lib/ngx-datatable.config.ts).
- Per-column template seam, migrated to signals —
  [`column.directive.ts`](https://raw.githubusercontent.com/siemens/ngx-datatable/master/projects/ngx-datatable/src/lib/components/columns/column.directive.ts):

```ts
@Directive({ selector: 'ngx-datatable-column' })
export class DataTableColumnDirective<TRow> {
  readonly cellTemplateInput = input<TemplateRef<CellContext<TRow>> | undefined>(undefined, { alias: 'cellTemplate' });
  readonly cellTemplateQuery = contentChild(DataTableColumnCellDirective, { read: TemplateRef });
  readonly headerTemplateInput = input<TemplateRef<HeaderCellContext> | undefined>(undefined, { alias: 'headerTemplate' });
  readonly headerTemplateQuery = contentChild(DataTableColumnHeaderDirective, { read: TemplateRef });
  readonly frozenLeft = input(false, { transform: booleanAttribute });
  readonly isTreeColumn = input(false, { transform: booleanAttribute });
}
```

The `input(...) ?? contentChild(..., {read: TemplateRef})` pair is a signal-native "structural directive OR passed
TemplateRef" pattern.

**FullCalendar — the strongest "plugin object" prior art**
[v6.1.15 `plugin-system.ts`](https://raw.githubusercontent.com/fullcalendar/fullcalendar/v6.1.15/packages/core/src/plugin-system.ts):

```ts
declare function createPlugin(input: PluginDefInput): PluginDef;
interface PluginDefInput {
  name: string;
  deps?: PluginDef[]; // dependency graph, resolved depth-first
  reducers?: ReducerFunc[];
  contextInit?: (context: CalendarContext) => void;
  eventRefiners?: GenericRefiners;
  optionRefiners?: GenericRefiners;
  listenerRefiners?: GenericListenerRefiners;
  views?: ViewConfigInputHash; // named views ("dayGridMonth")
  viewPropsTransformers?: ViewPropsTransformerClass[];
  isPropsValid?: isPropsValidTester; // single-winner veto
  componentInteractions?: InteractionClass[]; // drag/drop/resize behaviors  ← ngx-vflow analogue
  calendarInteractions?: CalendarInteractionClass[];
  eventSourceDefs?: EventSourceDef<any>[];
  recurringTypes?: RecurringType<any>[];
  themeClasses?: { [themeSystemName: string]: ThemeClass };
  elementDraggingImpl?: ElementDraggingClass;
  scrollGridImpl?: ScrollGridImpl;
  initialView?: string;
  optionChangeHandlers?: OptionChangeHandlerMap;
  propSetHandlers?: { [propName: string]: (val: any, context: CalendarData) => void };
}
interface PluginDef extends PluginHooks {
  id: string;
  name: string;
  deps: PluginDef[];
}
```

`createPlugin` normalizes every optional field to `[]`/`{}` and stamps `id: guid()`. Composition, verbatim:

```ts
function addDefs(defs: PluginDef[]) {
  for (let def of defs) {
    const currentId = currentPluginIds[def.name];
    if (currentId === undefined) {
      currentPluginIds[def.name] = def.id;
      addDefs(def.deps);
      hooks = combineHooks(hooks, def);
    } else if (currentId !== def.id) {
      console.warn(`Duplicate plugin '${def.name}'`);
    }
  }
}
addDefs(pluginDefs);
addDefs(globalDefs); // explicit plugins win over globally-registered ones
```

**Per-hook merge semantics in `combineHooks` are the interesting part:**

- **arrays concat** (`reducers`, `componentInteractions`, `viewPropsTransformers`, …) → plugins stack, order =
  registration order;
- **records spread** (`views`, `themeClasses`, `optionRefiners`, `propSetHandlers`) → **last wins**;
- **single-slot last-wins**: `isPropsValid: hooks1.isPropsValid || hooks0.isPropsValid`, `cmdFormatter`,
  `scrollGridImpl`, `namedTimeZonedImpl`;
- **single-slot first-wins**, commented `// put earlier plugins FIRST`:
  `initialView: hooks0.initialView || hooks1.initialView`, `elementDraggingImpl`.
  Hook building is memoized by array identity (`buildBuildPluginHooks()` recomputes only when
  `!isArraysEqual(overrideDefs, currentOverrideDefs)`).
- The **Angular wrapper is a thin options bridge, not a plugin participant**: one `options?: CalendarOptions` input plus
  promoted inputs and ~23 `TemplateRef` content-children; it is `DoCheck`-based (manual option diffing,
  `deepChangeDetection` opt-in), i.e. deliberately outside Angular's change-detection model; peer range
  `@angular/core: 16 - 22` — [`@fullcalendar/angular@7.1.0` typings](https://unpkg.com/@fullcalendar/angular/full-calendar.component.d.ts).
- FullCalendar v7 did an ag-grid-style consolidation: one `fullcalendar` package with subpath exports
  (`fullcalendar/daygrid`, `/interaction`, `/list`), and a plugin is now just `PluginInput` as the module's default
  export — [package exports](https://unpkg.com/fullcalendar/package.json).

**angular-three — refcounted global catalogue with cleanup tokens**
[`catalogue.ts`](https://raw.githubusercontent.com/angular-threejs/angular-three/main/libs/core/src/lib/renderer/catalogue.ts):

```ts
const catalogue: Record<string, NgtConstructorRepresentation> = {};
export function extend(objects: object): () => void; // returns a CLEANUP function
export function remove(...keys: string[]): void; // authoritative; invalidates outstanding cleanup tokens
export const NGT_CATALOGUE = new InjectionToken<typeof catalogue>('NGT_CATALOGUE', { factory: () => catalogue });
export function injectCatalogue() {
  return inject(NGT_CATALOGUE);
}
// extend({ Mesh, BoxGeometry, MeshStandardMaterial })  →  <ngt-mesh><ngt-box-geometry/></ngt-mesh>
```

Registrations are **refcounted and layered per key**
(`CatalogueOwnership { baseline, hadBaseline, registrations: [{value, count}] }`), so repeated component-level
`extend()` calls for the same constructor coalesce into one layer, cleanup pops back to the previous layer or restores
the original baseline, and a stale cleanup token can never clobber a newer registration era
(`if (catalogueOwnership.get(key) !== ownership) continue`).

- Constructor args use a **structural directive** rather than an input, because the object must be _constructed_:
  `@Directive({ selector: 'ng-template[args]' })` with `args = input.required<any[] | null>()`, used as
  `<ngt-box-geometry *args="[1,2,3]"/>` and `<ngt-primitive *args="[myObject]"/>` for third-party/pre-built objects;
  internally it registers a renderer anchor `setRendererAnchor(commentNode, { kind: 'args', injector: this.injector })`
  — [`args.ts`](https://raw.githubusercontent.com/angular-threejs/angular-three/main/libs/core/src/lib/directives/args.ts).
- `NgtCanvas` is signals-throughout and exposes a **swappable interaction layer as an input**:
  `events = input(createPointerEvents)` where
  `createPointerEvents(store: SignalState<NgtState>): NgtEventManager<HTMLElement>`; `NgtCanvas` is exported as a const
  tuple `[NgtCanvasImpl, NgtCanvasContent] as const` for `imports:` —
  [`canvas.ts`](https://raw.githubusercontent.com/angular-threejs/angular-three/main/libs/core/dom/src/lib/canvas.ts),
  [`dom/events.ts`](https://raw.githubusercontent.com/angular-threejs/angular-three/main/libs/core/dom/src/lib/events.ts).
- Element typing comes from a generated `three-types.ts` (`export type * from './lib/three-types'`); third-party
  constructors registered via `extend` get **no template type checking** unless the consumer augments that interface.
- Note: `libs/plugin` in that repo is an **Nx generator/migration package** (`generators.json`, `migrations.json`) —
  build-time scaffolding, not a runtime plugin system.

**spartan-ng — brain/helm split, per-component config token**
[`hlm-button.ts`](https://github.com/goetzrobin/spartan/blob/main/libs/helm/button/src/lib/hlm-button.ts),
[`hlm-button.token.ts`](https://raw.githubusercontent.com/goetzrobin/spartan/main/libs/helm/button/src/lib/hlm-button.token.ts):

```ts
@Directive({
  selector: 'button[hlmBtn], a[hlmBtn]',
  exportAs: 'hlmBtn',
  hostDirectives: [{ directive: BrnButton, inputs: ['disabled'] }], // explicit input allow-list
  host: { 'data-slot': 'button' },
})
export class HlmButton {
  private readonly _config = injectBrnButtonConfig();
  public readonly variant = input<ButtonVariants['variant']>(this._config.variant); // config → input DEFAULT
  public readonly size = input<ButtonVariants['size']>(this._config.size);
}

const BrnButtonConfigToken = new InjectionToken<BrnButtonConfig>('BrnButtonConfig'); // private
export function provideBrnButtonConfig(config: Partial<BrnButtonConfig>): ValueProvider {
  return { provide: BrnButtonConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectBrnButtonConfig(): BrnButtonConfig {
  return inject(BrnButtonConfigToken, { optional: true }) ?? defaultConfig;
}
```

More complex components (`HlmSwitch`) compose by **template nesting** of `<brn-switch>` instead of `hostDirectives`,
because they need to project into brain's own template — `hostDirectives` only works when the host element is the
right element.

**ng-primitives — a state-composition toolkit shipped as a package**
[`packages/ng-primitives/state/src/index.ts`](https://raw.githubusercontent.com/ng-primitives/ng-primitives/main/packages/ng-primitives/state/src/index.ts):

```ts
export function createStateToken<T>(description: string): InjectionToken<T>
export function createStateProvider<T>(token: ProviderToken<T>): (options?: { inherit?: boolean }) => FactoryProvider
export function createStateInjector<T>(token, options?): <U = T>(injectOptions?: InjectOptions) => Signal<State<U>>
export function createState(token): <U>(state: U) => CreatedState<U>
export function createPrimitive<TFactory extends (...args: any[]) => unknown>(
  name: string, fn: TFactory, options?: CreatePrimitiveOptions,
): [InjectionToken<WritableSignal<PrimitiveState<TFactory>>>, TFactory,
    PrimitiveInjectionFn<TFactory>, (opts?: { inherit?: boolean }) => FactoryProvider]
export function controlled<T>(value: Signal<T>, defaultValue?: T): WritableSignal<T>  // controlled/uncontrolled
export function attrBinding(...), styleBinding(...), dataBinding(...), listener(...), onMount(cb), onDestroy(cb)
```

`createStateProvider`'s factory does `inject(token, { optional: true, skipSelf: true }) ?? signal({})` — a child
either **joins the ancestor's state or starts a fresh one** depending on `inherit`. `createPrimitive` returns a
4-tuple (token, factory, injector, provider) so each primitive gets a consistent DI quad; it builds a child `Injector`
when an `ElementRef` is supplied and runs the factory via `runInInjectionContext`. `State<T>` maps
`InputSignal<U>` → `WritableSignal<U>`, re-exposing inputs as writable state to descendants. Usage
([switch.ts](https://raw.githubusercontent.com/ng-primitives/ng-primitives/main/packages/ng-primitives/switch/src/switch/switch.ts)):
`@Directive({ selector: '[ngpSwitch]', providers: [provideSwitchState({ inherit: false })] })` with
`readonly state = ngpSwitch({ id: this.id, checked: this.checked, … })`, controlled-vs-uncontrolled expressed as
`checked` (undefined = uncontrolled) + `defaultChecked`.

**PrimeNG — `providePrimeNG` with an initializer**
[`provideprimeng.ts`](https://raw.githubusercontent.com/primefaces/primeng/master/packages/primeng/src/config/provideprimeng.ts):

```ts
export const PRIME_NG_CONFIG = new InjectionToken<PrimeNGConfigType>('PRIME_NG_CONFIG');
export function providePrimeNG(...features: PrimeNGConfigType[]): EnvironmentProviders {
  const providers = features?.map((feature) => ({ provide: PRIME_NG_CONFIG, useValue: feature, multi: false }));
  const initializer = provideAppInitializer(() => {
    const c = inject(PrimeNG);
    features?.forEach((f) => c.setConfig(f));
  });
  return makeEnvironmentProviders([...providers, initializer]);
}
```

**Wart worth avoiding:** `...features` varargs with `multi: false` means later providers silently overwrite earlier
ones in DI while _all_ of them are applied imperatively to the `PrimeNG` service — two sources of truth. Theming is a
separate, non-DI layer (`definePreset(Aura, {…})`, `usePreset`, `updatePreset`, `updatePrimaryPalette`, `$dt`, with
primitive/semantic/component token tiers from `@primeuix/themes`) — [PrimeNG theming](https://primeng.dev/theming).
`PrimeNGConfig` (the old service-mutation API) is superseded by `providePrimeNG`.

**ng-zorro — `NZ_CONFIG` + a field decorator that makes config the fallback for unset inputs**
[`config.ts`](https://raw.githubusercontent.com/NG-ZORRO/ng-zorro-antd/master/components/core/config/config.ts),
[`config.service.ts`](https://raw.githubusercontent.com/NG-ZORRO/ng-zorro-antd/master/components/core/config/config.service.ts):

```ts
export const NZ_CONFIG = new InjectionToken<NzConfig>(typeof ngDevMode !== 'undefined' && ngDevMode ? 'nz-config' : '');
export function provideNzConfig(config: NzConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: NZ_CONFIG, useValue: config }]);
}
// NzConfig = one interface with one optional key per component: affix?, select?, button?, datePicker?, …

export function WithConfig<This, Value>() {
  // standard TC39 class-field decorator
  return function (_value: undefined, context: ClassFieldDecoratorContext<This, Value>) {
    context.addInitializer(function () {
      const nzConfigService = inject(NzConfigService);
      const originalValue = this[context.name];
      let value: Value;
      let assignedByUser = false;
      Object.defineProperty(this, context.name, {
        get: () => {
          const configValue = nzConfigService.getConfigForComponent(this['_nzModuleName'])?.[context.name];
          if (assignedByUser) return value;
          if (isDefined(configValue)) return configValue;
          return originalValue;
        },
        set: (newValue) => {
          assignedByUser = isDefined(newValue);
          value = newValue;
        },
        enumerable: true,
        configurable: true,
      });
    });
  };
}
```

Precedence is documented as _instance input > `NZ_CONFIG` > library default_; runtime changes go through
`NzConfigService.set(componentName, config)` / `getConfigChangeEventForComponent(name)` —
[ng-zorro global config](https://ng.ant.design/docs/global-config/en).

### Inferences

- **Two distinct seams should not be conflated.** (a) _Strategy objects the app passes in_ — ngx-graph's `Layout`,
  angular-three's `events = input(createPointerEvents)`, gridster's callback bag; (b) _registrations that add
  capabilities globally or per-subtree_ — ag-grid's `ModuleRegistry`, angular-three's `extend`, FullCalendar's
  `plugins[]`. Given ngx-vflow's graph state is app-owned via signals, (a) fits layout/interaction/validation and (b)
  fits "new element kinds" (edge path renderers, handle types).
- **ngx-graph's string-name registry is a concrete tree-shaking leak**: taking the string path pulls all five layout
  engines in via `layout.service.ts`. ngx-vflow should accept an instance only (or accept a name but resolve it through
  a DI-provided map that the consumer populates).
- `settings?: any` + undeclared `defaultSettings` is the concrete typing failure to avoid; gridster's
  `Config` / `ConfigStrict = Required<Config>` pair, or `interface Layout<TSettings = unknown> { readonly
defaultSettings: TSettings; settings: Partial<TSettings> }`, is the cheap fix.
- **Single-handler callbacks don't compose.** `itemChangeCallback` can have exactly one owner; if two ngx-vflow plugins
  must both observe a drag, the hook must be array-shaped from day one — retrofitting it is a breaking change.
- FullCalendar's merge discipline is the thing to copy, not its god-interface: its own source carries a
  `// TODO: easier way to add new hooks? need to update a million things` comment because every new extension point
  touches `PluginDefInput`, `PluginHooks`, `createPlugin` and `combineHooks`.
- angular-three's module-global catalogue is SSR-shared and test-leaky; that it is _mitigated_ by refcounting and an
  injectable `NGT_CATALOGUE` token is exactly the argument for making DI, not a module global, the primary registry.
- ng-zorro's `Object.defineProperty` precedence trick is **fundamentally incompatible with signal inputs**; spartan's
  "config value as the `input()` default" achieves the same precedence with none of the machinery, and is the
  recommended signals-era form.
- Signals-native shapes already proven in the wild: `model<string | Strategy>()` for name-or-instance (ngx-graph 13);
  `input(...) ?? contentChild(..., {read: TemplateRef})` for template slots (ngx-datatable); `input(factoryFn)` to swap
  an interaction layer (angular-three); config-token-as-input-default for precedence (spartan);
  `undefined`-means-uncontrolled plus a `controlled()` helper (ng-primitives).
- ngx-charts' inheritance seam (`extends BaseChartComponent`) is the weakest pattern surveyed: no composability (one
  base only), fragile protected surface, hard to version. It should not be a model for ngx-vflow.

### Gaps

- ngx-graph figures are from `master` = published `@swimlane/ngx-graph@13.0.0`; `parseTranslate` and the signal-based
  `[layout]` are v13-only and differ from most online docs for v8/v9.
- ngx-datatable's current `ColumnMode` signature was not confirmed from source.
- PrimeNG's `definePreset` / `usePreset` signatures come from docs prose, not source.
- FullCalendar snippets are from the **v6.1.15 tag**; v7's `createPlugin`/`PluginInput` internals were not verified (the
  v7 monorepo layout differs).

---

## Q7. Ordering and priority when multiple plugins contribute to the same hook

### Takeaway

Angular gives no ordering guarantee at the DI level, so libraries that need a deterministic pipeline build it
themselves: HttpClient **folds the interceptor array right-to-left so execution is left-to-right**, dedupes with a
`Set`, and merges a _second, root-scoped_ token to work around injector shadowing. Explicit numeric priority appears in
third-party libs rather than in Angular itself.

### Cited Findings

- Verbatim from `@angular/common/fesm2022/module.mjs:2127–2131` (inside `HttpInterceptorHandler.handle`):

```ts
const parentHandler = this.injector.get(HttpHandler, null, { skipSelf: true });
const isDelegating = parentHandler !== null && this.backend === parentHandler;
const rootInterceptorFns = this.injector.get(HTTP_ROOT_INTERCEPTOR_FNS, [], isDelegating ? { self: true } : undefined);
const dedupedInterceptorFns = Array.from(new Set([...this.injector.get(HTTP_INTERCEPTOR_FNS), ...rootInterceptorFns]));
// Note: interceptors are wrapped right-to-left so that final execution order is
// left-to-right. That is, if `dedupedInterceptorFns` is the array `[a, b, c]`, we want to
// produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside out.
this.chain = dedupedInterceptorFns.reduceRight((nextSequencedFn, interceptorFn) => chainedInterceptorFn(nextSequencedFn, interceptorFn, this.injector), interceptorChainEndFn);
```

- Each link runs its interceptor inside the owning injector, which is what lets a functional interceptor call `inject()`
  (verbatim, `module.mjs:2035`):

```ts
function chainedInterceptorFn(chainTailFn, interceptorFn, injector) {
  return (initialRequest, finalHandlerFn) => runInInjectionContext(injector, () => interceptorFn(initialRequest, (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn)));
}
```

- Three distinct tokens exist for what is conceptually one hook, because scope semantics differ (`module.mjs:2046–2054`):
  `HTTP_INTERCEPTORS` (legacy, class-based, DI-instantiated), `HTTP_INTERCEPTOR_FNS` (functional, current-injector),
  `HTTP_ROOT_INTERCEPTOR_FNS` (functional, forced root scope). Source:
  [angular/angular `packages/common/http/src/interceptor.ts`](https://github.com/angular/angular/blob/main/packages/common/http/src/interceptor.ts).
- Legacy class interceptors are bridged into the functional chain through a single `LEGACY_INTERCEPTOR_FN` token,
  explicitly so that repeated `withInterceptorsFromDi()` calls dedupe: "using a pattern which guarantees that if these
  providers are included multiple times, all of the multi-provider entries will have the same instance of the
  interceptor function. That way, the `HttpInterceptorHandler` will dedup them and legacy interceptors will not run
  multiple times" (verbatim comment, `module.mjs:2973–2978`).
- Escaping a nested injector's interceptor chain is itself a feature (`module.mjs:3057`):

```ts
function withRequestsMadeViaParent() {
  return makeHttpFeature(HttpFeatureKind.RequestsMadeViaParent, [
    {
      provide: HttpBackend,
      useFactory: () => {
        const handlerFromParent = inject(HttpHandler, { skipSelf: true, optional: true });
        if (ngDevMode && handlerFromParent === null) throw new Error('withRequestsMadeViaParent() can only be used when the parent injector also configures HttpClient');
        return handlerFromParent;
      },
    },
  ]);
}
```

- `hostDirectives` ordering is deterministic and documented: host directives run **before** the host component, through
  nested chains — [Directive composition API • Angular](https://angular.dev/guide/directives/directive-composition-api).

### Inferences

- The `Set`-dedupe + `reduceRight` + "root token merged separately" combination is a complete, battle-tested recipe for
  a plugin pipeline and is worth copying wholesale for anything in ngx-vflow that is a _transform_ (e.g. connection
  validation, drag-position constraint, node-change reducers).
- The existence of `HTTP_ROOT_INTERCEPTOR_FNS` is the strongest available evidence that **child-injector multi providers
  do not merge with the parent's** — otherwise the token would be redundant. Treat "a `<vflow>`-level plugin plus an
  app-root-level plugin" as needing the same two-token merge.
- Angular's own APIs use **declaration order** as the priority mechanism and offer no numeric priority; libraries that
  do offer one (ngx-formly extensions) do so precisely because their hooks run at different populate stages.

### Gaps

- No primary Angular source explicitly states array ordering within one injector's multi-provider; the reduceRight
  comment implies registration order is preserved but does not promise it as API.

---

## Q8. Giving plugins access to internals without exposing everything

### Takeaway

Angular's official answer is the **lightweight abstract-class token**: publish a tiny abstract class as the contract,
let the real class `useExisting`-provide it, and have the host depend only on the token. Combined with `ɵ`-prefixed
exports (Angular's own "public but unsupported" marker) and secondary entry points, this gives three graduated levels of
exposure.

### Cited Findings

- The problem, verbatim from Angular docs: "The compiler must keep _value position_ references at runtime, which
  **prevents** the component from being tree-shaken" — i.e. a parent doing `contentChild(LibHeader)` pins `LibHeader`
  into the bundle even when unused —
  [Optimizing client application size with lightweight injection tokens • Angular](https://angular.dev/guide/di/lightweight-injection-tokens).
- The solution shape (quoted from the same page):

```ts
abstract class LibHeaderToken {}

@Component({
  selector: 'lib-header',
  providers: [{ provide: LibHeaderToken, useExisting: LibHeader }],
})
class LibHeader extends LibHeaderToken {}

@Component({ selector: 'lib-card' })
class LibCard {
  readonly header = contentChild(LibHeaderToken);
}
```

- API-surface guidance from the same page: "declare an abstract method in the abstract lightweight injection token
  class. The implementation of the method, with all its code overhead, resides in the injectable component that can be
  tree-shaken" — i.e. the token _is_ the plugin contract, deliberately minimal.
- Angular's own internal-but-exported convention is the `ɵ` prefix: `@angular/common/http` exports
  `HTTP_ROOT_INTERCEPTOR_FNS as ɵHTTP_ROOT_INTERCEPTOR_FNS`, `HttpInterceptorHandler as ɵHttpInterceptorHandler`,
  `withHttpTransferCache as ɵwithHttpTransferCache` (verbatim export list, `@angular/common/http/index.d.ts:4486`).
  The Router does the same (`ɵgetLoadedRoutes`, `ɵgetRouterInstance`, `ɵnavigateByUrl` are published as dev-mode
  globals inside `provideRouter` for devtools — `router_module.mjs:1007`).
- The CDK's cross-layer handle is a deliberately **untyped** token: `declare const CDK_TABLE: InjectionToken<any>` and
  `CdkColumnDef._table?: any` (`@angular/cdk/table/index.d.ts:886, 67`) — the parent facade is reachable but not
  type-exposed.
- Angular library guidance: `@angular/*` deps must be **peer dependencies** — "This ensures that when modules ask for
  Angular, they all get the exact same module" — and libraries should publish partial-Ivy
  (`"compilationMode": "partial"`) — [Creating libraries • Angular](https://angular.dev/tools/libraries/creating-libraries).

### Inferences

- A `VflowPluginContext` facade is best expressed as an **abstract class token** (not an interface), because only a
  class can be a DI token and an abstract class also documents the contract. The concrete implementation stays internal.
- Publishing plugins from secondary entry points (`ngx-vflow/layout-elk`) gets you deep-import-level isolation _and_
  lets the heavy dep (`elkjs`) be an optional peer dependency of only that entry point.

### Gaps

- Angular's "Creating libraries" page does **not** document secondary entry points; that is ng-packagr territory (see the
  packaging findings merged in below).

---

## Packaging and optional heavy dependencies (extends Q8)

### Cited Findings

- **ng-packagr secondary entry points**: a sub-entry-point needs only an `ng-package.json` in its folder, which can
  literally be `{}` — "No name is required. No version is required." Optional keys: `lib.entryFile`, `cssUrl`,
  `styleIncludePaths`, `sass`. No `package.json` in the subfolder is needed (that is the deprecated pre-v9 style).
  Consumers then `import {...} from '@my/library/testing'` —
  [ng-packagr `docs/secondary-entrypoints.md`](https://github.com/ng-packagr/ng-packagr/blob/main/docs/secondary-entrypoints.md).

```
my_package
├── src/{public_api.ts,*.ts}
├── ng-package.json
├── package.json
└── testing/
    ├── src/{public_api.ts,*.ts}
    └── ng-package.json          # can be `{}`
```

- **`assets` is not supported in a secondary entry point** — declare them in the root `ng-package.json` with an `output`
  path pointing into the subfolder:
  `{"assets": [{"input": "src/testing/assets", "glob": "**/*", "output": "testing/assets"}]}` —
  [ng-packagr docs](https://github.com/ng-packagr/ng-packagr/blob/main/docs/secondary-entrypoints.md).
- Taiga UI does this at per-component granularity: `ng-package.json` files sit in
  `projects/core/components/button/`, `projects/core/directives/`, `projects/cdk/utils/miscellaneous/` —
  [taiga-family/taiga-ui](https://github.com/taiga-family/taiga-ui).
- **Optional peer dependencies**: `peerDependenciesMeta` "allows peer dependencies to be marked as optional… npm will
  not automatically install optional peer dependencies", and it suppresses the missing-peer warning —
  [npm package.json docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json):

```json
{ "peerDependencies": { "@npm/soy-milk": "1.2" }, "peerDependenciesMeta": { "@npm/soy-milk": { "optional": true } } }
```

- ng-packagr's rule: declare deps as `peerDependencies`, because a `dependencies` section "easily leads to installing
  multiple versions"; ng-packagr **fails the build if a dependency is not allowed explicitly**, with the escape hatch
  `{"allowedNonPeerDependencies": ["moment"]}` (entries are RegExps; `["."]` disables the check) —
  [ng-packagr `docs/dependencies.md`](https://github.com/ng-packagr/ng-packagr/blob/main/docs/dependencies.md).

### Inferences

- `peerDependenciesMeta.optional` controls **installation**, not bundling. A static `import 'elkjs'` anywhere in an
  entry point pins it into every consumer's graph regardless of `optional`. Reliable isolation needs (a) a separate
  secondary entry point so the import graph never reaches it unless imported, and/or (b)
  `await import('elkjs/lib/elk.bundled.js')` inside the strategy, producing a lazy chunk — combined with a token whose
  default is a no-op strategy and the heavy adapter opted into via `provideElkLayout()`.
- Because `await import()` is async, the layout strategy's public API must be async (or expose a `ready` signal) — a
  public-API decision forced by the packaging choice, not an implementation detail.
- Cross-entry-point **circular imports** are the classic ng-packagr failure (entry points build in dependency order).
  This is exactly why the CDK routes parent↔child directive relationships through `InjectionToken` + `import type`
  (`CDK_DRAG_PARENT` is documented as existing "primarily to avoid circular imports"). If ngx-vflow splits entry
  points, that indirection becomes mandatory rather than stylistic.
- A middle ground — `ngx-vflow`, `ngx-vflow/layout`, `ngx-vflow/testing` — avoids multiplying the d.ts/fesm surface and
  turning every internal refactor into a breaking change.

### Gaps

- The dagre/elkjs-specific `peerDependenciesMeta` example seen in search results was **model-generated, not quoted from
  a real package**; only the mechanism is documented, not those particular version ranges.
- No primary source found for TypeScript-level handling of a genuinely-absent optional peer (`import type` +
  `moduleResolution`), so treat that guidance as reasoning, not citation.

---

## Q9. Tree-shaking

### Takeaway

Everything hinges on whether an unused plugin is reachable from a **value position** in the library's own graph. Feature
functions (`withX()`) and `providedIn`-tokens keep plugins out of the bundle; central registries with static imports,
`NgModule.forRoot()` barrels, and value-position `contentChild(ConcreteClass)` queries put them back in.

### Cited Findings

- "Declaring a provider makes that service _tree-shakable_. This practice lets the compiler leave the service out of the
  bundle if it never gets injected into the application that imports the library" —
  [Creating libraries • Angular](https://angular.dev/tools/libraries/creating-libraries).
- `InjectionToken` with a `factory`: "**Tree-shakeable** — Only included if actually used" and "**No manual provider
  configuration needed** — Works just like `providedIn: 'root'` for services" —
  [Defining dependency providers • Angular](https://angular.dev/guide/di/defining-dependency-providers).
- The value-position hazard is documented explicitly for `contentChild`/`inject` of a concrete component class —
  [Optimizing client application size with lightweight injection tokens • Angular](https://angular.dev/guide/di/lightweight-injection-tokens).
- Steyer states the purpose of the Feature pattern is "Activating and configuring optional features" in a
  **tree-shakable** manner — [ANGULARarchitects](https://www.angulararchitects.io/en/blog/patterns-for-custom-standalone-apis-in-angular/).
- Angular's own dev-only code is guarded with `typeof ngDevMode === 'undefined' || ngDevMode` so the whole branch is
  dropped in production builds (`withDebugTracing` in
  [`provide_router.ts`](https://github.com/angular/angular/blob/main/packages/router/src/provide_router.ts); the same
  guard wraps the conflict checks in `provideHttpClient`, `module.mjs:2907`).

### Inferences

- A `ModuleRegistry.registerModules([...])`-style _imperative_ registry (ag-grid) is inherently less tree-shakable at the
  library level than `provideX(withY())`, because the registry object itself must exist; it works only because the
  consumer chooses which modules to `import`. Both approaches ultimately rely on the consumer's import graph — the
  difference is whether the library forces a barrel.
- For ngx-vflow the actionable rules are: (1) never `import` a plugin from library core, (2) never query a plugin's
  concrete class from a library-owned component — query a token, (3) put dev-mode validation behind `ngDevMode`,
  (4) make the plugin's provider function the only place the plugin class is named.

### Gaps

- No primary source measured the real-world bundle delta of feature-pattern vs registry-pattern in an Angular library.
