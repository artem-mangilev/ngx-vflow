# Plugin / extension system design in framework-agnostic TypeScript libraries

Scope note: this file covers _mechanisms_ — declaration shape, extension points, interception of state changes, state contribution, ordering/precedence, typing strategy, and documented pain points — with an eye to porting into an Angular signals-based node-graph engine (ngx-vflow). Code snippets are marked either **[verbatim from docs]** or **[composed from documented API fields]**; nothing marked verbatim was invented.

---

## Q1. CodeMirror 6 — extensions as a tree of facets (the reference design)

### Takeaway

CodeMirror 6 is the most complete "extensions compose into a config" design: an extension is just a **value** (or an arbitrarily nested array of values), all extension points are **facets** that reduce many inputs into one output, ordering is a two-level rule (precedence category first, then flattened position), and reconfiguration is scoped via **compartments**. This is the single best model to steal from — but its dynamic-value machinery assumes an immutable `EditorState` + transaction pipeline.

### Cited Findings

- Extensions are "values (usually imported from some package), or arrays of such values. They can be arbitrarily nested (an array containing more arrays is also a valid extension), and are deduplicated during the configuration process." — [CodeMirror System Guide](https://codemirror.net/docs/guide/)
- The `Extension` type is described in the reference as: "Extension values can be provided when creating a state to attach configuration and behavior. They can be built-in objects or arrays nested arbitrarily deep." — [CodeMirror reference](https://codemirror.net/docs/ref/)
- Facets are extension points where "different extension values can _provide_ values for the facet. And anyone with access to the state and the facet can _read_ its output value." — [CodeMirror System Guide](https://codemirror.net/docs/guide/)
- Facets differ in how they combine inputs: single-value facets (e.g. tab size) "take the value with the highest precedence and use that"; event-handler facets "return the handlers as an array, sorted by precedence"; others reduce (e.g. `allowMultipleSelections`). — [CodeMirror System Guide](https://codemirror.net/docs/guide/)
- `Facet.define` options, quoted from the reference: `combine` — "How to combine the input values into a single output value. When not given, the array of input values becomes the output."; `compare` — "How to compare output values to determine whether the value of the facet changed. Defaults to comparing by `===`."; `compareInput` — "How to compare input values to avoid recomputing the output value when no inputs changed."; `static` — "Forbids dynamic inputs to this facet."; `enables` — "Extensions that will be added to any state where this facet is provided." — [CodeMirror reference](https://codemirror.net/docs/ref/)
- `enables` is the mechanism for **extension dependencies**: providing a facet input can transitively pull in the extensions that facet needs. — [CodeMirror reference](https://codemirror.net/docs/ref/)
- `StateField.define` options: `create` — "Creates the initial value for the field when a state is created."; `update` — "Compute a new value from the field's previous value and a transaction."; `compare` — "Compare two values of the field, returning true when they are the same."; `provide` — "Provide extensions based on this field, usually calling facet methods." — [CodeMirror reference](https://codemirror.net/docs/ref/)
- Precedence has exactly two rules: (1) "Explicitly set precedence category" wins; (2) within the same category, "position in the (flattened) collection of extensions passed to the state" decides. — [CodeMirror System Guide](https://codemirror.net/docs/guide/)
- There are five precedence categories, `Prec.highest/high/default/low/lowest`; "Highest precedence extends near start; lowest near end of ordering." — [CodeMirror reference](https://codemirror.net/docs/ref/); the blog calls them "five categories ('highest' to 'lowest')" and says the system "resolves precedence first by category, then by configuration order" — [Facets (Marijn Haverbeke)](https://marijnhaverbeke.nl/blog/facets.html)
- Deduplication is by identity: "if the same extension value occurs multiple times in a configuration, only the one in the highest-precedence position is used." — [Facets](https://marijnhaverbeke.nl/blog/facets.html). Practical consequence noted in the guide: "Creating static extension values once and returning the same instance ensures only one copy exists in the editor, even when the extension is included multiple times." — [CodeMirror System Guide](https://codemirror.net/docs/guide/)
- Interception of state changes is done through two facets: `transactionFilter` — "Facet used to register a hook that gets a chance to update or replace transaction specs before they are applied"; `transactionExtender` — "A more limited form of transactionFilter, which can only add annotations and effects. This type of filter runs even if the transaction has disabled regular filtering." — [CodeMirror reference](https://codemirror.net/docs/ref/)
- Reconfiguration: `Compartment.of` — "Create an instance of this compartment to add to your state configuration."; `Compartment.reconfigure` — "Create an effect that reconfigures this compartment."; `Compartment.get` — "Get the current content of the compartment in the state, or `undefined` if it isn't present." Plus `StateEffect.reconfigure` ("reconfigure the root extensions of the editor") and `StateEffect.appendConfig` ("Append extensions to the top-level configuration"). — [CodeMirror reference](https://codemirror.net/docs/ref/)
- Compartments preserve unaffected state: states can be reconfigured "either fully (replacing the entire extension tree) or via compartments (replacing tagged subtrees) while preserving unaffected state like undo history." — [Facets](https://marijnhaverbeke.nl/blog/facets.html)
- Facets support **dynamic inputs computed from other facets/fields**, "with automatic recomputation when dependencies change"; performance: "Static facets are cached in a reusable array, while dynamic ones live in a copied array with dependency tracking to minimize unnecessary recomputation across frequent state updates." — [Facets](https://marijnhaverbeke.nl/blog/facets.html)
- Marijn frames the facet design as solving four problems explicitly: **composition** ("Multiple extensions attaching to a given extension point must have their effects combined in a predictable way"), **precedence**, **grouping** (extensions attaching at multiple points + dependencies), and **change** (reacting to state changes + reconfiguration). — [Facets](https://marijnhaverbeke.nl/blog/facets.html)

### Snippet **[verbatim from docs]**

```javascript
// Defining + providing a facet, static and computed inputs
let info = Facet.define<string>()
let state = EditorState.create({
  extensions: [
    info.of("hello"),
    info.compute(["doc"], state => `lines: ${state.doc.lines}`)
  ]
})

// A state field is a reducer over transactions
let countDocChanges = StateField.define({
  create() { return 0 },
  update(value, tr) { return tr.docChanged ? value + 1 : value }
})

// Cross-extension messaging without shared mutable state
let setFullScreenMode = StateEffect.define<boolean>()

// Precedence overrides array position
let state2 = EditorState.create({extensions: [
  dummyKeymap("A"),
  dummyKeymap("B"),
  Prec.high(dummyKeymap("C"))       // "C" runs first despite being last
]})
```

— [CodeMirror System Guide](https://codemirror.net/docs/guide/)

### Inferences

- The facet abstraction is really _"a typed, ordered, reducible multi-provider token"_. Angular DI already has the multi-provider half (`{provide: TOKEN, multi: true}`) but lacks: the reducer (`combine`), the change-comparison (`compare`/`compareInput`), the precedence categories, and identity dedup. A ngx-vflow facet could be `InjectionToken` + an explicit `defineFacet({combine, compare})` registry rather than raw DI multi-providers, precisely because DI gives no ordering control beyond provider array order.
- `Facet.compare` / `compareInput` maps _very_ cleanly onto signals: a facet output can be a `computed()` whose equality function is `compare`, over a source signal holding the provided inputs. This is the part of CodeMirror that transfers **best** to signals — better than to the original immutable model, since signals give dependency tracking for free.
- `enables` (dependency pull-in) and identity dedup together solve "plugin A and plugin B both need plugin C" without a package-manager-style resolver. Worth copying: make ngx-vflow extension values referentially stable singletons so dedup by identity works.
- `Prec` five-category + position is a **dependency-free ordering rule**. Contrast with `before:`/`after:` name references (tapable) which require a resolver and can be unsatisfiable. For ngx-vflow, five categories is likely enough and is O(n log n) with no cycles possible.

### Gaps

- Could not retrieve the exact TS signature of `transactionFilter` (whether it returns `TransactionSpec | readonly TransactionSpec[]`), only the prose description; the reference page is very large and the fetch summarized it.

---

## Q2. ProseMirror — the plugin-spec model (state field + props + filter/append)

### Takeaway

ProseMirror's `PluginSpec` is the ancestor design: one object bundles a state field, view props, a view lifecycle, a veto hook (`filterTransaction`) and a transform hook (`appendTransaction`), keyed by a `PluginKey` for lookup. Its known weakness is exactly the thing CodeMirror later fixed: ordering is _only_ array position, and the veto/append hooks compose badly across independent plugins.

### Cited Findings

- `PluginSpec` fields, from the reference manual: `props` — "The view props added by this plugin. Props that are functions will be bound to have the plugin instance as their `this` binding."; `state` — lets a plugin define a state field; `key` — "Can be used to make this a keyed plugin. You can have only one plugin with a given key in a given state"; `view` — "When the plugin needs to interact with the editor view, or set something up in the DOM, use this field."; `filterTransaction` — cancels a transaction by returning false before it is applied; `appendTransaction` — "Allows the plugin to append another transaction to be applied after the given array of transactions." — [ProseMirror reference](https://prosemirror.net/docs/ref/)
- `StateField` interface: `init` — "Initialize the value of the field. `config` will be the object passed to `EditorState.create`"; `apply` — processes transactions to produce new field values; optional `toJSON`/`fromJSON` for serialization. — [ProseMirror reference](https://prosemirror.net/docs/ref/)
- `PluginKey` provides `get()` (retrieve the plugin instance from a state) and `getState()` (extract the plugin's state field value) — a branded lookup token. — [ProseMirror reference](https://prosemirror.net/docs/ref/)
- Prop resolution is **first-wins by plugin order**: handler functions run sequentially "starting with the base props and then searching through the plugins (in order of appearance) until one of them returns true." — [ProseMirror reference](https://prosemirror.net/docs/ref/)
- `appendTransaction` re-entrancy is documented behavior: when another plugin appends a transaction, "the first plugin is called again with the new state and extended array of transactions." — search synthesis over [discuss.ProseMirror](https://discuss.prosemirror.net/t/append-transaction-infinite-loops/2693)
- **Pain point — competing intent-rewriting plugins:** "The ordering problem emerges when two plugins try to discern a user's intent and change it, causing them to compete. If one plugin filters a transaction, a later plugin won't get to see it." — [discuss.ProseMirror / replaceTransaction RFC](https://github.com/ProseMirror/rfcs/pull/10)
- **Pain point — infinite loops:** multiple plugins appending cleanup transactions "can start calling each other repeatedly until the browser runs out of memory and crashes." — [Append Transaction infinite loops](https://discuss.prosemirror.net/t/append-transaction-infinite-loops/2693)
- **Pain point — history interaction:** appended transactions break undo/redo; e.g. "when appending a transaction to an undo command, the HistoryState fails to keep the 'undone' state created by the undo command, making redo impossible." — [Struggling with history when appendTransactions in multiple plugins](https://discuss.prosemirror.net/t/struggling-with-history-when-appendtransactions-in-multiple-plugins/5411); [prosemirror-history appendTransaction to undo](https://github.com/ProseMirror/prosemirror/issues/819)
- There was a formal RFC to add a `replaceTransaction`/`amendTransaction` hook because `filterTransaction` (veto-only) + `appendTransaction` (after-the-fact) could not express "rewrite this transaction". — [RFC #10 replaceTransaction](https://github.com/ProseMirror/rfcs/pull/10); [amendTransaction thread](https://discuss.prosemirror.net/t/amendtransaction/1532)

### Snippet **[composed from documented PluginSpec fields]**

```ts
import { Plugin, PluginKey } from 'prosemirror-state'

const myKey = new PluginKey<MyState>('my-plugin')

const myPlugin = new Plugin<MyState>({
  key: myKey,                                  // branded lookup token, unique per state
  state: {                                     // (e) state contribution
    init(config, state) { return initial(config) },
    apply(tr, value, oldState, newState) { return reduce(value, tr) },
    toJSON(value) { return value }, fromJSON(cfg, json) { return json },
  },
  props: {                                     // (f)/(g) UI + handler contributions, first-wins
    handleKeyDown(view, event) { return false },
    decorations(state) { return myKey.getState(state)!.decos },
  },
  filterTransaction(tr, state) { return true },      // (c) veto hook
  appendTransaction(trs, oldState, newState) { ... }, // (b)-ish: follow-up transaction
  view(editorView) { return { update(v, prev) {}, destroy() {} } }, // (h) lifecycle
})

// read plugin state from anywhere that has the EditorState
const value = myKey.getState(editorState)
```

Field names and semantics per [ProseMirror reference](https://prosemirror.net/docs/ref/).

### Inferences

- The ProseMirror → CodeMirror evolution is the single most instructive data point for ngx-vflow: **a monolithic "plugin object" with a fixed set of slots** (PM) was replaced by **many small independent extension points with explicit combine + precedence** (CM). The PM shape is easier to teach; the CM shape is what survives third-party composition.
- The "veto-only + append-only, no rewrite" split is a real design trap. For ngx-vflow drag/connection, the equivalent of `replaceTransaction` (a waterfall hook that returns a _modified_ intent) is what you actually want — e.g. snapping, grid constraints, parent-relative movement all want to _transform_ a proposed position, not veto it.
- `PluginKey.getState()` is a clean typed-state-lookup pattern that transfers directly: an ngx-vflow `ExtensionKey<T>` whose `.state(flow)` returns a `Signal<T>`.

---

## Q3. Tiptap — opinionated wrapper: options, storage, commands, priority

### Takeaway

Tiptap packages ProseMirror plugins into class-like extensions with declarative `add*` methods, per-extension mutable `storage`, `configure()`/`extend()` inheritance via `this.parent?.()`, and a numeric `priority`. Its documented pain is that priority semantics leaked incorrectly into keyboard-shortcut order, and that `priority` inside `extend()` broke types in v3.

### Cited Findings

- Extensions are created with `Extension.create({ name, ... })`; nodes and marks with `Node.create()` / `Mark.create()`. — [Tiptap custom extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new)
- `Extension` exposes `static create(config)`, instance `configure(options?)` returning a new `Extension<Options, Storage>`, and `extend(extendedConfig?)` returning `Extension<ExtendedOptions, ExtendedStorage>`; the config type is `ExtendableConfig<Options, Storage, ExtensionConfig, null>`. — [packages/core/src/Extension.ts](https://raw.githubusercontent.com/ueberdosis/tiptap/main/packages/core/src/Extension.ts)
- `addOptions()` merges with the parent's options via `...this.parent?.()`; same pattern for `addAttributes()`. — [Extend existing extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing)
- `addStorage()` "maintains mutable data within an extension instance, accessed via `this.storage` internally or `editor.storage.extensionName` externally." — [Extend existing extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing)
- `addGlobalAttributes()` lets one extension inject attributes into _other_ extensions, with type selectors `'*'`, `'nodes'`, `'marks'`, or an explicit list like `['heading', 'paragraph']` — a cross-cutting contribution mechanism. — [Extend existing extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing)
- "Extension names cannot be changed after creation. Doing so requires duplicating the entire extension and updating all name references, including in stored JSON content." — [Extend existing extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing)
- **Pain point — priority direction inverted for shortcuts:** "When two extensions register the same shortcut, the one with the lower priority takes precedence, contrary to documentation which states it should be higher." Root cause identified by the reporter as a `.reverse()` call in `ExtensionManager.ts`: extensions are sorted highest-to-lowest priority, and the reversal inverts that when plugins are added. — [Issue #1547](https://github.com/ueberdosis/tiptap/issues/1547)
- The underlying PM constraint quoted in that issue: "The order in which they appear determines their precedence (the ones early in the array get to dispatch first)." — [Issue #1547](https://github.com/ueberdosis/tiptap/issues/1547)
- **Pain point — extension array order silently affects shortcuts** (separate issue, "maybe needs documenting"). — [Issue #1154](https://github.com/ueberdosis/tiptap/issues/1154)
- **Pain point — typing:** "v3: The `priority` option breaks types when inside of `extends`"; the workaround was to put `priority` in an additional `.extend()` call. — [Issue #6275](https://github.com/ueberdosis/tiptap/issues/6275)

### Snippet **[verbatim fragments from docs, assembled]**

```js
import { Extension } from '@tiptap/core';

const CustomExtension = Extension.create({
  name: 'customExtension',
  addOptions() {
    return { ...this.parent?.(), levels: [1, 2, 3] };
  },
  addStorage() {
    return { awesomeness: 100 };
  }, // mutable per-extension state
  addKeyboardShortcuts() {
    return { 'Mod-l': () => this.editor.commands.toggleBulletList() };
  },
  addGlobalAttributes() {
    // cross-cutting contribution
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          textAlign: { default: 'left', renderHTML: (attrs) => ({ style: `text-align: ${attrs.textAlign}` }) },
        },
      },
    ];
  },
});

// inheritance / reconfiguration of an existing extension
const CustomBlockquote = Blockquote.extend({ content: 'paragraph*' });
```

Snippet pieces from [Extend existing extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing) and [Create new](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new).

### Inferences

- `addStorage()` → `editor.storage.<name>` is the closest thing in this survey to what ngx-vflow needs from "plugins add state", and it is **mutable**, not transactional. A signals version (`flow.storage.myPlugin` being a `WritableSignal` or a small signal-store slice) is a strictly better fit than CM's `StateField` reducer, because Angular apps will want to read it in templates.
- Tiptap's two priority bugs share one root cause: **priority was defined as a number without a single authoritative sort site**, and different subsystems (schema order, PM plugin order, keymap order) consumed it differently. Lesson for ngx-vflow: if you have a numeric priority, resolve it **once**, into one canonical ordered list, and derive every subsystem's order from that list — or use CodeMirror's category+position rule which has no second interpretation.
- "Extension names cannot be changed" is a warning about **names leaking into persisted data**. If ngx-vflow plugins contribute serialized node/edge data keyed by plugin name, that name becomes a permanent data-format commitment — version it deliberately.

### Gaps

- Could not confirm from a primary source the **default value of `priority`** (widely stated as 100) nor the exact signatures of `addCommands`, `addProseMirrorPlugins`, `addExtensions`, or the `declare module '@tiptap/core' { interface Commands<ReturnType> { ... } }` augmentation block. The Tiptap docs pages fetched were index/landing pages without the API tables, and the `Extension.ts` source inherits its fields from an `Extendable` base class that was not in the fetched excerpt. **The report writer should treat the `priority: 100` default and the `Commands` augmentation snippet as unverified.**

---

## Q4. Lexical & Slate — command priorities vs. method-wrapping

### Takeaway

Lexical uses a **bail hook with explicit numeric priority constants** for commands plus **node transforms run to a fixed point** for derived state; Slate uses the opposite extreme — plugins are `with*` higher-order functions that monkey-patch methods on the editor object and call through to the previous implementation.

### Cited Findings (Lexical)

- `createCommand()` + `editor.registerCommand(command, handler, priority)` returns an unsubscribe function; `editor.dispatchCommand(COMMAND, payload)` triggers it. — [Lexical commands](https://lexical.dev/docs/concepts/commands)
- The handler "should return true to stop propagation"; listeners execute "from priority highest to lowest...until a listener returns true." This is a **bail/veto hook with priority**. — [Lexical commands](https://lexical.dev/docs/concepts/commands)
- Priority constants, lowest to highest: `COMMAND_PRIORITY_EDITOR`, `..._BEFORE_EDITOR`, `..._LOW`, `..._BEFORE_LOW`, `..._NORMAL`, `..._BEFORE_NORMAL`, `..._HIGH`, `..._BEFORE_HIGH`, `..._CRITICAL`, `..._BEFORE_CRITICAL`. — [Lexical commands](https://lexical.dev/docs/concepts/commands)
- `editor.registerNodeTransform<T: LexicalNode>(Class<T>, T): () => void` runs a callback whenever nodes of that class are modified; "Transforms run sequentially before DOM changes occur, with multiple transforms resulting in a single DOM reconciliation." — [Lexical transforms](https://lexical.dev/docs/concepts/transforms)
- The fixed-point algorithm is documented: leaf transforms first; if they dirty more nodes, repeat; then element transforms; if those create more dirty nodes, return to step 1; if only dirty elements result, repeat the element step; continue until "no more transforms are required." — [Lexical transforms](https://lexical.dev/docs/concepts/transforms)
- Dirty tracking distinguishes "Intentionally Dirty" nodes (`getWritable()`/`markDirty()` called) from "Unintentionally Dirty" elements (ancestors of dirty nodes). — [Lexical transforms](https://lexical.dev/docs/concepts/transforms)
- **Documented anti-pattern:** using `registerUpdateListener` + a nested `editor.update()` is "strongly discouraged" because it "triggers an additional render (the most expensive lifecycle operation)" and creates a fresh EditorState, "potentially disrupting plugins like HistoryPlugin." — [Lexical transforms](https://lexical.dev/docs/concepts/transforms)
- Transforms **must** include preconditions to avoid infinite loops (e.g. check `!textNode.hasFormat('bold')` before toggling). — [Lexical transforms](https://lexical.dev/docs/concepts/transforms)

### Snippet **[verbatim from docs]**

```javascript
const HELLO_WORLD_COMMAND = createCommand('HELLO_WORLD');

editor.registerCommand(
  HELLO_WORLD_COMMAND,
  (payload: string) => {
    console.log(payload);
    return false;            // false = let lower-priority listeners also run
  },
  COMMAND_PRIORITY_EDITOR,
);

editor.dispatchCommand(HELLO_WORLD_COMMAND, 'Hello World!');
```

— [Lexical commands](https://lexical.dev/docs/concepts/commands)

### Cited Findings (Slate)

- "A plugin is simply a function that takes an `Editor` object and returns it after it has augmented it in some way." — [Slate plugins](https://docs.slatejs.org/concepts/08-plugins)
- The canonical pattern is: destructure the original method, override it, call the original in the fallback branch, return the editor. Composition is nested function application: `withImages(withCustomNormalization(createEditor()))`. — [Slate plugins](https://docs.slatejs.org/concepts/08-plugins)

### Snippet **[verbatim from docs]**

```javascript
const withImages = (editor) => {
  const { isVoid } = editor; // capture previous implementation

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element); // delegate
  };

  return editor;
};

const editor = withImages(withCustomNormalization(createEditor()));
```

— [Slate plugins](https://docs.slatejs.org/concepts/08-plugins)

### Inferences

- Slate's model is the cheapest to implement and the **worst to debug/type**: ordering is "whatever nesting order you wrote", there is no registry, no introspection ("which plugin overrode `isVoid`?"), and TypeScript cannot express "this plugin adds field X to the editor" without intersection gymnastics. It is, however, the closest analogue to what an Angular library could do with a _strategy service override_ — and that is exactly the **(d) override/strategy slot** category: last-provider-wins, exactly one implementation, delegate to `@Inject(forwardRef)`/`SkipSelf` parent.
- Lexical's `registerNodeTransform` fixed-point loop is the direct analogue of "when a parent node moves, children must move too, and that may trigger further rules" (cf. cytoscape-automove). Angular signals give you a _pull-based_ version of this for free via `computed()`, but **only when the derivation is acyclic and side-effect-free**. Lexical's loop exists because transforms _write_. If ngx-vflow plugins write to signals in response to signal changes, you get Angular's `effect()` + write hazards, not a clean fixed point — this is the single biggest impedance mismatch flagged below.
- Lexical's explicit `_BEFORE_*` interleaved constants are an admission that 5 levels were not enough; note that they doubled the ladder rather than switching to a dependency graph.

---

## Q5. tldraw — side effects on the store + ShapeUtil/StateNode/Binding slots

### Takeaway

tldraw is the closest architectural neighbour to ngx-vflow: a reactive record store with a **registered side-effect pipeline** that supports both _transform_ (before-change returns a modified record) and _veto_ (before-change/before-delete return `false`), plus three named extension slots — `ShapeUtil` (shape behaviour), tools/`StateNode`, and bindings.

### Cited Findings

- `StoreSideEffects` exposes seven registration methods, each returning an unsubscribe function, each scoped by `typeName`:
  `registerBeforeCreateHandler<T extends R["typeName"]>(typeName: T, handler: StoreBeforeCreateHandler<R & {typeName: T}>): () => void`, and the same shape for `registerAfterCreateHandler`, `registerBeforeChangeHandler`, `registerAfterChangeHandler`, `registerBeforeDeleteHandler`, `registerAfterDeleteHandler`; plus `registerOperationCompleteHandler(handler: StoreOperationCompleteHandler): () => void`. — [StoreSideEffects reference](https://tldraw.dev/reference/store/StoreSideEffects)
- **Transform capability:** `registerBeforeCreateHandler` and `registerBeforeChangeHandler` allow returning a modified record to apply different updates. **Veto capability:** `registerBeforeChangeHandler` and `registerBeforeDeleteHandler` allow returning the old record or `false` to block updates/deletions. — [StoreSideEffects reference](https://tldraw.dev/reference/store/StoreSideEffects)
- Documented discipline: "after" handlers are for side-effects that update _other_ records, while "before" handlers "should modify only the target record itself" — the docs frame this separation as preventing cascading changes. — [StoreSideEffects reference](https://tldraw.dev/reference/store/StoreSideEffects)
- `registerOperationCompleteHandler` gives a **transaction-boundary** hook (end of a store operation), distinct from per-record hooks. — [StoreSideEffects reference](https://tldraw.dev/reference/store/StoreSideEffects)
- The Editor is handed to extensions/app code via `<Tldraw onMount={(editor) => {}} />` or the `useEditor()` hook; the editor is documented across the areas Data (Signals, Store, Shapes, Bindings, Pages, Assets), Interaction (Tools, Selection, Input, Events), View (Camera, Coordinates), State (Instance state, Visibility, History, Side effects). — [tldraw Editor docs](https://tldraw.dev/docs/editor)
- `Editor.run()` exists for batching changes; other documented entry points include `Editor.createShapes()`, `Editor.deleteShapes()`, `Editor.getCurrentPageShapesSorted()`, `Editor.getSelectedShapeIds()`. — [tldraw Editor docs](https://tldraw.dev/docs/editor)
- Custom shapes: subclass `ShapeUtil` with `static type`, `static props` (validators from the `T` namespace), `getDefaultProps()`, `getGeometry()`, `component()`, `getIndicatorPath()`. Registration is `<Tldraw shapeUtils={[CardShapeUtil]} />`. — [tldraw shapes docs](https://tldraw.dev/docs/shapes)
- Shape prop types are registered by **module augmentation**: `declare module 'tldraw' { export interface TLGlobalShapePropsMap { [CARD_TYPE]: { w: number; h: number } } }`. — [tldraw shapes docs](https://tldraw.dev/docs/shapes)
- Static `props` validators exist specifically to prevent "typos and stale data from passing through unchecked"; `BaseBoxShapeUtil` is the subclass shortcut for rectangular shapes, and `ShapeUtil.configure()` customises built-in shapes without subclassing. — [tldraw shapes docs](https://tldraw.dev/docs/shapes)

### Snippet **[verbatim fragments from docs, assembled]**

```typescript
class CardShapeUtil extends ShapeUtil<CardShape> {
  static override type = CARD_TYPE
  static override props = { w: T.number, h: T.number }   // runtime validators

  getDefaultProps(): CardShape['props'] { return { w: 100, h: 100 } }

  getGeometry(shape: CardShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
  }

  component(shape: CardShape) { return <HTMLContainer>Hello</HTMLContainer> }

  getIndicatorPath(shape: CardShape) {
    const path = new Path2D(); path.rect(0, 0, shape.props.w, shape.props.h); return path
  }
}

// typed registration via declaration merging
declare module 'tldraw' {
  export interface TLGlobalShapePropsMap { [CARD_TYPE]: { w: number; h: number } }
}

<Tldraw shapeUtils={[CardShapeUtil]} />
```

— [tldraw shapes docs](https://tldraw.dev/docs/shapes)

### Snippet **[composed from documented signatures]**

```ts
// constrain a shape's position: a *transform* hook
const dispose = editor.sideEffects.registerBeforeChangeHandler('shape', (prev, next, source) => {
  if (next.parentId !== prev.parentId) return prev; // veto reparenting
  return { ...next, x: snap(next.x), y: snap(next.y) }; // transform the record
});

// react to a change by touching *other* records: an "after" hook
editor.sideEffects.registerAfterChangeHandler('shape', (prev, next) => {
  /* move children */
});

// transaction boundary
editor.sideEffects.registerOperationCompleteHandler(() => {
  /* commit-time work */
});
```

Signatures and transform/veto semantics per [StoreSideEffects reference](https://tldraw.dev/reference/store/StoreSideEffects).

### Inferences

- **This is the template for ngx-vflow.** `registerBeforeChangeHandler('node', ...)` ≈ "a plugin wants to constrain/snap a node position before it is committed"; `registerAfterChangeHandler` ≈ "a plugin wants to move children when the parent moved" (the cytoscape-automove use case); `registerOperationCompleteHandler` ≈ "emit a single change event per drag-commit rather than per frame".
- The before/after split is the cleanest expression of the **transform vs. cascade** distinction in this whole survey, and the docs' rule ("before = only the target record; after = other records") is the discipline that makes it terminate. ngx-vflow should adopt that rule verbatim, because Angular has no equivalent of a fixed-point reconciliation loop to save a plugin that violates it.
- tldraw's `ShapeUtil` is the **(d) override/strategy slot** done right: one implementation per `type` key, registered in a map, with a static schema for its props. This maps onto ngx-vflow "node type registry" almost 1:1 and is more Angular-friendly than CodeMirror facets because Angular components already fill the `component()` role.
- Runtime validators (`static props = { w: T.number }`) alongside TS types exist because records are persisted and synced. If ngx-vflow plugins contribute persisted node data, the same double-declaration cost appears.

### Gaps

- The reference page did **not** document handler execution order when multiple handlers are registered for the same `typeName` ("No explicit mention of handler execution order"). This is a notable omission for a plugin system — with no priority mechanism, tldraw side effects are effectively registration-order and last-transform-wins.
- Could not retrieve the tldraw tools/`StateNode` or bindings API detail, nor Steve Ruiz's architecture blog posts, within the tool budget.

---

## Q6. Cytoscape.js — a global extension registry, and `automove` as the "children follow parents" precedent

### Takeaway

Cytoscape registers extensions into a **global namespaced registry** (`cytoscape.use()`), with distinct categories (core, collection, layout, renderer) that determine where the extension's methods are grafted. `cytoscape-automove` is a directly relevant precedent: a declarative _rule_ object that keeps nodes positioned relative to other nodes.

### Cited Findings

- Extensions are registered via `cytoscape.use()`; the project advertises being "Fully extendable (and extensions can be autoscaffolded for you)" with roughly 70 extensions. — [js.cytoscape.org](https://js.cytoscape.org/)
- Extension categories include layout extensions (fCoSE, CoSE Bilkent, Cola, ELK, Dagre, Klay), UI extensions (cxtmenu, edgehandles, popper, automove), collection extensions ("Extension function: This function is intended for use in extensions"), and renderer extensions. — [js.cytoscape.org](https://js.cytoscape.org/)
- Namespacing convention for extension-owned data on elements: app-level scratchpad data uses "namespaces prefixed with underscore, like `'_foo'`" while "extension fields [are] unprefixed" in the `scratch` data model (`cy.scratch()`, `cy.removeScratch()`). — [js.cytoscape.org](https://js.cytoscape.org/)
- `cytoscape-automove`: registered with `cytoscape.use(automove)` across ESM/CJS/AMD/script-tag; the API is `cy.automove(options)` and it returns a **rule handle** with `apply()`, `enabled()`, `toggle()`, `disable()`, `enable()`, `destroy()`. — [cytoscape-automove](https://github.com/cytoscape/cytoscape.js-automove)
- Automove rule options: `nodesMatching` (function, selector, or collection) selects targets; `reposition` accepts a custom function, `'mean'` (position at neighbourhood average), `'viewport'` (constrain within visible area), `'drag'` (link movement to specified master nodes), or a bounding box `{x1,y1,x2,y2}` with `'inside'`/`'outside'` type; `when` controls repositioning timing; `meanIgnores` excludes nodes from the mean; `dragWith` designates nodes whose dragging triggers updates. — [cytoscape-automove](https://github.com/cytoscape/cytoscape.js-automove)
- Repositioned nodes emit an `'automove'` event, "enabling downstream reactions or monitoring." — [cytoscape-automove](https://github.com/cytoscape/cytoscape.js-automove)

### Snippet **[composed from documented API]**

```js
import cytoscape from 'cytoscape';
import automove from 'cytoscape-automove';

cytoscape.use(automove); // global registry, once per app

const rule = cy.automove({
  nodesMatching: (node) => node.data('follows'), // selector | collection | predicate
  reposition: 'drag', // 'mean' | 'viewport' | 'drag' | fn | bbox
  dragWith: cy.$('#parent'), // masters whose drag triggers the rule
  when: 'matching', // when the rule re-evaluates
});

rule.disable();
rule.enable();
rule.destroy(); // rule handle = lifecycle control
// repositioned nodes emit 'automove'
```

Options and handle methods per [cytoscape-automove](https://github.com/cytoscape/cytoscape.js-automove).

### Inferences

- The **rule handle** pattern (`{apply, enable, disable, destroy}`) is a better fit for Angular than a global registry: it is exactly `DestroyRef`-friendly, and a rule can be created inside a component and torn down with it. ngx-vflow should return a disposable handle from every plugin registration (as tldraw, Lexical and CodeMirror's `Compartment.reconfigure` all effectively do).
- `reposition` accepting either a **named strategy** or a **function** is a cheap and very usable API for the (d) strategy-slot category: ship 3–4 named strategies, escape-hatch to a function. Worth copying for ngx-vflow edge path computation and node-constraint plugins.
- A **global** `cytoscape.use()` registry is the pattern to _avoid_ in Angular: it makes two flows on the same page unable to have different plugin sets, and defeats lazy-loaded feature modules. Prefer per-flow (DI-scoped) registration with an optional root-level default set.
- The `scratch` prefix convention (`_foo` for app, unprefixed for extensions) is a low-tech namespace collision policy — ngx-vflow would do better with a branded key (`ExtensionKey<T>`) as ProseMirror's `PluginKey` does.

### Gaps

- Could not retrieve the primary documentation for the **registration signatures** `cytoscape('core', name, fn)`, `cytoscape('collection', ...)`, `cytoscape('layout', name, LayoutClass)`, `cytoscape('renderer', ...)` or the layout-class contract (`run()`, `stop()`, `layoutstart`/`layoutstop` events) — the GitHub markdown paths I tried 404'd and the main site page fetch summarized rather than quoted. Treat those exact signatures as unverified.

---

## Q7. Build pipelines — Rollup/Vite and tapable (the hook-type taxonomy)

### Takeaway

tapable is the canonical **taxonomy** of hook types (basic / waterfall / bail / loop × sync / async-series / async-parallel), and it is the only system here with both `stage` (numeric) and `before` (name-reference) ordering. Rollup/Vite give the same taxonomy less formally (`first` / `sequential` / `parallel`) plus a three-bucket ordering (`pre` / normal / `post`).

### Cited Findings (tapable)

- Execution patterns: **Basic** hooks "simply call every function tapped in a row"; **Waterfall** hooks pass "a return value from each function to the next function"; **Bail** hooks "allow exiting early" when any tap returns a non-undefined value; **Loop** hooks "restart from the first plugin" whenever a tap yields a non-undefined result. — [tapable](https://github.com/webpack/tapable)
- Nine classes: `SyncHook`, `SyncBailHook`, `SyncWaterfallHook`, `SyncLoopHook`, `AsyncParallelHook`, `AsyncParallelBailHook`, `AsyncSeriesHook`, `AsyncSeriesBailHook`, `AsyncSeriesWaterfallHook`. — [tapable](https://github.com/webpack/tapable)
- Registration variants: `tap(name, fn)`, `tapAsync(name, fn)` (node-style `(err, result)` callback), `tapPromise(name, fn)`. — [tapable](https://github.com/webpack/tapable)
- Ordering: taps can pass `{ name, stage, before }` where "Lower stages run first (default: 0)" and `before` names taps to run before. `withOptions()` creates a facade with pre-set defaults. — [tapable](https://github.com/webpack/tapable)
- `intercept()` gives meta-hooks: `call`, `tap`, `loop`, `error`, `result`, `done`, `register` — including the ability to rewrite a `tapInfo` at registration time. "Interceptors are invoked in registration order before the taps." — [tapable](https://github.com/webpack/tapable)
- A shared `context` object can be opted into per-tap (`{ name, context: true }`) — a typed-ish side channel between plugins in one hook call. — [tapable](https://github.com/webpack/tapable)
- `HookMap` "lazily creates hooks per key": `keyedHook.for('some-key').tap(...)` on the plugin side, `keyedHook.get('some-key')` on the owner side (returns `undefined` rather than creating). — [tapable](https://github.com/webpack/tapable)
- Performance mechanism: "the hook compiles a specialized function using `new Function(...)` and caches it on the instance", recompiling on any `tap*()` or `intercept()`. — [tapable](https://github.com/webpack/tapable)

### Snippet **[verbatim from docs]**

```javascript
const hook = new SyncWaterfallHook(['value']);
hook.tap('Double', (v) => v * 2);
hook.tap('PlusOne', (v) => v + 1);
hook.call(3); // Returns 7: (3 * 2) + 1

hook.tap(
  { name: 'MyPlugin', stage: -10, before: 'OtherPlugin' }, // ordering controls
  (...args) => {
    /* ... */
  },
);

const keyedHook = new HookMap((key) => new SyncHook(['arg']));
keyedHook.for('some-key').tap('MyPlugin', (arg) => {
  /* ... */
});
const h = keyedHook.get('some-key'); // does NOT create
if (h !== undefined) h.callAsync('arg', (err) => {});
```

— [tapable](https://github.com/webpack/tapable)

### Cited Findings (Rollup / Vite)

- A Rollup plugin is an object with `name` (string, "identifies the plugin in logs and errors"), optional `version` ("for inter-plugin communication"), and hooks. — [Rollup plugin development](https://rollupjs.org/plugin-development/)
- Hook kinds: `async`, `sync`, **`first`** ("Run sequentially until a hook returns non-null/undefined value"), **`sequential`** ("Execute all plugins in order; async hooks block subsequent ones"), **`parallel`** ("Execute all plugins in order; async hooks don't block others"). — [Rollup plugin development](https://rollupjs.org/plugin-development/)
- Hooks may be objects rather than functions: `{ order: 'pre' | 'post' | null, handler(...) {}, sequential?: boolean, filter?: ... }`; `filter` runs the hook "only when `id` or `code` matches specified patterns". — [Rollup plugin development](https://rollupjs.org/plugin-development/)
- Order resolution: `order: 'pre'` plugins first, unspecified in config order, `'post'` last; within the same level config sequence is preserved; `sequential: true` forces serialization inside a parallel hook. — [Rollup plugin development](https://rollupjs.org/plugin-development/)
- Two phases with disjoint hook sets: build hooks (triggered by `rollup.rollup()`, `options` → `buildEnd`) and output-generation hooks (`bundle.generate()`/`write()`, `outputOptions` → `generateBundle`/`writeBundle`/`renderError`). — [Rollup plugin development](https://rollupjs.org/plugin-development/)
- Vite's documented plugin pipeline order: **Alias → user `enforce: 'pre'` → Vite core plugins → user plugins (no enforce) → Vite build plugins → user `enforce: 'post'` → Vite post-build plugins** (minify, manifest, reporting). — [Vite Plugin API](https://vite.dev/guide/api-plugin)
- Conditional application: `apply: 'build' | 'serve'` or `apply(config, { command }) { return command === 'build' && !config.build.ssr }`. — [Vite Plugin API](https://vite.dev/guide/api-plugin)
- "It is common convention to author a Vite/Rolldown/Rollup plugin as a factory function that returns the actual plugin object." A plugin may also return an **array of plugins** for composite features. — [Vite Plugin API](https://vite.dev/guide/api-plugin)
- Virtual-module convention: `virtual:my-module` externally, resolved to `'\0' + id` internally to mark it virtual. — [Vite Plugin API](https://vite.dev/guide/api-plugin)
- **Pain point:** community discussion notes `enforce` may be "too generic" and can create incompatibilities with other consumers of the Rollup plugin ecosystem; plugin authors are advised that "enforcing plugin position should be an implementation detail for Vite plugins", i.e. the plugin should set it, not the user. — [vitejs/vite Discussion #1815](https://github.com/vitejs/vite/discussions/1815); [Discussion #9613 "Hook ordering"](https://github.com/vitejs/vite/discussions/9613); [Issue #1264 "Provide an option to specify plugin order"](https://github.com/vitejs/vite/issues/1264)

### Snippet **[verbatim from docs]**

```javascript
// Vite/Rollup plugin factory + ordering + conditional application
export default function myPlugin(options = {}) {
  return {
    name: 'my-plugin',              // required
    enforce: 'pre',                 // pre | post  (Vite's 3-bucket order)
    apply(config, { command }) { return command === 'build' && !config.build.ssr },
    resolveId: {
      order: 'pre',                 // Rollup's per-hook order override
      handler(source) { /* 'first' kind: return non-null to win */ },
    },
  }
}
// composite feature = array of plugins
export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

— [Vite Plugin API](https://vite.dev/guide/api-plugin) and [Rollup plugin development](https://rollupjs.org/plugin-development/)

### Inferences

- tapable's taxonomy is the right vocabulary for documenting ngx-vflow's extension points, but tapable's _implementation_ (codegen via `new Function`) is inapplicable — Angular libraries ship to CSP-restricted environments and `new Function` is banned under strict CSP.
- `before: "OtherPlugin"` (name reference) is strictly more expressive than a numeric stage but introduces unsatisfiable/cyclic constraints and requires a topological sort. Given Tiptap's and Vite's experience, ngx-vflow should prefer the **bucketed** model (`pre` / default / `post`, or CodeMirror's five `Prec` levels) and avoid name references entirely.
- Rollup's `filter` on a hook (only run when id/code matches) is a performance pattern that transfers directly: an ngx-vflow node-change hook should be registrable per node-type (like tldraw's `typeName` parameter, like tapable's `HookMap`) so 50 plugins don't all run on every pointermove.
- Vite's lesson — "enforce should be the plugin's implementation detail, not the user's knob" — argues for ngx-vflow plugins declaring their own precedence in their factory, with the user array order as the tiebreak only.

---

## Q8. Chart.js — the simplest usable hook-based plugin API, plus the best typing story

### Takeaway

Chart.js is the minimal viable design: a plain object with an `id`, a flat list of `before*`/`after*` lifecycle hooks, `defaults`, per-chart or global registration, options auto-namespaced under `options.plugins[id]`, and typed via `PluginOptionsByType` declaration merging. Some hooks can return `false` to cancel.

### Cited Findings

- A plugin is "an object with a unique `id` and implementation methods", optionally with a `defaults` object. — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- Hook families: init (`beforeInit`/`afterInit`), update (`beforeUpdate`/`afterUpdate`), render (`beforeDraw`/`afterDraw`/`beforeDatasetsDraw`/`afterDatasetsDraw`), event hooks, destruction (`afterDestroy`, preferred over the deprecated `destroy`). — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- "Hooks can return `false` to cancel certain processes, though not all hooks support cancellation." — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- Registration: global via `Chart.register({ id: 'p1', beforeInit: () => {} })`, per-chart via `new Chart(ctx, { plugins: [plugin] })`; inline plugins "cannot be registered globally". — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- Options are namespaced under `options.plugins.{plugin-id}`; a plugin is disabled by setting its options to `false`, and all plugins by `options.plugins: false`. — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- TypeScript: declaration merging in a `.d.ts` augments `PluginOptionsByType`. — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)

### Snippet **[verbatim from docs]**

```javascript
const plugin = {
  id: 'custom-plugin', // namespace for options + registry identity
  beforeInit: (chart, args, options) => {
    /* ... */
  },
  afterDraw: (chart, args, options) => {
    /* ... */
  },
  defaults: {/* default options, merged into options.plugins['custom-plugin'] */},
};

Chart.register(plugin); // global
new Chart(ctx, { plugins: [plugin] }); // per-chart
new Chart(ctx, { options: { plugins: { 'custom-plugin': { color: 'blue' } } } });
```

```typescript
declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    customPlugin?: { color?: string };
  }
}
```

— [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)

### Inferences

- The **id-as-namespace** trick (`id` drives both registry identity, options key, and the augmentation key) is the highest value-per-complexity idea in this survey and transfers to ngx-vflow directly: one string identifies the plugin, keys its options object, keys its contributed state, and keys the `declare module` augmentation.
- Global-vs-per-instance registration matters even more in Angular than in Chart.js: a root `provideVflowPlugins()` (app-wide defaults) plus a per-`<vflow>` `plugins` input mirrors Chart.js exactly and avoids cytoscape's global-only problem.
- The `defaults` field + "set options to `false` to disable" combination gives runtime reconfiguration without a compartment mechanism — a cheap substitute when the plugin's behaviour is option-driven rather than structural.

### Gaps

- Could not find a specific, citable complaint thread about Chart.js plugin option _typing_ pain (the assignment hypothesised one). No reliable source found; do not assert one.

---

## Q9. Hook taxonomy — which library is the cleanest example of each category

### Takeaway

All seven requested categories exist in the wild with a clear best-in-class example; the two categories that are hardest to retrofit onto Angular signals are (b) transform/waterfall and (c) bail/veto, because both require intercepting a _proposed_ value before it becomes state.

### Cited Findings (mapping, each backed by the sources above)

- **(a) Observe-only / events** — tldraw `registerAfterChangeHandler` / `registerAfterCreateHandler` (side-effects that touch other records) — [tldraw](https://tldraw.dev/reference/store/StoreSideEffects); Chart.js `afterDraw`/`afterUpdate` — [Chart.js](https://www.chartjs.org/docs/latest/developers/plugins.html); tapable `SyncHook` ("return values ignored") — [tapable](https://github.com/webpack/tapable).
- **(b) Transform / waterfall** — tapable `SyncWaterfallHook`/`AsyncSeriesWaterfallHook` is the canonical definition ("pass a return value from each function to the next") — [tapable](https://github.com/webpack/tapable); best _domain_ example: tldraw `registerBeforeChangeHandler` returning a modified record — [tldraw](https://tldraw.dev/reference/store/StoreSideEffects); CodeMirror `transactionFilter` "gets a chance to update or replace transaction specs before they are applied" — [CodeMirror ref](https://codemirror.net/docs/ref/).
- **(c) Bail / veto** — Lexical `registerCommand` (highest→lowest priority, "until a listener returns true") — [Lexical](https://lexical.dev/docs/concepts/commands); ProseMirror `filterTransaction` (return false) and props resolution ("until one of them returns true") — [ProseMirror](https://prosemirror.net/docs/ref/); tapable `SyncBailHook`; Rollup's **`first`** hook kind ("run sequentially until a hook returns non-null/undefined") — [Rollup](https://rollupjs.org/plugin-development/); Chart.js "return `false` to cancel" — [Chart.js](https://www.chartjs.org/docs/latest/developers/plugins.html).
- **(d) Override / strategy slot (exactly one impl)** — tldraw `ShapeUtil` keyed by `static type` and registered via `shapeUtils={[...]}` — [tldraw shapes](https://tldraw.dev/docs/shapes); Cytoscape layouts registered by name — [js.cytoscape.org](https://js.cytoscape.org/); Slate's method overriding with delegation to the previous implementation — [Slate](https://docs.slatejs.org/concepts/08-plugins); CodeMirror's single-value facets that "take the value with the highest precedence" — [CodeMirror guide](https://codemirror.net/docs/guide/).
- **(e) State contributions** — CodeMirror `StateField.define({create, update, compare, provide})` (reducer, comparable, can itself provide extensions) — [CodeMirror ref](https://codemirror.net/docs/ref/); ProseMirror `spec.state` + `PluginKey.getState()` — [ProseMirror](https://prosemirror.net/docs/ref/); Tiptap `addStorage()` → `editor.storage.name` (mutable, not transactional) — [Tiptap](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing); Cytoscape `cy.scratch()` namespaced scratchpad — [js.cytoscape.org](https://js.cytoscape.org/).
- **(f) UI contributions / render slots** — ProseMirror `props.decorations` and `props` generally — [ProseMirror](https://prosemirror.net/docs/ref/); tldraw `ShapeUtil.component()` / `getIndicatorPath()` — [tldraw shapes](https://tldraw.dev/docs/shapes); Chart.js `beforeDraw`/`afterDraw` layered drawing — [Chart.js](https://www.chartjs.org/docs/latest/developers/plugins.html).
- **(g) Commands / actions registration** — Lexical `createCommand` + `registerCommand` + `dispatchCommand` (typed payload, priority, unsubscribe) — [Lexical](https://lexical.dev/docs/concepts/commands); Tiptap `addKeyboardShortcuts()` binding keys to `this.editor.commands.*` — [Tiptap](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing).
- **(h) Lifecycle (init/destroy/reconfigure)** — CodeMirror `Compartment.of/reconfigure/get` + `StateEffect.reconfigure`/`appendConfig` is the only true _reconfiguration_ design here — [CodeMirror ref](https://codemirror.net/docs/ref/); ProseMirror `spec.view` returning `{update, destroy}` — [ProseMirror](https://prosemirror.net/docs/ref/); Chart.js `beforeInit`/`afterDestroy` — [Chart.js](https://www.chartjs.org/docs/latest/developers/plugins.html); cytoscape-automove's rule handle `{apply, enable, disable, destroy}` — [cytoscape-automove](https://github.com/cytoscape/cytoscape.js-automove); every `register*` in tldraw and Lexical returns an unsubscribe function — [tldraw](https://tldraw.dev/reference/store/StoreSideEffects), [Lexical](https://lexical.dev/docs/concepts/commands).

### Inferences

- **Transferable to signals with no friction:** (a) events, (d) strategy slots, (e) state contributions (a plugin owning a `signal`/`computed` slice), (f) UI contributions (Angular components/directives + a `ViewContainerRef` slot), (g) commands (a registry map + priority list), (h) lifecycle (`DestroyRef`, and "reconfigure" as simply writing a new value into a config signal — Angular signals make CodeMirror's `Compartment` almost unnecessary, since a compartment is essentially a mutable cell inside an immutable config tree).
- **Depends on an immutable transaction model:** (b) transform/waterfall and (c) bail/veto. CodeMirror `transactionFilter`, ProseMirror `filterTransaction`/`appendTransaction` and tldraw's before-handlers all depend on there being a _proposed_ change object that exists before commit. A `WritableSignal` has no such object: by the time an `effect()` observes `nodes()`, the write already happened. To get (b) and (c) in ngx-vflow you must **manufacture the proposal**: route every mutation through an intent API (`flow.apply(intent)` / a `commit()` funnel) rather than letting app code call `signal.set()` directly, or at minimum route _drag/connect_ interactions through such a funnel while leaving app-owned state free.
- Corollary: since ngx-vflow's state is deliberately **application-owned** via signals, the veto/transform pipeline can only cover changes the _library_ originates (drag, resize, connect, selection, viewport). Changes the app makes by writing its own signals will bypass every before-hook. That asymmetry should be documented as a hard boundary rather than papered over — tldraw avoids it only because it owns the store.

---

## Q10. Typing strategies

### Takeaway

Three distinct strategies are in use: **module augmentation / declaration merging** (Chart.js, tldraw, Tiptap), **generic chaining through a mutator list** (Zustand middleware), and **branded keys carrying a payload type** (ProseMirror `PluginKey<T>`, Lexical `createCommand`, CodeMirror `Facet<Input, Output>`). Only the first is truly open-world; the third is the cheapest and composes best.

### Cited Findings

- **Declaration merging for options:** Chart.js augments `PluginOptionsByType<TType>` in a `.d.ts`; "This approach provides static typing for custom plugin options." — [Chart.js plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- **Declaration merging for a record/shape registry:** tldraw's `declare module 'tldraw' { export interface TLGlobalShapePropsMap { [CARD_TYPE]: {...} } }`. — [tldraw shapes](https://tldraw.dev/docs/shapes)
- **Generic parameterisation carried through inheritance:** Tiptap's `Extension<Options, Storage>`, with `configure()` and `extend()` returning re-parameterised types (`extend()` → `Extension<ExtendedOptions, ExtendedStorage>`). — [packages/core/src/Extension.ts](https://raw.githubusercontent.com/ueberdosis/tiptap/main/packages/core/src/Extension.ts)
- **Branded keys:** ProseMirror `PluginKey` with `get()`/`getState()` — "You can have only one plugin with a given key in a given state." — [ProseMirror reference](https://prosemirror.net/docs/ref/)
- **Typed facets/effects as tokens:** `Facet.define<string>()`, `StateEffect.define<boolean>()`. — [CodeMirror guide](https://codemirror.net/docs/guide/)
- **Known typing breakage from a config field:** Tiptap v3's `priority` "breaks types when inside of `extends`", workaround being a second `.extend()` call. — [Issue #6275](https://github.com/ueberdosis/tiptap/issues/6275)

### Inferences

- For ngx-vflow, the Angular-native analogue of Zustand's mutator chaining is `signalStoreFeature` (NgRx Signals), which threads the accumulated state/computed/method shape through generics. That is the right tool if plugins must _extend the store's public type_. It is, however, notoriously hard to type-error-message well — the same class of complaint as Zustand's curried `create<T>()(...)` workaround.
- The pragmatic recommendation: use **branded keys** (`ExtensionKey<TState, TOptions>`) for plugin-owned state and commands (zero declaration-merging burden, works with lazy loading, keeps errors local), and reserve **module augmentation** for the _one_ place where open-world extension of a public interface is genuinely required — the node/edge type registry, exactly as tldraw does with `TLGlobalShapePropsMap`.
- Avoid making the flow's own type depend on the plugin list (i.e. avoid `Vflow<[PluginA, PluginB]>`); Tiptap's `priority`-in-`extend()` type break and Zustand's curry workaround are both symptoms of that dependency.

### Gaps

- **Zustand typing details could not be sourced.** Three attempts at the Zustand TypeScript guide (`zustand.docs.pmnd.rs/guides/typescript`, and both the `.md`/`.mdx` raw GitHub paths) returned 404. The specifics requested in the assignment — the rationale for the curried `create<T>()(...)`, the meaning of `StateCreator<T, Mps, Mcs, U>`'s mutator lists, and the `declare module 'zustand/vanilla' { interface StoreMutators<S, A> }` augmentation for authoring a type-mutating middleware — are **not sourced here and must not be asserted by the report writer** without an independent check.
- No sources gathered for Redux middleware/enhancers, XState, Yjs / y-prosemirror, Milkdown, Excalidraw, Konva/Fabric `controls`, Pixi.js, unified/remark, ESLint/Babel visitor merging, or Vega — these fell outside the tool budget after the priority group. Milkdown and y-prosemirror in particular would be relevant (both are "plugin built on another plugin system") and are unaddressed.

---

## Q11. Synthesis: what to adapt for a signals-based Angular node engine

### Takeaway

The recommended shape is **tldraw's side-effect pipeline + Chart.js's id-as-namespace + CodeMirror's precedence rule + cytoscape's disposable rule handle**, deliberately _not_ CodeMirror's facet/dynamic-value machinery, which Angular `computed()` already subsumes.

### Inferences (all derived from the cited findings above)

1. **One canonical ordered plugin list.** Resolve precedence once — category first, array position second, as CodeMirror does ([guide](https://codemirror.net/docs/guide/)) — and derive every subsystem's order from that single list. Tiptap's two priority bugs ([#1547](https://github.com/ueberdosis/tiptap/issues/1547), [#1154](https://github.com/ueberdosis/tiptap/issues/1154)) came from multiple subsystems interpreting a number independently.
2. **Before/after split with the tldraw discipline.** `before*` handlers may transform or veto but must touch only the target record; `after*` handlers may touch other records ([tldraw](https://tldraw.dev/reference/store/StoreSideEffects)). Without this rule you inherit ProseMirror's `appendTransaction` infinite-loop class of bug ([discuss thread](https://discuss.prosemirror.net/t/append-transaction-infinite-loops/2693)) with none of ProseMirror's cycle protection.
3. **Manufacture a proposal object for drag/connect/resize.** Every (b)/(c) hook in this survey needs a pre-commit value. Signals don't provide one; an intent/commit funnel does. Scope it to library-originated changes and document that app-originated signal writes bypass hooks.
4. **Register per-type, not globally per-event.** tldraw's `typeName` parameter, tapable's `HookMap`, and Rollup's hook `filter` all exist to avoid running every plugin on every event ([tldraw](https://tldraw.dev/reference/store/StoreSideEffects), [tapable](https://github.com/webpack/tapable), [Rollup](https://rollupjs.org/plugin-development/)). For pointermove-rate hooks this is a correctness-of-performance requirement, not an optimisation.
5. **Everything returns a disposer.** Uniform across tldraw, Lexical, cytoscape-automove and CodeMirror compartments; maps onto `DestroyRef`/`takeUntilDestroyed`.
6. **Two registration scopes:** root-level defaults plus per-`<vflow>` overrides, like Chart.js global vs per-chart registration ([Chart.js](https://www.chartjs.org/docs/latest/developers/plugins.html)); avoid cytoscape's single global registry ([js.cytoscape.org](https://js.cytoscape.org/)).
7. **Skip compartments.** `Compartment.reconfigure` ([CodeMirror ref](https://codemirror.net/docs/ref/)) exists to mutate one subtree of an immutable config. In Angular, a plugin's options being an `input()`/`signal` gives the same capability natively — this is a case where the signals model is _simpler_, not weaker.
8. **Named strategy or function** for single-implementation slots (edge path computation, layout, snapping), following cytoscape-automove's `reposition: 'mean' | 'viewport' | 'drag' | fn` ([automove](https://github.com/cytoscape/cytoscape.js-automove)).
9. **Plugin name is a data-format commitment** if plugin-contributed state is serialized — Tiptap explicitly warns names cannot be changed once content references them ([Tiptap](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing)).
10. **Precedence should be the plugin's own decision, not the user's knob** — Vite's community conclusion about `enforce` ([Discussion #1815](https://github.com/vitejs/vite/discussions/1815)).

### Gaps

- No sources found describing anyone building a plugin system specifically over **Angular signals** (vs. React/immutable stores); the signals-specific recommendations above are inference from the cited designs, not observed practice, and should be labelled as such in the final report.
