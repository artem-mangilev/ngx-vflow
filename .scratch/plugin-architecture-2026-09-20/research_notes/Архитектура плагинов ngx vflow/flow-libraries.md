# Plugin & extension architecture of node-based / flow / diagram libraries

Scope: what counts as a "plugin", how it registers, which hooks it can subscribe to, whether it can intercept / veto / transform interactions, how it contributes UI, how it reaches internals, ordering, typing, packaging. Explicit split between **formal plugin systems** and **ad-hoc "hooks + examples"**.

---

## Q1. Which hook categories do these libraries expose (observe / transform / veto / strategy slot / state / UI / commands)?

### Takeaway

Only three libraries here have a _formal, first-class_ plugin system with a registration contract and a lifecycle: **Rete.js v2** (Scope + typed signal pipes), **diagram-js/bpmn-js** (didi DI modules + prioritised EventBus + CommandStack), and **AntV X6** (`Graph.use()`), with **LogicFlow**, **maxGraph** and **Blockly** as lighter formal registries. React Flow / Svelte Flow / Vue Flow / JointJS / GoJS are "options + registries + subclassing + examples". The formal systems are the only ones where third-party code can _transform_ or _veto_ an interaction mid-flight without forking. Baklava.js v2 is the notable counter-example: it **deleted** its v1 plugin concept and replaced it with a typed event/hook pipeline.

The four recurring hook kinds, present in some form almost everywhere:

1. **observe** — fire-and-forget events (Drawflow/LogicFlow/Vue Flow emitters, GoJS DiagramEvents, React Flow `onNodeDrag`)
2. **veto** — Baklava `PreventableBaklavaEvent`, diagram-js `Rules`, Rete present-tense signals, React Flow `isValidConnection` / `onBeforeDelete`, maxGraph `isValidConnection`, LogicFlow `addNodeMoveRules`
3. **transform** — diagram-js prioritised mutable drag events, Rete `nodetranslate` pipe, Baklava `SequentialHook`, GoJS `Part.dragComputation`, yFiles `addWrapperFactory`, React Flow `experimental_useOnNodesChangeMiddleware`
4. **strategy slot** — routers/connectors/anchors/layouters/draggers: diagram-js `layouter` service, GoJS `Layout`/`Link.routing`, maxGraph `EdgeStyleRegistry`/`LayoutManager.getLayout`, Blockly `registry.Type.BLOCK_DRAGGER`, JointJS `joint.routers`, X6 `Graph.registerRouter`, yFiles `ILookup`

---

## Rete.js v2 — the closest thing to a formal plugin system in a flow library

### Cited Findings

- **What a plugin is:** a class extending `Scope`. "Plugins offer the ability to add new functionality mostly through a single entry point." Plugins connect to a parent scope (usually `NodeEditor`) and intercept signals flowing through it — [Rete Plugin system](https://retejs.org/docs/concepts/plugin-system/)
- **Scope typing:** a scope declares the signals it _produces_ and the signals it _expects_ from its parent; TypeScript enforces compatibility — [Rete Plugin system](https://retejs.org/docs/concepts/plugin-system/):
  ```ts
  const parentScope = new Scope<number>('parent');
  const childScope = new Scope<string, [number]>('child');
  ```
- **Registration:** `parent.use(child)` — plugins attach to the editor _or to other plugins_ (a cascade), and signals propagate parent → child "in the order they are connected"; the docs warn order matters, e.g. "it can be important when including plugins such as `rete-readonly-plugin`" — [Rete Plugin system](https://retejs.org/docs/concepts/plugin-system/)
- **Interception:** `addPipe(context => ...)` registers middleware over the signal stream, run in registration order.
- **Veto:** returning `undefined` from a pipe stops propagation — [Rete Plugin system](https://retejs.org/docs/concepts/plugin-system/):
  ```ts
  childScope.addPipe((context) => {
    if (context === 'b') return; // prevent propagation
    return context;
  });
  ```
- **Core signals of `NodeEditor`**, verbatim — [retejs/rete editor.ts](https://github.com/retejs/rete/blob/main/src/editor.ts):
  ```ts
  export type Root<Scheme extends BaseSchemes> = { type: 'nodecreate'; data: Scheme['Node'] } | { type: 'nodecreated'; data: Scheme['Node'] } | { type: 'noderemove'; data: Scheme['Node'] } | { type: 'noderemoved'; data: Scheme['Node'] } | { type: 'connectioncreate'; data: Scheme['Connection'] } | { type: 'connectioncreated'; data: Scheme['Connection'] } | { type: 'connectionremove'; data: Scheme['Connection'] } | { type: 'connectionremoved'; data: Scheme['Connection'] } | { type: 'clear' } | { type: 'clearcancelled' } | { type: 'cleared' };
  ```
  The present-tense/past-tense pairing **is** the veto protocol. `addNode` is literally:
  ```ts
  async addNode(data: Scheme['Node']) {
    if (this.getNode(data.id)) throw new Error('node has already been added')
    if (!await this.emit({ type: 'nodecreate', data })) return false
    this.nodes.push(data)
    await this.emit({ type: 'nodecreated', data })
    return true
  }
  ```
  A plugin returning `undefined` from a `nodecreate` pipe makes `addNode()` return `false` and nothing is added. Signals are **async** (`await this.emit(...)`) — [retejs/rete editor.ts](https://github.com/retejs/rete/blob/main/src/editor.ts)
- **Area (viewport) signals** — [retejs/area-plugin](https://github.com/retejs/area-plugin/blob/main/src/index.ts):
  ```ts
  export type Area2D<Schemes extends BaseSchemes> = BaseArea<Schemes> | { type: 'translate'; data: TranslateEventParams } | { type: 'translated'; data: TranslateEventParams } | { type: 'zoom'; data: ZoomEventParams } | { type: 'zoomed'; data: ZoomEventParams } | { type: 'resized'; data: { event: Event } };
  ```
  plus `nodepicked`, `nodetranslate`, `nodetranslated`, `nodedragged`, `contextmenu`, `render`, `unmount`, `reordered`. `nodetranslate` is emitted as `this.emit({ type: 'nodetranslate', data: { id, ...data } })` — present-tense, so it is both **transformable** (mutate the position) and **vetoable**.
- **Reaching internals:** `childScope.parentScope()` for the immediate parent, `childScope.parentScope<Root>(Root)` to walk up to a typed ancestor — [Rete Plugin system](https://retejs.org/docs/concepts/plugin-system/). There is no global store; the scope chain _is_ the API object.
- **UI contribution is split in two:** the logic plugin emits a `render` signal with a type; a **render preset** on the framework render plugin decides what DOM to draw. Minimap = `area.use(minimap)` for logic + `render.addPreset(Presets.minimap.setup({ size: 200 }))` for UI — [Rete minimap guide](https://retejs.org/docs/guides/minimap/). Angular is a first-class render target (`rete-angular-plugin`).
- **Ordering is an explicit, documented concern.** `rete-readonly-plugin` ships _two_ scopes and the docs state: "Make sure to follow the order to connect `readonly.root` and `readonly.area` before any other plugins." — [Rete readonly guide](https://retejs.org/docs/guides/readonly/):
  ```ts
  const readonly = new ReadonlyPlugin<Schemes>();
  editor.use(readonly.root);
  editor.use(area);
  area.use(readonly.area);
  area.use(render);
  ```
- **Packaging:** every plugin is its own npm package — `rete` + `rete-area-plugin`, `rete-area-3d-plugin`, `rete-connection-plugin`, `rete-auto-arrange-plugin`, `rete-context-menu-plugin`, `rete-engine`, `rete-history-plugin`, `rete-minimap-plugin`, `rete-readonly-plugin`, `rete-scopes-plugin`, `rete-connection-reroute-plugin`, `rete-dock-plugin`, `rete-comment-plugin`, `rete-connection-path-plugin`, `rete-render-utils`; renderers `rete-angular-plugin` / `rete-react-plugin` / `rete-vue-plugin` / `rete-svelte-plugin` / `@retejs/lit-plugin` — [Rete docs](https://retejs.org/docs/)
- **Presets instead of option flags** (maintainer rationale): presets are "a set of ready-made features that can be used by default or replaced with an alternative preset", avoiding "dozens of options, each requiring 5-10 more options to customize these features" — [Rete.js 2 announcement](https://dev.to/ni55an/retejs-2-visual-programming-for-reactjs-angular-and-vuejs-2072)
- **Why signals replaced v1 events** (maintainer): "plugins can be connected not only to the editor instance but also to other plugins, resembling a cascade. This enables data, also known as signals, to be transmitted from the parent plugin to all child plugins, where they can be transformed or prevented." The v1 problem: "All events were concentrated in the core. Plugins can create their own events, leading to an overwhelming number of events that aren't isolated." Stated priority: "Flexibility and extensibility have a higher priority than a multitude of features that can be easily enabled with a flag." — [Rete.js 2 announcement](https://dev.to/ni55an/retejs-2-visual-programming-for-reactjs-angular-and-vuejs-2072)
- **Connection validity** is delegated to _presets_, not a single predicate: `findPreset(data)` iterates registered presets, each returning a "flow" object or `null` to decline; `drop(flowContext)` cancels — [rete-connection-plugin](https://github.com/retejs/connection-plugin/blob/main/src/index.ts). Signals `connectionpick` / `connectiondrop`.
- **Undo/redo** is a plugin on the area: `area.use(history)`, `HistoryExtensions.keyboard(history)`; grouping is time-windowed (`getRecent(1000)`, ~200 ms threshold) with manual `history.separate()` / `myAction.separated = true` — [Rete undo-redo guide](https://retejs.org/docs/guides/undo-redo/)

### Compact snippet — Rete pipe plugin

```ts
import { Scope } from 'rete';
import type { BaseSchemes, Root } from 'rete';
import type { Area2D, AreaPlugin } from 'rete-area-plugin';

// A plugin is a Scope. It declares what it emits and what its parent feeds it.
export class GridSnapPlugin<S extends BaseSchemes> extends Scope<never, [Area2D<S>, Root<S>]> {
  constructor(private grid = 16) {
    super('grid-snap');
  }

  // called by area.use(plugin)
  setParent(scope: Scope<Area2D<S> | Root<S>>) {
    super.setParent(scope);

    this.addPipe((context) => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context;

      // TRANSFORM: snap the position before the area applies it
      if (context.type === 'nodetranslate') {
        const { x, y } = context.data.position;
        context.data.position = {
          x: Math.round(x / this.grid) * this.grid,
          y: Math.round(y / this.grid) * this.grid,
        };
      }
      // VETO: forbid deleting locked nodes — returning undefined cancels removeNode()
      if (context.type === 'noderemove' && (context.data as any).locked) return;

      return context;
    });
  }
}
// usage: const area = new AreaPlugin(el); editor.use(area); area.use(new GridSnapPlugin(16))
```

_(Illustrative composition of the documented `Scope` / `addPipe` / `nodetranslate` / `noderemove` APIs cited above; the snapping plugin itself is not shipped by Rete.)_

---

## diagram-js / bpmn-js — formal DI modules + prioritised event bus + command stack

### Cited Findings

- **A plugin is a didi module.** "When talking about _modules_ in the context of diagram-js, we refer to units that provide named services along with their implementation." — [bpmn-js walkthrough](https://bpmn.io/toolkit/bpmn-js/walkthrough/):
  ```javascript
  const MyLoggingPlugin = (eventBus) => {
    eventBus.on('element.changed', (event) => {
      console.log('element ', event.element, ' changed');
    });
  };
  MyLoggingPlugin.$inject = ['eventBus'];

  export default {
    __depends__: [CoreModule],
    __init__: ['myLoggingPlugin'],
    myLoggingPlugin: ['type', MyLoggingPlugin],
  };
  ```
  `__depends__` pulls transitive modules; `__init__` force-instantiates services at startup (a purely side-effectful plugin that nobody injects would otherwise never be constructed).
- **Registration:** `new Modeler({ container, additionalModules: [ OriginModule, require('./custom-rules'), require('./custom-context-pad') ] })` — [bpmn-js walkthrough](https://bpmn.io/toolkit/bpmn-js/walkthrough/)
- **didi semantics:** components declared as `[type|factory|value, definition]`; deps from `$inject`; **"Later modules override earlier declarations sharing the same name, enabling testing and customization without modifying original code."** `Injector.get()` returns lazily-created singletons — [didi README](https://github.com/nikku/didi). This name-override is the single most powerful extension point: a plugin can _replace_ `layouter`, `rules`, `connectionDocking`, etc.
- **EventBus priorities and cancellation** — [EventBus.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/core/EventBus.js):
  - default priority **1000**, **higher runs first** ("listen with custom priority (default=1000, higher is better)")
  - "Returning false from a listener will prevent the events default action (if any is specified)."
  - "To stop an event from being processed further in other listeners execute `Event#stopPropagation`"
  - "Returning anything but `undefined` from a listener will stop the listener propagation" — implementation: `if (returnValue !== undefined) { event.returnValue = returnValue; event.stopPropagation(); }`
- **CommandInterceptor hooks:** `canExecute`, `preExecute`, `preExecuted`, `execute`, `executed`, `postExecute`, `postExecuted`, `revert`, `reverted`. Signature `(events, priority, handlerFn, unwrap, that)`; wiring is event-bus sugar — [CommandInterceptor.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/command/CommandInterceptor.js):
  ```javascript
  var fullEvent = ['commandStack', event, hook]
    .filter(function (e) {
      return e;
    })
    .join('.');
  eventBus.on(fullEvent, priority, unwrap ? unwrapEvent(handlerFn, that) : handlerFn, that);
  ```
  i.e. `commandStack.shape.create.preExecute`. Because commands are the undo unit, anything a `preExecute` interceptor adds to the command context is automatically undoable.
- **Real interceptor** (bpmn-js `CreateBehavior`, reparenting a shape dropped on a Lane to its Participant): `this.preExecute('shape.create', 1500, function(event) { var context = event.context, parent = context.parent, shape = context.shape; ... })` — [CreateBehavior.js](https://github.com/bpmn-io/bpmn-js/blob/develop/lib/features/modeling/behavior/CreateBehavior.js). Note the explicit priority `1500` ordering it against other behaviors.
- **Rules as a veto slot.** `RuleProvider#addRule(actions, priority, fn)` delegates to `canExecute(action, priority, fn)`. Returns: `true` = allow, `false` = disallow, `null` = "a particular interaction shall be ignored", nothing = "pass evaluation to lower priority rules" — [RuleProvider.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/rules/RuleProvider.js). Consumption — [Rules.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/rules/Rules.js):
  ```javascript
  /**
   * This implementation will respond with allow unless anyone objects.
   * @return {boolean|null} Wether the action is allowed. Returns `null` if the action is to be ignored.
   */
  Rules.prototype.allowed = function (action, context) {
    var allowed = true;
    var commandStack = this._commandStack;
    if (commandStack) {
      allowed = commandStack.canExecute(action, context);
    }
    return allowed === undefined ? true : allowed; // map undefined to true, i.e. no rules
  };
  ```
  Core rule names: `elements.move`, `shape.resize`, `connection.create`, `connection.start`, `shape.create`.
- **Connection validity** — [Connect.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/connect/Connect.js):
  ```javascript
  function canConnect(source, target) {
    return rules.allowed('connection.create', { source: source, target: target });
  }
  canExecute = context.canExecute = canConnect(start, hover); // during connect.hover
  if (canExecute !== false) {
    context.source = start;
    context.target = hover;
  }
  ```
  This is diagram-js's `isValidConnection`, but pluggable by _any_ module at any priority instead of one app-supplied callback.
- **Features are modules.** `lib/features/` holds 49 directories: align-elements, attach-support, auto-place, **auto-resize**, auto-scroll, bendpoints, change-support, clipboard, complex-preview, connect, connection-preview, context-pad, copy-paste, create, distribute-elements, dragging, editor-actions, global-connect, **grid-snapping**, hand-tool, hover-fix, hover-tooltip, interaction-events, keep-selection-visible, keyboard-move-selection, keyboard, label-support, lasso-tool, modeling, mouse, move, ordering, outline, overlays, palette, popup-menu, preview-support, replace, resize, root-elements, rules, scheduler, search-pad, search, selection, **snapping**, space-tool, tool-manager, tooltips — [lib/features](https://github.com/bpmn-io/diagram-js/tree/main/lib/features). bpmn-js is "diagram-js + a stack of modules".
- **UI contribution = provider + priority + updater function** — [Palette.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/palette/Palette.js):
  ```javascript
  Palette.prototype.registerProvider = function (priority, provider) {
    if (!provider) {
      provider = priority;
      priority = DEFAULT_PRIORITY;
    }
    this._eventBus.on('palette.getProviders', priority, function (event) {
      event.providers.push(provider);
    });
    this._rebuild();
  };

  function addPaletteEntries(entries, provider) {
    var entriesOrUpdater = provider.getPaletteEntries();
    if (isFunction(entriesOrUpdater)) {
      return entriesOrUpdater(entries);
    } // transform
    forEach(entriesOrUpdater, function (entry, id) {
      entries[id] = entry;
    }); // add/replace
    return entries;
  }
  ```
  A provider returns either a plain entries object (additive/overwrite by id) **or a function receiving the accumulated entries**, which may delete or rewrite earlier providers' entries. `ContextPad.getEntries(target)` uses the same two-mode composition, choosing `getContextPadEntries` vs `getMultiElementContextPadEntries` — [ContextPad.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/context-pad/ContextPad.js)
- **Edge routing is a replaceable named service.** `BaseLayouter#layoutConnection(connection, hints)`: "Return the new layouted waypoints for the given connection. The connection passed is still unchanged; you may figure out about the new connection start / end via the layout hints provided." — [BaseLayouter.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/layout/BaseLayouter.js). `ManhattanLayout` exports `connectPoints(a,b,directions)`, `connectRectangles(source,target,start,end,hints)`, `repairConnection(source,target,start,end,waypoints,hints)`, `tryLayoutStraight(...)`; directions `'h:h' | 'v:v' | 'h:v' | 'v:h'` or explicit sides `{t|r|b|l}`; hints `preferredLayouts`, `preserveDocking: 'source'|'target'`, `connectionStart`/`connectionEnd`. **It does no obstacle avoidance** — routing is purely geometric between the two rectangles — [ManhattanLayout.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/layout/ManhattanLayout.js)

### Compact snippet — diagram-js module + CommandInterceptor + RuleProvider

```javascript
import inherits from 'inherits-browser';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

// 1) veto slot: a rule provider
function MyRules(eventBus) {
  RuleProvider.call(this, eventBus);
}
inherits(MyRules, RuleProvider);
MyRules.$inject = ['eventBus'];
MyRules.prototype.init = function () {
  this.addRule('connection.create', 2000, function (context) {
    return context.source.type !== 'locked'; // true | false | null | undefined
  });
};

// 2) command interceptor: derive a change inside the same undo transaction
function AutoLabel(eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);
  this.postExecuted('shape.create', 1500, function (event) {
    modeling.updateLabel(event.context.shape, 'new');
  });
}
inherits(AutoLabel, CommandInterceptor);
AutoLabel.$inject = ['eventBus', 'modeling'];

// 3) the module = the plugin
export default {
  __init__: ['myRules', 'autoLabel'],
  myRules: ['type', MyRules],
  autoLabel: ['type', AutoLabel],
};
// new Modeler({ container, additionalModules: [ myModule ] })
```

_(Composed from the documented `RuleProvider.addRule`, `CommandInterceptor` hook and didi module APIs cited above; `CreateBehavior.js` is the real-world equivalent.)_

---

## React Flow / xyflow — no formal plugin system

### Cited Findings

- **No formal system, no registry, no lifecycle.** Add-ons live in `packages/react/src/additional-components/` — `Background`, `Controls`, `EdgeToolbar`, `MiniMap`, `NodeResizer`, `NodeToolbar` — re-exported wholesale (`export * from './additional-components';`) from the core entry — [packages/react/src/index.ts](https://github.com/xyflow/xyflow/blob/main/packages/react/src/index.ts). In v12 they are **not** separate npm packages; everything ships in `@xyflow/react`. (v11 did have `@reactflow/background` etc.; that was collapsed.)
- The team uses "plugin" only in test names: ["E2E: Panel Plugin"](https://github.com/xyflow/xyflow/issues/3607), ["E2E: Minimap Plugin"](https://github.com/xyflow/xyflow/issues/3611).
- **Community request for a plugin story, unanswered:** Discussion #4551 "Releasing an installable background plugin" — _"I have developed a hexagonal background and would like to release it as an npm installable package… Are there any examples of best practices how should I go about this?"_ — **no maintainer answer** — [discussions/4551](https://github.com/xyflow/xyflow/discussions/4551). Svelte Flow's docs even advertise "plugins" with a dead link: Discussion #5034 "docs: plugins" — _"searching the docs for 'plugin' also retrieves no matches. Are there currently plugins available?"_ — **no maintainer answer** — [discussions/5034](https://github.com/xyflow/xyflow/discussions/5034). Also relevant to ngx-vflow: [Discussion #5607 "XYFlow for Angular / Framework-agnostic solution"](https://github.com/xyflow/xyflow/discussions/5607).
- **Registration = children + hooks.** `<ReactFlow>` accepts `children`; add-ons read context. Access points: `useReactFlow()` (imperative instance) — [docs](https://reactflow.dev/api-reference/hooks/use-react-flow); `useStore(selector, equalityFn)` / `useStoreApi()` (raw internal Zustand store, exposing internal **actions** as well as reads) — [docs](https://reactflow.dev/api-reference/hooks/use-store), which the docs gate: _"This hook should only be used if there is no other way to access the internal state."_ `<ReactFlowProvider>` is needed outside the subtree.
- **Event props** — [API reference](https://reactflow.dev/api-reference/react-flow): `onNodeDrag`, `onNodeDragStart`, `onNodeDragStop`, `onConnect`, `onConnectStart`, `onConnectEnd` ("will fire regardless of whether a valid connection could be made or not"), `onReconnect`, `onNodesChange`/`onEdgesChange` ("Use this event handler to add interactivity to a controlled flow"), `onError`.
- **Veto hooks:** `isValidConnection` — _"If you return `false`, the edge will not be added to your flow."_; `onBeforeDelete` — _"called before nodes or edges are deleted, allowing the deletion to be aborted by returning `false` or modified by returning updated nodes and edges"_ — [API reference](https://reactflow.dev/api-reference/react-flow).
- **NEW and highly relevant: `experimental_useOnNodesChangeMiddleware(fn)` / `experimental_useOnEdgesChangeMiddleware`**, shipped in **12.10.0** — [What's new 2025-12-04](https://reactflow.dev/whats-new/2025-12-04), [PR #5484](https://github.com/xyflow/xyflow/pull/5484). JSDoc: _"Registers a middleware function to transform node changes."_, marked `@public` — [useOnNodesChangeMiddleware.ts](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnNodesChangeMiddleware.ts). It registers `fn` under a `Symbol()` key in `store.getState().onNodesChangeMiddlewareMap` and unregisters on unmount; the store runs the map as a pipeline before dispatch: `for (const middleware of onNodesChangeMiddlewareMap.values()) { changes = middleware(changes); }` — [store/index.ts](https://github.com/xyflow/xyflow/blob/main/packages/react/src/store/index.ts). The shipped demo `RestrictExtent` is a _component_ that clamps `change.position` — [RestrictExtent.tsx](https://github.com/xyflow/xyflow/blob/main/examples/react/src/examples/Middlewares/RestrictExtent.tsx). **This is a registry-based plugin hook in all but name, and is the closest xyflow gets to a plugin system.** It is React-only — no Svelte Flow equivalent exists (the middleware map lives only in `packages/react/src/store/`).
- **There is no drag-position transform callback — confirmed from source.** `packages/system/src/xydrag/XYDrag.ts` runs a fixed, hardcoded per-frame pipeline — [XYDrag.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/xydrag/XYDrag.ts):
  1. `nextPosition = { x: x - dragItem.distance.x, y: … }`
  2. `snapPosition(nextPosition, snapGrid)`
  3. multi-drag `nodeExtent` box adjustment
  4. `calculateNodePosition({ nodeId, nextPosition, nodeLookup, nodeExtent, nodeOrigin, onError })` — applies per-node `extent` (incl. `'parent'`) and origin
  5. `dragItem.position = position` → `updateNodePositions(dragItems, true)` — **store already mutated**
  6. _then_ `onDrag?.(...)`, `onNodeDrag?.(...)`

  `OnNodeDrag`'s return value is `void` and discarded. `onNodeDrag` is strictly post-hoc notification. The only injectable geometry inputs are declarative: `nodeExtent`, per-node `extent`/`origin`, `nodeOrigin`, `snapToGrid`/`snapGrid`, `translateExtent`, `nodeDragThreshold`, `autoPanOnNodeDrag`.

- **`expandParent`** — docs: _"When true, the parent node will automatically expand if this node is dragged to the edge of the parent node's bounds."_; `extent: CoordinateExtent | 'parent' | null` is the _"Boundary a node can be moved in."_ — [Node type](https://reactflow.dev/api-reference/types/node). Implementation `handleExpandParent()` in [packages/system/src/utils/store.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/store.ts), with limits visible only in source:
  - **grow-only**: `const newWidth = Math.max(dimensions.width, Math.round(expandedRect.width))`; a parent never shrinks back.
  - works by **emitting changes**, returning `(NodeDimensionChange | NodePositionChange)[]` into the normal `onNodesChange` stream — so in a controlled flow the app must apply them, and they are themselves interceptable by the middleware hook.
  - when the parent's top-left moves, it also pushes compensating position changes for **every sibling child** so they don't visually shift — O(children) churn per frame.
  - triggers only on drag and on measured dimension change (`updateNodeInternals`), not on arbitrary programmatic `setNodes`.
  - `expandParent` and `extent: 'parent'` are antagonistic; the residue is a `position: expandParent ? { x: Math.max(0, dragItem.position.x), … } : dragItem.position` clamp in `updateNodePositions` — [store/index.ts](https://github.com/xyflow/xyflow/blob/main/packages/react/src/store/index.ts).
- **Layout engines: pure userland.** Compute positions, then `setNodes` + `fitView` from `useReactFlow()` — [Layouting guide](https://reactflow.dev/learn/layouting/layouting). Examples: [Dagre](https://reactflow.dev/examples/layout/dagre), [elkjs](https://reactflow.dev/examples/layout/elkjs), [elkjs multiple handles](https://reactflow.dev/examples/layout/elkjs-multiple-handles), d3-hierarchy, d3-force. **No layout slot, no `layout` prop, no registry.**
- **Edge routing: no router strategy slot.** You write a custom edge component and call a path helper: `getBezierPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top, curvature = 0.25 })` returning `[path, labelX, labelY, offsetX, offsetY]` — [getBezierPath](https://reactflow.dev/api-reference/utils/get-bezier-path); siblings `getSimpleBezierPath`, `getSmoothStepPath`, `getStraightPath`. Registration is via the `edgeTypes` map. Rendering escape hatches: `<EdgeLabelRenderer>`, `<ViewportPortal>`.
- **Pro/"examples" are all userland**, each hanging off an ordinary hook: [Proximity Connect](https://reactflow.dev/examples/nodes/proximity-connect) (`onNodeDrag` + `onNodeDragStop` + `useStoreApi`), [Auto Layout](https://reactflow.dev/examples/layout/auto-layout) (`useNodesInitialized` + elk/d3 + `setNodes`), [Force Layout](https://reactflow.dev/examples/layout/force-layout), [Dynamic Layouting](https://reactflow.dev/examples/layout/dynamic-layouting), [Expand & Collapse](https://reactflow.dev/examples/layout/expand-collapse), [Helper Lines](https://reactflow.dev/examples/interaction/helper-lines) (intercepts `onNodesChange`, inspects the `NodePositionChange`, snaps it, draws guides in an overlay — the canonical "transform a position change" example), [Undo/Redo](https://reactflow.dev/examples/interaction/undo-redo) (snapshots on `onNodeDragStart`/`onNodesDelete`/…), [Copy & Paste](https://reactflow.dev/examples/interaction/copy-paste), [Collaborative](https://reactflow.dev/examples/interaction/collaborative) (yjs + store subscription), [Sub Flows](https://reactflow.dev/examples/grouping/sub-flows), [Node Collisions](https://reactflow.dev/examples/layout/node-collisions), [Intersections](https://reactflow.dev/examples/nodes/intersections).
- **`@xyflow/system`** exports exactly `constants`, `types`, `utils`, `xydrag`, `xyhandle`, `xyminimap`, `xypanzoom`, `xyresizer` — [packages/system/src/index.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/index.ts). Framework-agnostic imperative factories (`XYDrag({ getStoreItems, onDragStart, onDrag, onDragStop, … })` → `{ update, destroy }`) plus geometry/graph utils (`calculateNodePosition`, `snapPosition`, `getNodesBounds`, `handleExpandParent`, `updateNodeInternals`, `adoptUserNodes`, `panBy`, the path getters). **Published but undocumented — a "public artifact, private contract."** It is nonetheless why a fourth binding (Vue) became feasible.

### Compact snippet — React Flow proximity connect

⚠️ _Reconstructed from the documented approach; reactflow.dev does not serve the handler source to a fetcher._ Source of truth: [Proximity Connect example](https://reactflow.dev/examples/nodes/proximity-connect)

```jsx
const MIN_DISTANCE = 150;
const store = useStoreApi();
const { getInternalNode } = useReactFlow();

const getClosestEdge = useCallback(
  (node) => {
    const { nodeLookup } = store.getState(); // <- internal store access
    const internalNode = getInternalNode(node.id);
    const closest = [...nodeLookup.values()].reduce(
      (res, n) => {
        if (n.id === internalNode.id) return res;
        const dx = n.internals.positionAbsolute.x - internalNode.internals.positionAbsolute.x;
        const dy = n.internals.positionAbsolute.y - internalNode.internals.positionAbsolute.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < res.distance && d < MIN_DISTANCE ? { distance: d, node: n } : res;
      },
      { distance: Number.MAX_VALUE, node: null },
    );
    if (!closest.node) return null;
    const closeIsSource = closest.node.internals.positionAbsolute.x < internalNode.internals.positionAbsolute.x;
    return { id: `${closest.node.id}-${node.id}`, source: closeIsSource ? closest.node.id : node.id, target: closeIsSource ? node.id : closest.node.id };
  },
  [getInternalNode],
);

<ReactFlow onNodeDrag={(_, n) => setEdges(withTempEdge(getClosestEdge(n)))} onNodeDragStop={(_, n) => setEdges(commit(getClosestEdge(n)))} />;
```

Key point: it reads absolute positions _after the fact_ and only mutates **edges**, never the dragged node's position — precisely because no position-transform hook exists.

### Compact snippet — expandParent / extent:'parent'

```js
const nodes = [
  { id: 'group-a', type: 'group', position: { x: 0, y: 0 }, style: { width: 320, height: 200 } },

  // clamped inside the parent; cannot leave it
  { id: 'a1', parentId: 'group-a', extent: 'parent', position: { x: 20, y: 40 }, data: { label: 'clamped' } },

  // NOT clamped; dragging past the edge grows the parent instead.
  // Emits NodeDimensionChange for the parent (+ NodePositionChange for the parent
  // and every sibling child when the top/left edge moves).
  { id: 'a2', parentId: 'group-a', expandParent: true, position: { x: 160, y: 40 }, data: { label: 'expands parent' } },
];
// Limits (source: packages/system/src/utils/store.ts handleExpandParent):
//  - grow-only, never shrinks back
//  - child position clamped to Math.max(0, ...) in parent coords while dragging
//  - triggers on drag + measured dimension change only, not on arbitrary setNodes
```

---

## Svelte Flow — "plugins" is a folder name, not a contract

### Cited Findings

- `packages/svelte/src/lib/plugins/` contains `Background`, `Controls`, `EdgeToolbar`, `Minimap`, `NodeResizer`, `NodeToolbar` — the exact React `additional-components` set — re-exported from the core entry under a `// plugins` comment — [packages/svelte/src/lib/index.ts](https://github.com/xyflow/xyflow/blob/main/packages/svelte/src/lib/index.ts). Nothing registers anything. This naming actively confuses users — see [discussions/5034](https://github.com/xyflow/xyflow/discussions/5034).
- **Svelte 5 runes store** is a class with rune fields, not a Zustand object — [initial-store.svelte.ts](https://github.com/xyflow/xyflow/blob/main/packages/svelte/src/lib/store/initial-store.svelte.ts):
  ```ts
  class SvelteFlowStore {
    flowId: string = $derived(signals.props.id ?? '1');
    domNode = $state.raw<HTMLDivElement | null>(null);
    panZoom: PanZoomInstance | null = $state.raw(null);
    nodesInitialized: boolean = $derived.by(() => {
      /* ... */
    });
    selectedNodes = $derived.by(() => {
      /* ... */
    });
    visible = $derived.by(() => {
      /* virtualization */
    });
    nodesDraggable: boolean = $derived(signals.props.nodesDraggable ?? true);
    nodeOrigin: NodeOrigin = $derived(signals.props.nodeOrigin ?? [0, 0]);
    nodeExtent: CoordinateExtent = $derived(signals.props.nodeExtent ?? infiniteExtent);
    snapGrid: SnapGrid | null = $derived(signals.props.snapGrid ?? null);
    dragging = $state.raw(false);
  }
  ```
  Note the deliberate `$state.raw` (no deep proxying — perf) and that **props flow into the store as `$derived`** via a `signals` object rather than being copied. `createStore(signals)` adds action methods and puts it in Svelte context (`export const key = Symbol()`).
- Access: `useStore()` (raw store escape hatch), `useSvelteFlow()` — _"does not accept any parameters"_, returns `zoomIn/zoomOut`, `getNode(s)`, `getEdge(s)`, `getInternalNode`, `setZoom`, `fitView`, `getIntersectingNodes`, `deleteElements`, `screenToFlowPosition`, `flowToScreenPosition`, `updateNode`, `updateNodeData`, `toObject`, `getNodesBounds` — [useSvelteFlow](https://svelteflow.dev/api-reference/hooks/use-svelte-flow). Other rune hooks: `useConnection`, `useNodeConnections`, `useNodesData`, `useInternalNode`, `useNodesEdgesViewport`, `useOnSelectionChange`, `useUpdateNodeInternals`, `useColorMode`, `useInitialized` — all `.svelte.ts` so they can hold runes.
- **Structurally identical to React**; the differences are ergonomic (an add-on reads `store.nodes` directly, no selector) — and **there is no `useOnNodesChangeMiddleware` equivalent**. The one real interception API is React-only and experimental.
- Packaging: `@xyflow/svelte`, single package, peer dep `svelte` 5.

---

## Vue Flow — composable injection, and a 2.0 merge into xyflow

### Cited Findings

- **Headline: Vue Flow 2.0 is being folded into xyflow.** [RFC: Release 2.0.0](https://github.com/bcakmakoglu/vue-flow/discussions/906): _"You can now install it via `@xyflow/vue`"_ and _"Vue Flow 2.0 rebuilds the core on top of `@xyflow/system` — the framework-agnostic engine that also powers React Flow and Svelte Flow… the same node/edge model, the same accessor names, and the same store shape across the three libraries."_
- **1.x add-ons were separate npm packages**: `@vue-flow/background`, `@vue-flow/minimap`, `@vue-flow/controls`, `@vue-flow/node-resizer`, `@vue-flow/node-toolbar` (+ meta-package `@vue-flow/additional-components`). Each is a plain SFC calling `useVueFlow()` — no registration, no install hook.
- **2.0 reverses that**: _"`@xyflow/vue` now ships every built-in: `Background`, `Controls`, `MiniMap`, `NodeToolbar`, `NodeResizer`/`NodeResizeControl`. The separate `@vue-flow/node-resizer`, `@vue-flow/node-toolbar`, `@vue-flow/background`, `@vue-flow/controls`, and `@vue-flow/minimap` packages are gone."_ Peers bump to Vue >= 3.5 and `@vueuse/core` v14 — [RFC #906](https://github.com/bcakmakoglu/vue-flow/discussions/906). **A library that had granular add-on packages moved back to a monolith** — a useful data point for ngx-vflow packaging.
- Other 2.0 breaks (same RFC): `v-model="elements"` → `v-model:nodes`/`v-model:edges`; **nodes and edges become immutable** (no deep reactification, "a big perf win on large graphs"; use `updateNode`/`updateNodeData`/`setNodes`); `getNodes()` returns `readonly`; `node.parentNode` → `node.parentId`, `node.computedPosition` → `node.internals.positionAbsolute`, `node.dimensions` → `node.measured`; new `getInternalNode()`/`useInternalNode()`.
- **`useVueFlow` injection model** — [composables guide](https://vueflow.dev/guide/composables.html): it _"creates a `VueFlowStore` instance on first call and injects it into the Vue component tree"_, so children call a bare `useVueFlow()`; _"the **first call** of `useVueFlow` is crucial as it determines the state instance that will be used throughout the component tree."_ You can pin it: `const { onInit } = useVueFlow({ id: 'my-flow-instance' })`. And: _"The values are reactive, meaning changing the values returned from `useVueFlow` will trigger changes in the graph."_ — i.e. the store is **directly writable** by an add-on, a looser contract than React's selector store.
- **Emitter-style hooks:** `useVueFlow()` returns `onInit`, `onNodeDrag`, `onNodeDragStart`, `onNodeDragStop`, `onConnect`, `onConnectStart`, `onConnectEnd`, `onNodesChange`, … as _subscriber functions_ rather than props — so **any component anywhere in the tree can subscribe**, the single most plugin-friendly property of the three xyflow-family libraries. Still fire-and-forget: no return-value veto. Veto lives in `isValidConnection` and controlled `onNodesChange` + `applyNodeChanges`.
- `expandParent` and `extent: 'parent'` exist in 1.x source (`packages/core/src/types/node.ts`, `utils/drag.ts`, `utils/changes.ts`, `components/Nodes/NodeWrapper.ts`, [Nesting example](https://github.com/bcakmakoglu/vue-flow/blob/master/examples/vite/src/Nesting/Nesting.vue)); in 2.0 they become `@xyflow/system`'s `handleExpandParent`, i.e. identical semantics to React Flow.
- **Verdict:** no plugin system. Vue's `provide/inject` gives the loosest coupling of the three, but there is no registry, no middleware, no router slot and no layout slot.

### Compact snippet — a Vue Flow add-on reading the store

Verbatim pattern from the real `@vue-flow/minimap` / `@vue-flow/controls` sources — [MiniMap.vue](https://github.com/bcakmakoglu/vue-flow/blob/master/packages/minimap/src/MiniMap.vue), [Controls.vue](https://github.com/bcakmakoglu/vue-flow/blob/master/packages/controls/src/Controls.vue):

```vue
<script lang="ts" setup>
// MiniMap.vue — a separate npm package, plugged in purely by being rendered
// inside <VueFlow>; it destructures the injected store.
import { Panel, getRectOfNodes, getBoundsofRects, useVueFlow } from '@vue-flow/core';

const { id, edges, viewport, translateExtent, dimensions, emits, d3Selection, d3Zoom, getNodesInitialized } = useVueFlow();
// d3Selection / d3Zoom are the *live* pan-zoom internals — the minimap drives
// the main viewport by calling into them directly. No registration API.
</script>

<!-- Controls.vue: same pattern, and it *writes* store refs:                -->
<!-- const { nodesDraggable, nodesConnectable, elementsSelectable } = useVueFlow() -->
<!-- toggling interactivity is just `nodesDraggable.value = false`          -->
```

---

## AntV X6 — a formal but thin `Graph.use()` plugin system + 18 registries

### Cited Findings

- **The whole plugin contract**, verbatim from `src/graph/graph.ts` — [antvis/X6 graph.ts](https://github.com/antvis/X6/blob/master/src/graph/graph.ts):
  ```ts
  export type GraphPlugin = {
    name: string;
    init: (graph: Graph, ...options: any[]) => any;
    dispose: () => void;

    enable?: () => void;
    disable?: () => void;
    isEnabled?: () => boolean;
  };
  ```
  Host side:
  ```ts
  private installedPlugins: Set<GraphPlugin> = new Set()

  use(plugin: GraphPlugin, ...options: any[]) {
    if (!this.installedPlugins.has(plugin)) {
      this.installedPlugins.add(plugin)
      plugin.init(this, ...options)
      this.handleScrollerPluginStateChange(plugin, true)
    }
    return this
  }
  getPlugin<T extends GraphPlugin>(pluginName: string): T | undefined
  getPlugins<T extends GraphPlugin[]>(pluginName: string[]): T | undefined
  enablePlugins(plugins: string[] | string)    // plugin?.enable?.()
  disablePlugins(plugins: string[] | string)   // plugin?.disable?.()
  isPluginEnabled(pluginName: string)
  disposePlugins(plugins: string[] | string)   // plugin.dispose(); installedPlugins.delete(plugin)
  ```
  Notes: de-dup is by **instance identity** (`Set.has(plugin)`), not by `name`, so two instances of the same class install twice. `getPlugin` linear-scans matching `plugin.name`. **There is no `update()` hook** — reconfiguring means dispose + re-`use`. And the core has one hardcoded special case: `handleScrollerPluginStateChange` checks `plugin.name === 'scroller'` to wire virtual rendering, so the system is _almost_ generic but the scroller is privileged.
- **Packaging reversed in 3.0.** 2.x shipped separate packages with a core peer dep — `@antv/x6-plugin-snapline@2.1.7`, `-selection@2.2.2`, `-transform@2.1.8`, `-dnd@2.1.1`, `-scroller@2.0.10`, `-history@2.2.4`, `-keyboard@2.2.3`, `-minimap@2.0.7`, `-stencil@2.1.5`, `-export@2.1.6`, each with `"peerDependencies": { "@antv/x6": "^2.x" }`. 3.x merges them all into `@antv/x6`: "3.x merges commonly used plugins and subpackages into `@antv/x6`, so you no longer need to install separate `@antv/x6-plugin-xxxx` packages" — [X6 3.x upgrade doc](https://github.com/antvis/X6/blob/master/site/docs/tutorial/update.en.md). Source now lives at `src/plugin/{clipboard,dnd,export,history,keyboard,minimap,scroller,selection,snapline,stencil,transform}/index.ts`. **This is the second library in this set (after Vue Flow) to collapse granular add-on packages back into a monolith.**
- **`Transform` plugin** (`src/plugin/transform/index.ts`) is a textbook implementation: `public name = 'transform'`, `init(graph)`, `enable()`, `disable()`, `isEnabled()`, `dispose()`. Options `rotating?: boolean | Partial<Rotating>` and `resizing?: boolean | Partial<Resizing>` normalize into per-node widget options: `resizable`, `minWidth/maxWidth/minHeight/maxHeight`, `orthogonal` (default true), `restrictedResizing`, `autoScroll` (default true), `preserveAspectRatio`, `allowReverse`, `rotatable`, `rotateGrid` (default **15°**) — [X6 transform plugin docs](https://x6.antv.antgroup.com/en/tutorial/plugins/transform)
- **18 registries as static aliases**, verbatim from `graph.ts` — [antvis/X6 graph.ts](https://github.com/antvis/X6/blob/master/src/graph/graph.ts):
  ```ts
  static registerNode = Node.registry.register
  static registerEdge = Edge.registry.register
  static registerView = CellView.registry.register
  static registerAttr = attrRegistry.register
  static registerGrid = gridRegistry.register
  static registerFilter = filterRegistry.register
  static registerNodeTool = nodeToolRegistry.register
  static registerEdgeTool = edgeToolRegistry.register
  static registerBackground = backgroundRegistry.register
  static registerHighlighter = highlighterRegistry.register
  static registerPortLayout = portLayoutRegistry.register
  static registerPortLabelLayout = portLabelLayoutRegistry.register
  static registerMarker = markerRegistry.register
  static registerRouter = routerRegistry.register
  static registerConnector = connectorRegistry.register
  static registerAnchor = nodeAnchorRegistry.register
  static registerEdgeAnchor = edgeAnchorRegistry.register
  static registerConnectionPoint = connectionPointRegistry.register
  ```
  Each has a matching `unregisterXxx`. ⚠️ There is **no generic `registerTool`** — it is split into `registerNodeTool` / `registerEdgeTool`. Docs: [registry/router](https://x6.antv.antgroup.com/en/api/registry/router)
- **Router signature** (`src/registry/router/index.ts`):
  ```ts
  export type RouterDefinition<T> = (this: EdgeView, vertices: PointLike[], options: T, edgeView: EdgeView) => PointLike[];
  ```
  **Routers are not handed obstacles.** Obstacle awareness lives inside the built-in `manhattan` router, which walks the graph itself; `src/registry/router/manhattan/options.ts` exposes `step` (default 10), `excludeTerminals: TerminalType[]` ("Should the source and/or target not be considered as obstacles?"), `excludeShapes: string[]`, `excludeNodes`, `startDirections` (default all four), `padding`/`paddingBox`, and a cost function. A third-party obstacle router must re-derive obstacles from `edgeView.graph`.
- **`connecting` options** (`src/graph/options.ts`):
  ```ts
  export interface Connecting {
    snap: boolean | { radius: number; anchor?: 'center' | 'bbox' }
    allowBlank:  boolean | ((this: Graph, args: ValidateConnectionArgs) => boolean)
    allowLoop:   boolean | ((...) => boolean)
    allowNode:   boolean | ((...) => boolean)
    allowEdge:   boolean | ((...) => boolean)
    allowPort:   boolean | ((...) => boolean)
    allowMulti:  boolean | 'withPort' | ((...) => boolean)
    highlight: boolean
    anchor: NodeAnchorOptions;  sourceAnchor?; targetAnchor?
    edgeAnchor: EdgeAnchorOptions; sourceEdgeAnchor?; targetEdgeAnchor?
    connectionPoint: ConnectionPointOptions; sourceConnectionPoint?; targetConnectionPoint?
    router: string | RouterNativeItem | RouterManualItem
    connector: string | ConnectorNativeItem | ConnectorManualItem
    createEdge?: (this: Graph, args: { sourceCell; sourceView; sourceMagnet }) => Nilable<Edge> | void
    validateMagnet?: (this: Graph, args: { cell; view; magnet; e }) => boolean
    validateEdge?:   (this: Graph, args: { edge; type; previous }) => boolean
    validateConnection: (this: Graph, args: ValidateConnectionArgs) => boolean
  }
  ```
  `ValidateConnectionArgs` carries `type, edge, edgeView, sourceCell, targetCell, sourceView, targetView, sourcePort, targetPort, sourceMagnet, targetMagnet`. **Every `allow*` accepts a predicate**, so they are genuine extension points, not just booleans. `snap: { radius }` is documented as "Snap edge to the closest node/port in the given radius on dragging" — X6's proximity connect. `highlight: boolean` reuses `validateConnection` to decide which magnets light up — [Graph API](https://x6.antv.antgroup.com/en/api/graph/graph)
- **`embedding`:**
  ```ts
  export interface Embedding {
    enabled?: boolean;
    findParent?: 'bbox' | 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | ((this: Graph, args: { node: Node; view: NodeView }) => Cell[]);
    frontOnly?: boolean;
    validate: (this: Graph, args: { child: Node; parent: Node; childView; parentView }) => boolean;
  }
  ```
  Defaults `{ enabled: false, findParent: 'bbox', frontOnly: true, validate: () => true }`. The function form returns a **candidate list**; "The cell with the highest z-index (visually on the top) will be chosen." `frontOnly: false` tests nodes under the dragged view front-to-back. ⚠️ **Parent auto-resize is NOT part of this config** — the X6 group tutorial does it by hand, listening to `change:children`/`change:position` and calling `parent.fitEmbeds()`/`resize()` — [X6 group tutorial](https://x6.antv.antgroup.com/en/tutorial/intermediate/group)
- **`translating.restrict`:**
  ```ts
  export interface Translating {
    restrict: boolean | OptionItem<CellView | null, RectangleLike | number | null>;
    autoOffset?: boolean;
  }
  ```
  Default `{ restrict: false }`. `OptionItem` means it may be a literal or `(this: Graph, view: CellView | null) => RectangleLike | number | null` — a bbox to clamp the drag, a number for a uniform inset, or `true` for the graph area. **This is X6's drag-position constraint hook, and it is clamp-only** (it cannot express an arbitrary projection).
- **Rotation:** `node.angle()` is an overloaded accessor (`angle(): number` / `angle(val: number, options?: RotateOptions): this`) with `node.rotate(deg, options)` alongside (`src/model/node.ts` ~line 541); the Transform plugin snaps to 15° by default. For anchors under rotation, `Node.getBBox`-side code explicitly computes in the **un-rotated frame then rotates back**: it normalizes the angle, picks a quadrant, builds "a rectangle in size of the un-rotated node", does `.rotate(-angle, bbox.getCenter())`, then converts back via polar coords. ⚠️ Read from source, not documented.
- **Events are notifications, not vetoes.** `node:moving` / `node:moved` carry `{ e, x, y, node, view }`; `node:embed` / `node:embedding` (`+ candidateParent`) / `node:embedded` (`previousParent`, `currentParent`); `edge:connected` carries `{ isNew, edge, type, previousCell/View/Port/Point/Magnet, currentCell/View/Port/Point/Magnet }` and "fires when dragging an edge terminal to connect/disconnect it to/from a node or edge". Model-level `cell:change:*` (incl. `node:change:position`, `node:change:angle`) come from `ModelEventArgs` merged into `EventArgs` in `src/graph/events.ts`. **No handler can return `false` to cancel** — [X6 events doc](https://x6.antv.antgroup.com/en/tutorial/basic/events). Interception happens exclusively through the _option_ hooks (`validateConnection`, `validateEdge`, `validateMagnet`, `embedding.validate`, `translating.restrict`, `connecting.allow*`). That split — **plugins for behaviour+UI, options for veto** — is the architecturally important observation about X6.

### Compact snippet — X6 `Graph.use` plugin

```ts
import { Graph, type GraphPlugin } from '@antv/x6';

class AutoLayout implements GraphPlugin {
  public name = 'auto-layout';
  private graph!: Graph;
  private enabled = true;
  private onChange = () => {
    if (this.enabled) this.relayout();
  };

  init(graph: Graph, options: { spacing: number } = { spacing: 40 }) {
    this.graph = graph;
    this.graph.on('node:added', this.onChange);
    this.graph.on('node:removed', this.onChange);
  }
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  isEnabled() {
    return this.enabled;
  }
  dispose() {
    this.graph.off('node:added', this.onChange);
    this.graph.off('node:removed', this.onChange);
  }
  private relayout() {
    /* ... */
  }
}

const graph = new Graph({ container: el });
graph.use(new AutoLayout(), { spacing: 40 }); // extra args forwarded to init()
graph.getPlugin<AutoLayout>('auto-layout')?.disable();
graph.disposePlugins('auto-layout');
```

Interface source: [antvis/X6 graph.ts](https://github.com/antvis/X6/blob/master/src/graph/graph.ts)

### Compact snippet — X6 `Graph.registerRouter`

```ts
import { Graph } from '@antv/x6';
import type { Point } from '@antv/x6';

// RouterDefinition<T> = (this: EdgeView, vertices, args: T, edgeView) => PointLike[]
const randomRouter = function (vertices, args, edgeView) {
  const bounces = args.bounces || 20;
  const points = vertices.map((p) => Point.create(p));
  const sourceCorner = edgeView.sourceBBox.getCenter();
  const targetCorner = edgeView.targetBBox.getCenter();
  for (let i = 0; i < bounces; i += 1) {
    points.push(Point.random(sourceCorner.x, targetCorner.x, sourceCorner.y, targetCorner.y));
  }
  return points; // no obstacles handed to you — derive from edgeView.graph
};

Graph.registerRouter('random', randomRouter);
edge.setRouter('random', { bounces: 3 });
// or globally: new Graph({ connecting: { router: { name: 'random', args: { bounces: 3 } } } })
```

Docs: [registry/router](https://x6.antv.antgroup.com/en/api/registry/router); type source: [src/registry/router/index.ts](https://github.com/antvis/X6/blob/master/src/registry/router/index.ts)

---

## AntV G6 v5 — one registry, 11 categories, declarative and reconciled

### Cited Findings

- **`register(category, type, Ctor)`**, verbatim — [packages/g6/src/registry/register.ts](https://github.com/antvis/G6/blob/v5/packages/g6/src/registry/register.ts):
  ```ts
  export function register<T extends ExtensionCategory>(category: Loosen<T>, type: string, Ctor: ExtensionRegistry[T][string]) {
    const ext = EXTENSION_REGISTRY[category][type];
    if (ext) {
      print.warn(`The extension ${type} of ${category} has been registered before, and will be overridden.`);
    }
    Object.assign(EXTENSION_REGISTRY[category]!, { [type]: Ctor });
  }
  ```
  Docstring: "Built-in extensions are automatically registered when the project is imported… Extensions only need to be registered once and can be used anywhere in the project."
- **11 categories** (more than commonly listed) — `packages/g6/src/constants/registry.ts`:
  ```ts
  export enum ExtensionCategory {
    NODE = 'node',
    EDGE = 'edge',
    COMBO = 'combo',
    THEME = 'theme',
    PALETTE = 'palette',
    LAYOUT = 'layout',
    BEHAVIOR = 'behavior',
    PLUGIN = 'plugin',
    ANIMATION = 'animation',
    TRANSFORM = 'transform',
    SHAPE = 'shape',
  }
  ```
  **Layouts are extensions like everything else**, unlike X6 where layout is a separate `@antv/layout` concern.
- **Behaviors, plugins and transforms share one base class** — `packages/g6/src/registry/extension/index.ts`:
  ```ts
  export class BaseExtension<T extends { type: string; key?: string; [key: string]: unknown }> {
    protected context: RuntimeContext;
    protected options: Required<T>;
    protected events: [EventEmitter | HTMLElement, string, (event: IEvent) => void][] = [];
    public initialized = false;
    public destroyed = false;

    constructor(context: RuntimeContext, options: Partial<T>) {
      /* ... */
    }
    public update(options: Partial<T>) {
      this.options = Object.assign(this.options, options);
    }
    public destroy() {
      this.destroyed = true;
    }
  }
  ```
  `BasePlugin<T>` and `BaseBehavior<T>` are **both literally empty subclasses**. G6's docs: "Both behavior and plugin base classes are derived from the BaseExtension base class within G6, so the implementation methods for behavior and plugin are basically the same. However… behavior is usually used to handle user interaction events, while plugins are usually used to handle canvas rendering logic, additional component rendering, etc." and "Due to conceptual distinctions, behavior instances cannot be obtained, while plugin instances can be obtained (`getPluginInstance`)." — [custom-behavior doc](https://g6.antv.antgroup.com/en/manual/behavior/custom-behavior), [getPluginInstance](https://g6.antv.antgroup.com/en/api/plugin#graphgetplugininstancekey). That is the only functional difference.
- **Lifecycle is driven by an array diff on the spec, not imperative `use()`** — `ExtensionController<E>` with `public abstract category: 'plugin' | 'behavior' | 'transform'`:
  ```ts
  public setExtensions(extensions: (string | { type: string; ... } | ((this: Graph) => {...}))[]) {
    const stdExtensions = parseExtensions(this.context.graph, this.category, extensions);
    const { enter, update, exit, keep } = arrayDiff(this.extensions, stdExtensions, (e) => e.key);
    this.createExtensions(enter);
    this.updateExtensions([...update, ...keep]);
    this.destroyExtensions(exit);
    this.extensions = stdExtensions;
  }
  protected createExtension(extension) {
    const Ctor = getExtension(this.category, extension.type);
    if (!Ctor) return print.warn(`The extension ${type} of ${category} is not registered.`);
    const instance = new Ctor(this.context, extension);
    instance.initialized = true;
    this.extensionMap[extension.key] = instance;
  }
  ```
  **This is the key architectural contrast with X6:** G6 extensions are _declarative and reconciled_ (`graph.setOptions({ plugins: [...] })` diffs by `key`, entering/updating/exiting), whereas X6 is imperative `graph.use(instance)`. For an Angular/signals library this matters — G6's model is the one that composes with declarative templates.
- **Custom plugin** — [custom-plugin doc](https://g6.antv.antgroup.com/en/manual/plugin/custom-plugin):
  ```ts
  import { BasePlugin } from '@antv/g6';
  import type { BasePluginOptions, RuntimeContext } from '@antv/g6';

  class RemoteDataSource extends BasePlugin<RemoteDataSourceOptions> {
    constructor(context: RuntimeContext, options: RemoteDataSourceOptions) {
      super(context, options);
      this.loadData();
    }
    private async loadData() {
      const { graph } = this.context;
      graph.setData(data);
      await graph.render();
    }
  }
  ```
  `this.context` is the **whole `RuntimeContext`** (graph, canvas, element/viewport controllers) — a meaningfully wider surface than X6's `init(graph)`. A second doc example uses `static defaultOptions: Partial<Options>` and `graph.on(GraphEvent.BEFORE_RENDER, ...)`.
- **Built-ins.** Behaviors: `DragCanvas`, `DragElement`, `DragElementForce`, `ZoomCanvas`, `ScrollCanvas`, `BrushSelect`, `LassoSelect`, `ClickSelect`, `HoverActivate`, `CollapseExpand`, `CreateEdge`, `FocusElement`, `FixElementSize`, `AutoAdaptLabel`, `OptimizeViewportTransform`. Plugins: `Background`, `BubbleSets`, `Contextmenu`, `EdgeBundling`, `EdgeFilterLens`, `Fisheye`, `Fullscreen`, `GridLine`, `History`, `Hull`, `Legend`, `Minimap`, `Snapline`, `Timebar`, `Title`, `Toolbar`, `Tooltip`, `Watermark`. Transforms: `MapNodeSize`, `PlaceRadialLabels`, `ProcessParallelEdges` — [transform overview](https://g6.antv.antgroup.com/en/manual/transform/overview)

### Gaps

- **G6 combo auto-resize:** `ExtensionCategory.COMBO` and `BaseCombo` are confirmed ([BaseCombo](https://g6.antv.antgroup.com/en/manual/element/combo/BaseCombo)), but I could not confirm the option name for resize-on-child-change. Open question.

---

## JointJS — options + namespace registries + subclassing; no plugin system

### Cited Findings

- **Verdict: no formal plugin system.** There is no `joint.plugins`, no `Plugin` interface, no `paper.use()`. The source tree `packages/joint-core/src/` contains `anchors/ connectionPoints/ connectionStrategies/ connectors/ dia/ elementTools/ highlighters/ layout/ linkAnchors/ linkTools/ routers/ shapes/ util/ mvc/ alg/ g/ V/` and nothing plugin-like — [joint-core src](https://github.com/clientIO/joint/tree/master/packages/joint-core/src). Extension happens three ways: (1) **paper options that accept functions**, (2) **plain-object namespaces** you assign into, (3) **Backbone-style subclassing** of `dia.Element` / `dia.ElementView` / `dia.CellView`. What people call "JointJS plugins" (`ui.*`) are commercial JointJS+ widgets — independent classes constructed _against_ a paper, not registered with it.
- **Paper options**, quoted from `packages/joint-core/types/dia.d.ts`:
  ```ts
  interactive?: ((cellView: CellView, event: string) => boolean | CellView.InteractivityOptions)
              | boolean | CellView.InteractivityOptions;
  validateMagnet?: (cellView: CellView, magnet: SVGElement, evt: Event) => boolean;
  validateConnection?: (cellViewS: CellView, magnetS: SVGElement,
                        cellViewT: CellView, magnetT: SVGElement,
                        end: LinkEnd, linkView: LinkView) => boolean;
  restrictTranslate?: RestrictTranslateCallback | boolean | BBox;
  snapLinks?: boolean | SnapLinksOptions;      // { radius?, findInAreaOptions? }
  snapLinksSelf?: boolean | { distance: number };
  snapLabels?: boolean;
  markAvailable?: boolean;  multiLinks?: boolean;  linkPinning?: boolean;
  allowLink?: ((linkView: LinkView, paper: Paper) => boolean) | null;
  guard?: (evt: Event, view?: CellView) => boolean;
  // embedding
  embeddingMode?: boolean;  frontParentOnly?: boolean;
  findParentBy?: FindParentByType | FindParentByCallback;
  validateEmbedding?: (this: Paper, childView: ElementView, parentView: ElementView) => boolean;
  validateUnembedding?: (this: Paper, childView: ElementView) => boolean;
  // strategy defaults
  defaultLink?: ((cellView: CellView, magnet: SVGElement) => Link) | Link;
  defaultRouter?: routers.Router | routers.RouterJSON;
  defaultConnector?: connectors.Connector | connectors.ConnectorJSON;
  defaultAnchor?: anchors.AnchorJSON | anchors.Anchor;
  defaultLinkAnchor?: anchors.AnchorJSON | anchors.Anchor;
  defaultConnectionPoint?: connectionPoints.ConnectionPointJSON | connectionPoints.ConnectionPoint
                         | ((...args) => connectionPoints.ConnectionPoint);
  connectionStrategy?: connectionStrategies.ConnectionStrategy;
  // namespace overrides — the under-advertised extension point
  cellViewNamespace?: any;  layerViewNamespace?: any;
  routerNamespace?: any;    connectorNamespace?: any;
  highlighterNamespace?: any; anchorNamespace?: any;
  linkAnchorNamespace?: any;  connectionPointNamespace?: any;
  ```
  Callback types, same file:
  ```ts
  type PointConstraintCallback = (x: number, y: number, opt: any) => Point;
  type RestrictTranslateCallback = (elementView: ElementView, x0: number, y0: number) => BBox | boolean | PointConstraintCallback;
  type FindParentByType = 'bbox' | 'pointer' | PositionName;
  type FindParentByCallback = (this: Graph, elementView: ElementView, evt: Event, x: number, y: number) => Cell[];
  ```
  Two things stand out: **`restrictTranslate` may return a `PointConstraintCallback (x, y, opt) => Point`**, i.e. an arbitrary projection rather than only a clamping rectangle — strictly more expressive than X6's `translating.restrict`. And the option is **`findParentBy`** (with `frontParentOnly`), whose `'pointer'` mode X6 lacks. Interactivity flags merge `ElementView.InteractivityOptions { elementMove?, addLinkFromMagnet?, stopDelegation? }` with `LinkView.InteractivityOptions`, so `interactive: (cellView) => ({ elementMove: false })` is the per-view form — [Paper API](https://docs.jointjs.com/api/dia/Paper/)
- **Registries are plain namespace objects**: `joint.routers`, `joint.connectors`, `joint.anchors`, `joint.linkAnchors`, `joint.connectionPoints`, `joint.connectionStrategies`, `joint.linkTools`, `joint.elementTools`, `joint.highlighters`, `joint.dia.attributes`, `joint.layout`, `joint.shapes`. Registration is literally property assignment (`routers.myRouter = fn`); lookup is by string name; and **the whole namespace is swappable per paper** via `routerNamespace` etc. — [routers](https://docs.jointjs.com/api/routers/), [connectors](https://docs.jointjs.com/api/connectors/), [anchors](https://docs.jointjs.com/api/anchors/), [dia/attributes](https://docs.jointjs.com/api/dia/attributes/)
- **Router signature** — [types/routers.d.ts](https://github.com/clientIO/joint/blob/master/packages/joint-core/types/routers.d.ts):
  ```ts
  export interface GenericRouter<K extends RouterType> {
    (vertices: dia.Point[], args?: GenericRouterArguments<K>, linkView?: dia.LinkView): dia.Point[];
  }
  export interface RouterArgumentsMap {
    normal: NormalRouterArguments;
    manhattan: ManhattanRouterArguments;
    metro: ManhattanRouterArguments;
    orthogonal: OrthogonalRouterArguments;
    oneSide: OneSideRouterArguments; // @deprecated use `rightAngle` instead
    rightAngle: RightAngleRouterArguments;
    [key: string]: { [key: string]: any }; // open-ended: custom names allowed
  }
  ```
  Same shape as X6, and likewise **no obstacles passed in**. Obstacle handling is inside `manhattan` via args: `step`, `padding`, `maximumLoops`, `maxAllowedDirectionChange`, `perpendicular`, `excludeEnds: dia.LinkEnd[]`, `excludeTypes: string[]`, `startDirections`/`endDirections`, `isPointObstacle?: (point) => boolean`, `fallbackRouter`. `rightAngle` carries an `@internal` `useModelGeometry?: boolean` whose comment says it was "added for `@joint/router-avoid`'s demos and subject to change" — a tell that the avoid integration pushed on core.
- **UI extension = tools.** `elementTools`/`linkTools` are `dia.ToolView` subclasses grouped into a `dia.ToolsView` and attached with `cellView.addTools(...)`. Built-ins: `linkTools.Vertices/Segments/SourceArrowhead/TargetArrowhead/Remove/Boundary/Button/Connect/HoverConnect`, `elementTools.Boundary/Remove/Button/Connect/HoverConnect/Control`. The deepest seam is subclassing `dia.ElementView`/`dia.LinkView`/`dia.CellView` with a declarative `markup` array and `attrs` driven by `dia.attributes` (itself a registry of custom SVG attribute handlers) — [ElementView](https://docs.jointjs.com/api/dia/ElementView/), [CellView](https://docs.jointjs.com/api/dia/CellView/)
- **JointJS+ (commercial, `@joint/plus`)** owns the `ui.*` namespace: `ui.Snaplines`, `ui.FreeTransform` (resize + rotate handles) and `ui.BPMNFreeTransform`, `ui.Halo`, `ui.Selection` + `ui.SelectionRegion` + `ui.SelectionFrameList`, `ui.Stencil`, `ui.PaperScroller`, `ui.Inspector`, `ui.Navigator`, `ui.Clipboard`, `ui.Toolbar`, `ui.ContextToolbar`, `ui.Tooltip`, `ui.Dialog`, `ui.Popup`, `ui.FlashMessage`, `ui.ColorPalette`, `ui.SelectBox`, `ui.RadioGroup`, `ui.SelectButtonGroup`, `ui.Keyboard`, `ui.TextEditor`, `ui.PathDrawer`, `ui.PathEditor`, `ui.StackLayoutView`, `ui.TreeLayoutView`, `ui.Widget`. Outside `ui`: `dia.CommandManager` (undo/redo) and `layout.DirectedGraph` (dagre wrapper) — [Snaplines](https://docs.jointjs.com/api/ui/Snaplines/), [CommandManager](https://docs.jointjs.com/api/dia/CommandManager/), [DirectedGraph](https://docs.jointjs.com/api/layout/DirectedGraph/), [JointJS+ product page](https://www.jointjs.com/jointjs-plus). Split: routers/connectors/anchors/tools/highlighters = free core; `ui.*` + `CommandManager` + `layout.DirectedGraph` = paid.
- **The Avoid router (libavoid WASM) is deliberately NOT a registry router.** Package `@joint/router-avoid@4.3.3` (`dependencies: { "@joint/core": "~4.3.3", "libavoid-js": "0.4.5" }`, no peer deps). From the README — [@joint/router-avoid README](https://unpkg.com/@joint/router-avoid@4.3.3/README.md):

  > "libavoid maintains a single incremental router shared by the whole graph: it tracks every element as an obstacle and every link as a connector, and reroutes affected connectors whenever obstacles move. This package wraps that behavior in a `RouterService` that listens to a `dia.Graph` and, whenever libavoid computes a new route for a link, applies it directly to that link's `vertices` and source/target anchors - there is no `router: { name: ... }` attribute to set on links."

  API: `loadAvoidRouter(filePath?): Promise<void>` and `initAvoidRouter(graph, options?): Promise<RouterService>`; the service exposes `start()`, `routeAll()`, `routeSubgraph()`, `destroy()`, and fires a `link:routed` event per settled link. Under UMD: `joint.routers.avoid.initAvoidRouter`. Demo wiring — [joint-demos libavoid app.js](https://github.com/clientIO/joint-demos/blob/main/libavoid-standalone-link-routing/js/src/ui-thread/app.js):

  ```js
  import { initAvoidRouter } from '@joint/router-avoid';
  // paper created with snapLinks: { radius: 30 }, linkPinning: false,
  //   interactive: { linkMove: false },
  //   defaultConnector: { name: 'straight', args: { cornerType: 'cubic', cornerRadius: 4 } },
  //   validateConnection(...)
  const routerService = await initAvoidRouter(graph, {
    shapeBufferDistance: 20,
    idealNudgingDistance: 10,
  });
  routerService.start();
  ```

  Three variants exist in the repo — `ui-thread`, `web-worker`, `web-worker-perf` — so the WASM router can be moved off the main thread. [Demo page](https://www.jointjs.com/demos/libavoid-standalone-link-routing), [announcement discussion](https://github.com/clientIO/joint/discussions/2627).

### Compact snippet — JointJS router registration + `defaultRouter`

```js
import { dia, routers, g, shapes } from '@joint/core';

// Registration is plain assignment into the namespace object.
// Signature: (vertices: g.Point[], args?: object, linkView?: dia.LinkView) => g.Point[]
routers.stepUp = (vertices, args, linkView) => {
  const { step = 20 } = args;
  const src = linkView.sourceAnchor;
  const tgt = linkView.targetAnchor;
  const midY = Math.min(src.y, tgt.y) - step;
  return [new g.Point(src.x, midY), ...vertices, new g.Point(tgt.x, midY)];
};

const paper = new dia.Paper({
  model: graph,
  cellViewNamespace: shapes,
  defaultRouter: { name: 'stepUp', args: { step: 30 } }, // serializable form
  // routerNamespace: myRouters,   // <- swap the whole registry per paper
  defaultConnector: { name: 'rounded', args: { radius: 8 } },
  defaultAnchor: { name: 'perpendicular' },
  defaultConnectionPoint: { name: 'boundary' },
  interactive: (cellView) => (cellView.model.isElement() ? { elementMove: false } : true),
});
```

[Paper API](https://docs.jointjs.com/api/dia/Paper/), [routers](https://docs.jointjs.com/api/routers/), [types/routers.d.ts](https://github.com/clientIO/joint/blob/master/packages/joint-core/types/routers.d.ts)

### Gaps / caveats for this cluster

- The `x6.antv.antgroup.com` and `g6.antv.antgroup.com` doc sites are client-rendered SPAs; deep URLs return the landing page to a fetcher. Everything quoted above was verified against GitHub sources (`antvis/X6@master`, `antvis/G6@v5`, `clientIO/joint@master`); the doc URLs are correct for a human browser but will not fetch cleanly.
- X6 rotation ↔ ports/anchors behaviour was read from `src/model/node.ts` internals, not from a doc page.
- X6 embedding parent auto-resize has no config flag; the tutorial does it by hand.
- JointJS v4 typings have **no `findParent`** option — it is `findParentBy` + `frontParentOnly`.
- `@joint/plus` npm metadata is not publicly readable, so the paid/free split for `ui.*` is asserted from docs structure and the product page rather than package metadata. (A fetch summary wrongly claimed `ui.Snaplines` is open source.)

### X6 vs G6 vs JointJS — extension model at a glance

|                              | X6 3.x                                                                    | G6 v5                                                                                    | JointJS 4.x                                       |
| ---------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Plugin system                | Formal: `GraphPlugin` type, `graph.use(instance)`, imperative             | Formal: `register(category, type, Ctor)` + declarative `plugins: []` spec, diffed by key | None — options + namespaces + subclassing         |
| Plugin identity              | instance in a `Set`; `name` for lookup                                    | `key` in the spec array                                                                  | n/a                                               |
| Lifecycle                    | `init(graph, ...args)` / `dispose()`, optional `enable/disable/isEnabled` | `constructor(context, options)` / `update(options)` / `destroy()`                        | n/a                                               |
| Hot reconfigure              | **no `update` hook** — dispose + re-`use`                                 | `update(options)` via array diff                                                         | set a paper option                                |
| Surface handed to the plugin | the `Graph`                                                               | the full `RuntimeContext`                                                                | n/a                                               |
| Registries                   | 18 `Graph.registerXxx` statics over typed `Registry` objects              | one `EXTENSION_REGISTRY` keyed by 11 categories                                          | plain JS namespace objects, per-paper overridable |
| Layout                       | external `@antv/layout`                                                   | `ExtensionCategory.LAYOUT` — first-class                                                 | `joint.layout`; dagre only in JointJS+            |
| Interception                 | option hooks only; events are notifications                               | behaviors intercept by consuming events                                                  | option hooks + `guard`                            |
| Ordering / priority          | none                                                                      | array order in the spec                                                                  | n/a                                               |

---

## GoJS — subclassing + a shipped "Extensions" folder, no plugin registry

**No plugin registry.** Extension points are (a) overridable subclasses and (b) per-Part function/template properties. All input goes through `Diagram.currentTool`, normally a `ToolManager` holding three ordered lists — `ToolManager.mouseDownTools`, `mouseMoveTools`, `mouseUpTools`; a custom `Tool` subclass is installed by inserting it into one of those lists or by replacing/disabling a named tool (`diagram.toolManager.dragSelectingTool.isEnabled = false`). A Tool's contract is `canStart()` / `doActivate()` / `doMouseMove()` / `doDeactivate()` — [intro/tools](https://gojs.net/latest/intro/tools.html). **Drag-time position interception is a per-Part function, not a tool subclass**: `Part.dragComputation` is "a function used to determine the location that this Part can be dragged to", called with (Part, proposed Point, snapped Point) → Point, with `minLocation`/`maxLocation` as the cheap constraint form — [api/Part](https://gojs.net/latest/api/symbols/Part.html). Grid snapping is `DraggingTool.isGridSnapEnabled` + `ResizingTool.cellSize`; rotation snapping is `RotatingTool.snapAngleMultiple` / `snapAngleEpsilon`. Handles are data-driven templates: `Part.resizable` + `resizeObjectName` + `resizeAdornmentTemplate`, and symmetrically `Part.rotatable` + `rotateObjectName` + `rotateAdornmentTemplate`.

Layout is a strategy object: subclass `Layout`, override `doLayout()`, assign to `Diagram.layout` or `Group.layout`; re-run policy is declarative via `Layout.isInitial`, `Layout.isOngoing`, `Layout.invalidateLayout()`, and per-part `Part.layoutConditions` (default `LayoutConditions.Standard`, e.g. `LayoutConditions.NodeSized`) / `Part.isLayoutPositioned` — [intro/layouts](https://gojs.net/latest/intro/layouts.html). Edge routing is a strategy expressed as an enum plus an override hook: `Link.routing` = `Routing.Normal | Routing.Orthogonal | Routing.AvoidsNodes` (the last "adjusts to avoid crossing over nodes", explicitly slower), `Link.curve` = `Curve.Bezier`/`JumpOver`/`JumpGap`, `Link.curviness`, spot control via `fromSpot`/`toSpot`/`fromEndSegmentLength`, `Node.avoidable`; for anything else, a `Link` subclass overriding `computePoints()`. A separate `Router` class runs "on the collection of links in a Diagram or Group after the Layout has been completed" — [intro/links](https://gojs.net/latest/intro/links.html). **Group auto-resize = `Placeholder`** in the group template: it "assumes the size and position of the union of the bounds of all of the group's member parts, plus some padding", so moving members resizes the group — [intro/groups](https://gojs.net/latest/intro/groups.html). Distribution is a source-drop **Extensions folder** of ~30 tools (GuidedDraggingTool, LassoSelectingTool, OrthogonalLinkReshapingTool, PolygonDrawingTool, GeometryReshapingTool…) each "defined in a separate JS file that you can load into your app", plus extension layouts (ArrangingLayout, FishboneLayout, PackedLayout, SwimLaneLayout, TableLayout, TreeMapLayout…).

---

## maxGraph / mxGraph — a real, if minimal, plugin interface

maxGraph turned mxGraph's hard-wired handlers into constructor-injected plugins: `new Graph(container, undefined, [...getDefaultPlugins(), RubberBandHandler])`, or `new BaseGraph({ container, plugins: [CellEditorHandler, SelectionCellsHandler, SelectionHandler] })`. Runtime lookup is by id: `graph.getPlugin<PanningHandler>('PanningHandler')` (returns `undefined` if not registered). The contract is tiny — `interface GraphPlugin { onDestroy(): void }` plus a **static `pluginId`** and a constructor taking the `Graph`: `class MyCustomPlugin implements GraphPlugin { static pluginId = 'my-custom-plugin'; constructor(graph: Graph) {…} onDestroy() {…} }`. Built-ins promoted to default plugins: `CellEditorHandler`, `ConnectionHandler`, `FitPlugin`, `ImageBundlePlugin`, `PanningHandler`, `PopupMenuHandler`, `SelectionCellsHandler`, `SelectionHandler`, `TooltipHandler`; `RubberBandHandler` is opt-in — [maxGraph plugins docs](https://maxgraph.github.io/maxGraph/docs/usage/plugins). **There is no central name→class registry and no ordering/priority** — it is a constructor-time list plus id lookup, so plugins customize each other by mutating sibling plugins' fields (`panningHandler.useLeftButtonForPanning = true`).

Other axes are manager/strategy objects. `LayoutManager` hooks model changes — `moveHandler`→`cellsMoved()`, `resizeHandler`→`cellsResized()`, `undoHandler`→`beforeUndo()` on `endUpdate` — and you override **`getLayout(cell, eventName)`** to return a layout per parent cell, `eventName` ∈ MOVE_CELLS / RESIZE_CELLS / BEGIN_UPDATE / END_UPDATE (capture vs bubble phase); it collects cells via `getCellsForChanges()`, walks `addAncestorsWithLayout()`/`addDescendantsWithLayout()`, runs `executeLayout()`, fires `LAYOUT_CELLS` — [LayoutManager API](https://maxgraph.github.io/maxGraph/api-docs/classes/LayoutManager.html). **Parent/group auto-resize is `SwimlaneManager`**, which "sets the size of newly added swimlanes to that of their siblings, and propagates changes to the size of a swimlane to its siblings" and ancestors, via `swimlaneAdded()`, `cellsAdded()`, `cellsResized()`→`resizeSwimlane()`, filtered by `isSwimlaneIgnored()`/`isCellHorizontal()`, toggled with `setAddEnabled()`/`setResizeEnabled()` — [SwimlaneManager API](https://maxgraph.github.io/maxGraph/api-docs/classes/SwimlaneManager.html). Edge routing is a **named strategy in a registry**: mxGraph used `mxStyleRegistry.putValue('myEdgeStyle', mxEdgeStyle.MyStyle)` referenced by style key — [mxGraph manual](https://jgraph.github.io/mxgraph/docs/manual.html), [mxEdgeStyle](https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxEdgeStyle-js.html). ⚠️ _From release notes only, unverified against docs_: maxGraph **removed `StyleRegistry`** in favour of `EdgeStyleRegistry`/`PerimeterRegistry`, with `EdgeStyle` now a namespace so bundlers can tree-shake, e.g. `EdgeStyleRegistry.add('elbowEdgeStyle', EdgeStyle.ElbowConnector, { handlerKind: 'elbow', isOrthogonal: true })` — [maxGraph releases](https://github.com/maxGraph/maxGraph/releases). Veto is `isValidConnection()` plus declarative `multiplicities` (`mxMultiplicity`) with `validationAlert`; snapping is `graph.graphHandler.guidesEnabled` (mxGuide); resize permission is `cellsResizable`/`isCellResizable()`; handler classes are swapped by overriding factory methods `graph.createHandler()` / `createEdgeHandler()` — the mxGraph-era substitute for a plugin.

---

## LogicFlow — the most explicit plugin system of the OSS set

Registration is global and static: `LogicFlow.use(Extension, props?)` with `static extensions: Map<string, ExtensionConfig>`; per-instance you pass `options.plugins`, veto globals with `options.disabledPlugins`, and configure each by name via `options.pluginsOptions[pluginName]`. At construction `installPlugins(disabledPlugins)` merges instance plugins with the global map, skips disabled ones, then `installPlugin()` supports **two shapes**: a class (`new ExtensionCtor({ lf, LogicFlow, props, options })`) or a definition object with `install(lf, LogicFlow)` + `render(lf, container)` — render functions are collected into `this.components` and invoked at render time; teardown iterates `this.extension` and calls `destroy?.()`. Every plugin must expose `pluginName`, and instances are reachable at `lf.extension[pluginName]` — [LogicFlow.tsx source](https://raw.githubusercontent.com/didi/LogicFlow/master/packages/core/src/LogicFlow.tsx); older definition-object form at [0.7 docs](https://07.logic-flow.cn/guide/extension/extension-intro.html). Built-ins in `@logicflow/extension`: MiniMap, Control, Menu, DndPanel, Snapshot, Group/DynamicGroup, curved edge, Selection/SelectionSelect, InsertNodeInPolyline, BPMN adapters/elements; layout plugins split into `@logicflow/layout` — [npm](https://www.npmjs.com/package/@logicflow/extension), [docs](https://docs.logic-flow.cn/docs/).

**Group auto-resize is implemented inside a plugin rather than in core** — a good model to copy. `DynamicGroup` (`static pluginName = 'dynamicGroup'`) registers its own node type in the constructor, and in `init()` subscribes `lf.on(EventType.NODE_MOUSEMOVE, this.onNodeMove)`, `NODE_DRAG`, `NODE_DND_ADD`; when `groupModel.isRestrict && autoResize`, `onNodeMove()` compares child bounds to parent bounds and expands the parent (`parent.minX = child.minX`, …) before recomputing position/size. Containment constraints are injected via **`graphModel.addNodeMoveRules()`** — a veto/transform hook on movement. Helpers: `addNodeToGroup()`, `getGroupByBounds()`, `detachNodeFromGroup()`, `checkGroupBoundsWithChildren()`; `destroy()` unregisters listeners and restores overridden methods — [dynamic-group source](https://raw.githubusercontent.com/didi/LogicFlow/master/packages/extension/src/dynamic-group/index.ts). Custom nodes/edges are a separate registry: `lf.register({ type, view, model })` where `view` extends `BaseNode`/`RectNode`/`HtmlNode` (override `getShape()` returning `h(...)`, or `setHtml(rootEl)`) and `model` extends `RectNodeModel`/`HtmlNodeModel` (override `setAttributes()`); models reach the rest of the app through `this.graphModel`, and the event bus is `lf.on/off` over `graphModel.eventCenter` — [customNode docs](https://07.logic-flow.cn/guide/advance/customNode.html).

---

## Blockly — a typed class registry + npm plugin ecosystem

A plugin is "a self-contained piece of code that adds functionality to Blockly", distributed on npm as `@blockly/plugin-*` / `@blockly/field-*`, versioned in lockstep with core (v13+), depending on Blockly as a **peerDependency**; discovery is the plugin directory/samples site and the npm keyword `blockly-plugin`, sources in a monorepo `packages/plugins/` — [plugins overview](https://docs.blockly.com/guides/plugins/overview). Usage pattern: import → call a register function (`registerFieldAngle()`) → reference by name (`type: "field_angle"`). Core replaceability runs through one typed registry: `Blockly.registry.register(Blockly.registry.Type.METRICS_MANAGER, 'YOUR_NAME', CustomMetricsManagerClass)`, or as the default with `Blockly.registry.register(Type.VARIABLE_MODEL, Blockly.registry.DEFAULT, CustomVariableModel, true)`, selected per-workspace through inject options: `Blockly.inject('blocklyDiv', { plugins: { 'metricsManager': CustomMetricsManagerClass } })`. Documented replaceable types: `blockDragger` (`Blockly.dragging.Dragger`), `connectionChecker` (`Blockly.ConnectionChecker`), `connectionPreviewer` (`InsertionMarkerPreviewer`), `flyoutsHorizontalToolbox`/`flyoutsVerticalToolbox`, `metricsManager`, `toolbox`, `variableMap`, `variableModel` — each "implement the interface, or extend the Blockly class and override only what you want" — [advanced customization](https://docs.blockly.com/guides/configure/customization/), [BLOCK_DRAGGER type](https://docs.blockly.com/reference/blockly.registry_namespace.type_class.block_dragger_property/). So drag behaviour is a strategy slot (`IDragger`), connection legality is a strategy slot (`connectionChecker`), renderer/field are registry entries. ⚠️ Not confirmed on the pages fetched: `Blockly.Extensions.register(name, fn)` mixins and the "workspace plugin takes `workspace` and calls `init()`" convention (e.g. `new Minimap(workspace).init()`) — both are real Blockly APIs but the customization page read didn't mention them — [registry.register reference](https://developers.google.com/blockly/reference/js/blockly.registry_namespace.register_1_function).

---

## Baklava.js v2 — plugins deliberately abolished, replaced by an events+hooks pipeline

v1's `editor.use(plugin)` is **gone**: "There is no 'plugin' concept anymore… use the new constructors" — `ViewPlugin` → **ViewModel** (`useBaklava(editor)` returning `IBaklavaViewModel`), the engine plugin → concrete engines (`DependencyEngine` reproduces v1 behaviour), `InterfaceTypePlugin` → explicit `NodeInterfaceType` objects, `OptionPlugin` → interfaces with `.setPort(false)` — [migration.md](https://raw.githubusercontent.com/newcat/baklavajs/master/docs/migration.md). Extension now happens through a first-class event/hook system in `@baklavajs/events`. Events: `class BaklavaEvent<T,E> extends Subscribable<EventListener<T,E>> { emit(data: T): void }` with `EventListener<T,E> = (data, entity) => any` — every listener also receives the **emitting entity**, which is how "proxied" events let you subscribe once and hear from all nodes/graphs. Veto is a distinct class: `class PreventableBaklavaEvent<T,E>` with `PreventableEventListener<T,E> = (data, prevent: () => void, entity) => any` and `emit(data): { prevented: boolean }` — used for all `before*` events — [event.d.ts](https://unpkg.com/@baklavajs/events/dist/event.d.ts), [event-system.md](https://raw.githubusercontent.com/newcat/baklavajs/master/docs/event-system.md). Transform hooks: `ParallelHook<I,O,E>.execute(data): O[]`, `DynamicSequentialHook<I,E,O extends I>.execute(data, entity): O`, `SequentialHook<I,E,O>` — "hooks have the ability to pass data from one hook to another… executed in the order they have been tapped into" — [hook.d.ts](https://unpkg.com/@baklavajs/events/dist/hook.d.ts). Subscription is **token-based**, not function-reference-based: `event.subscribe(token, handler)` / `event.unsubscribe(token)` where the token may be an object, array, Symbol or `this` — which is what makes inline arrow functions safe to unsubscribe.

Concretely, `Graph` exposes `events.beforeAddNode / addNode / beforeRemoveNode / removeNode / beforeAddConnection / addConnection / checkConnection / beforeRemoveConnection / removeConnection` plus `hooks.save`, `hooks.load`, and a **parallel** `hooks.checkConnection` used by `checkConnection(from, to)` returning a `CheckConnectionResult` discriminated union (allowed + the connections it would displace) — i.e. connection legality is an **aggregated-veto hook**, not a single predicate — [graph.d.ts](https://unpkg.com/@baklavajs/core/dist/graph.d.ts). `Editor implements IBaklavaEventEmitter, IBaklavaTapable` with `registerNodeType(type, options?)` / `unregisterNodeType(type)` (which also removes existing instances from all graphs), read-only `nodeTypes`/`graph`/`graphs`/`graphTemplates`/`loading`, sequential `hooks.save`/`hooks.load` over `IEditorState`, `load(state)` returning a warnings array, and preventable `before*` variants of every event — [Editor API](https://baklava.tech/api/classes/_baklavajs_core.Editor.html), [editor.d.ts](https://unpkg.com/@baklavajs/core/dist/editor.d.ts). `NodeInterface` carries `beforeSetValue` (preventable) and `load`/`save` SequentialHooks — [NodeInterface API](https://baklava.tech/api/classes/_baklavajs_core.NodeInterface.html). ⚠️ `baklava.tech` was unreachable by DNS from the fetcher; the two baklava.tech citations come from search snippets, everything else from npm `.d.ts` and repo markdown.

---

## Drawflow / LiteGraph.js / Flume

**Drawflow**: no extension architecture at all — a self-contained library with no plugin API. What exists is an event emitter, `editor.on(event, cb)`, over `nodeCreated`, `nodeRemoved`, `nodeDataChanged`, `nodeSelected`, `nodeUnselected`, `nodeMoved`, `connectionStart`, `connectionCancel`, `connectionCreated`, `connectionRemoved`, `connectionSelected`, `addReroute`/`removeReroute`/`rerouteMoved`, `moduleCreated/Changed/Removed`, `click`, `clickEnd`, `contextmenu`, `mouseMove`, `mouseUp`, `keydown`, `zoom`, `translate`, `import`, `export` — **all observe-only, no veto and no transform**. Node content is pluggable only in the templating sense: `editor.registerNode(name, component, props, options)` then `addNode(...)`; behaviour knobs are `reroute`, `curvature`, `zoom_min/max`, `draggable_inputs`, and the `edit`/`fixed`/`view` modes — [Drawflow README](https://raw.githubusercontent.com/jerosoler/Drawflow/master/README.md).

**LiteGraph.js**: the extension unit is a node class in a global registry — `LiteGraph.registerNodeType("basic/sum", MyAddNode)` (plus `LiteGraph.wrapFunctionAsNode("math/sum", fn, ["Number","Number"], "Number")`); slots declared in the constructor with `this.addInput("A","number")` / `this.addOutput("A+B","number")`, data via `getInputData()`/`setOutputData()`. Everything else is prototype callbacks on the node: `onExecute()`, `onDrawForeground()`, `onDrawBackground()`, `onMouseDown()`, `onPropertyChanged()`, `onConnectionsChange()`. The host wires `LGraph` + `LGraphCanvas` directly; there is no plugin/registry layer for tools, layout or routing — [LiteGraph README](https://raw.githubusercontent.com/jagenjo/litegraph.js/master/README.md).

**Flume**: extension is pure declarative configuration, no runtime hooks. `const config = new FlumeConfig()` then `config.addPortType({ type, name, label, color, controls: [Controls.text({name,label})] })` (`Controls.text/number/checkbox/select`) and `config.addNodeType({ type, label, description, initialWidth, inputs: ports => [ports.string()], outputs: ports => [ports.string()] })` — inputs/outputs as _functions_ of the port library is also the dynamic-node mechanism. The config is handed to the component: `<NodeEditor portTypes={config.portTypes} nodeTypes={config.nodeTypes} />`, and connection legality falls out of port-type names rather than a callback — [Flume basic config](https://flume.dev/docs/basic-config), [quick start](https://flume.dev/docs/quick-start).

---

## yFiles for HTML — input-mode composition + a lookup/decorator chain

Interaction is composed, not subclassed: `GraphEditorInputMode` is a multiplexing parent holding child input modes (`moveSelectedItemsInputMode`, `moveUnselectedItemsInputMode`, `createEdgeInputMode`, `marqueeSelectionInputMode`, `moveViewportInputMode`, …), and the framework's documented job is to arbitrate the shared "mouse down — drag — up" gesture between modes so they don't interfere; you add your own by installing a custom `IInputMode` into the parent — [multiplexing principles](https://docs.yworks.com/yfiles-html/dguide/customizing_interaction/customizing_interactions-multiplexing_principles.html), [adding custom input modes](https://docs.yworks.com/yfiles-html/dguide/customizing_interaction/customizing_interactions-cursor_input_modes.html), [GraphEditorInputMode API](https://docs.yworks.com/yfiles-html/api/GraphEditorInputMode.html). Orthogonal edge editing is a context object on the editor mode — `OrthogonalEdgeEditingContext`, on by default, with independent switches `CreateEdgeInputMode.orthogonalEdgeCreation` and `GraphEditorInputMode.orthogonalBendRemoval` set to `OrthogonalEdgeEditingPolicy.ALWAYS/NEVER` — [orthogonal edge editing](https://docs.yworks.com/yfiles-html/dguide/customizing_interaction_orthogonal_edges/). ⚠️ The input-mode specifics come from search snippets of those pages; the docs site is a JS app the fetcher could not render.

The genuinely distinctive mechanism is **`ILookup` + `GraphDecorator`**, a per-item, chained service locator that replaces both subclassing and plugin registration. Every graph item answers `item.lookup(SomeInterface)`; `IGraph.decorator` is a `GraphDecorator` facade split into `decorator.nodes`, `.edges`, `.labels`, `.ports`, `.bends`, each exposing one `LookupDecorator<TDecorated, TInterface>` per service — e.g. `graph.decorator.nodes.sizeConstraintProvider`, `.positionHandler`, `.reshapeHandleProvider`. Four registration verbs: `addConstant(impl)`, `addFactory(node => impl)`, **`addWrapperFactory((node, original) => impl)`** (decorate the default — e.g. return an `INodeSizeConstraintProvider.create({ getMinimumSize: () => original.getMinimumSize().multiply(0.5), … })`), and `hide()`. All four take an optional predicate to scope the decoration (`addConstant(node => !graph.isGroupNode(node), provider)`), and each returns an `IContextLookupChainLink` you can later pass to `graph.decorator.nodes.remove(chainLink)` — so decorations are an **ordered, removable chain**, not a single registry slot. Drag-time position control is therefore `decorator.nodes.positionHandler` (an `IPositionHandler`, typically wrapping the original to clamp/snap); resizing is `IReshapeHandler` + `INodeSizeConstraintProvider`; handle geometry is `NodeReshapeHandleProvider(node, node.lookup(IReshapeHandler), HandlePositions.CORNERS)` with `minimumSize`/`maximumSize` from the looked-up constraint provider — [Decorating Graph Elements](https://docs.yworks.com/yfiles-html/dguide/customizing_graph/customizing_graph-graph_decorator.html), [GraphDecorator](https://docs.yworks.com/yfiles-html/api/GraphDecorator.html), [NodeDecorator](https://docs.yworks.com/yfiles-html/api/NodeDecorator.html), [LookupDecorator](https://docs.yworks.com/yfiles-html/api/LookupDecorator.html), [NodeReshapeHandleProvider](https://docs.yworks.com/yfiles-html/api/NodeReshapeHandleProvider.html). Group auto-resize uses the same idea: size constraints on group nodes via `INodeSizeConstraintProvider.getMinimumEnclosedArea()` (the area that must stay enclosed — the children's bounds), honoured by the reshape handler. Layout and edge routing are interchangeable algorithm objects (`ILayoutAlgorithm`, `IEdgeRouter`/`EdgeRouter`). ⚠️ `GroupingSupport` and the exact group-auto-resize plumbing were not confirmed on a fetched page; `getMinimumEnclosedArea` is confirmed in the decorator sample.

---

## Q2. How do plugins change _where a node ends up_ during drag?

### Takeaway

Three distinct designs. **(a) Mutable-event chain** (diagram-js): the drag event object is passed through prioritised listeners and mutated in place before the modeling command runs — the most plugin-friendly. **(b) Per-item transform function** (GoJS `Part.dragComputation`, yFiles `IPositionHandler` via decorator, Rete `nodetranslate` pipe): a documented transform slot. **(c) Post-hoc change interception** (React Flow `onNodesChange` / `experimental_useOnNodesChangeMiddleware`, LogicFlow `addNodeMoveRules`): the position is already computed; you rewrite the emitted change. Vue Flow / Svelte Flow / Drawflow offer **none** — only observation and after-the-fact correction.

### Cited Findings

- **diagram-js `Dragging`** fires a prefixed lifecycle: `init`, `start`, `move`, `end`, `ended`, `cancel`/`canceled`, `cleanup`, `hover`/`out`. The `move` payload carries canvas-local `{ x, y, dx, dy, originalEvent, hover, hoverGfx }`, and `if (false === fire('start')) { return cancel(); }` — returning `false` from a `start`/`move` listener cancels the whole drag — [Dragging.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/dragging/Dragging.js)
- **Snapping mutates the event.** `GridSnapping` listens at `LOWER_PRIORITY` (1200) to `create.move`, `create.end`, `bendpoint.move.move/end`, `connect.move/end`, `connectionSegment.move.move/end`, `resize.move/end`, `shape.move.move`, `shape.move.end` and writes the snapped value back — [GridSnapping.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/grid-snapping/GridSnapping.js):
  ```javascript
  GridSnapping.prototype.snapEvent = function (event, axis, options) {
    var snappedValue = this.snapValue(event[axis], options);
    setSnapped(event, axis, snappedValue);
  };
  GridSnapping.$inject = ['elementRegistry', 'eventBus', 'config.gridSnapping'];
  ```
  `setSnapped` also **marks the axis as claimed**, so a lower-priority snapper skips an axis another plugin already handled — that is the cooperation protocol between competing snappers.
- **Alignment snapping** registers at `HIGHER_PRIORITY` on the same events — [CreateMoveSnapping.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/snapping/CreateMoveSnapping.js):
  ```javascript
  eventBus.on(['create.start', 'shape.move.start'], function (event) {
    self.initSnap(event);
  });
  eventBus.on(['create.move', 'create.end', 'shape.move.move', 'shape.move.end'], HIGHER_PRIORITY, function (event) {
    /* ... */ snapping.snap(event, snapPoints);
  });
  eventBus.on(['create.cleanup', 'shape.move.cleanup'], function () {
    snapping.hide();
  });
  CreateMoveSnapping.$inject = ['elementRegistry', 'eventBus', 'snapping'];
  ```
  Files: `CreateMoveSnapping.js`, `ResizeSnapping.js`, `SnapContext.js`, `SnapUtil.js`, `Snapping.js`, `index.js` — [lib/features/snapping](https://github.com/bpmn-io/diagram-js/tree/main/lib/features/snapping)
- **The final commit reads the mutated delta, and rules veto continuously** — [Move.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/move/Move.js):
  ```javascript
  function canMove(shapes, delta, position, target) {
    return rules.allowed('elements.move', { shapes, delta, position, target });
  }
  delta.x = round(delta.x);
  delta.y = round(delta.y);
  if (delta.x === 0 && delta.y === 0) {
    return;
  }
  modeling.moveElements(shapes, delta, context.target, { primaryShape: context.shape, attach: isAttach });
  MoveEvents.$inject = ['eventBus', 'dragging', 'modeling', 'selection', 'rules'];
  ```
  `canMove` runs at MEDIUM_PRIORITY on `shape.move.start` (gate the gesture) and again at LOW_PRIORITY on `shape.move.move` (veto a specific drop target).
- **Resize constraints are contributed through the start event's context**, not via options: "It's possible to customize the resizing behaviour by intercepting `'resize.start'` and providing the following parameters through the `'context'`: `minDimensions ({ width, height })` … `childrenBoxPadding ({ left, top, bottom, right } || number)`", then `context.newBounds = ensureConstraints(resizeBounds(shape, direction, delta), resizeConstraints)` and finally `rules.allowed('shape.resize', ctx)` — [Resize.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/resize/Resize.js)
- **Rete:** `nodetranslate` is emitted before `nodetranslated`; a pipe sees `{ id, ...position }` and may mutate or cancel it — [retejs/area-plugin](https://github.com/retejs/area-plugin/blob/main/src/index.ts)
- **GoJS:** `Part.dragComputation`, "a function used to determine the location that this Part can be dragged to", signature (Part, proposed Point, snapped Point) → Point — [api/Part](https://gojs.net/latest/api/symbols/Part.html)
- **yFiles:** `graph.decorator.nodes.positionHandler.addWrapperFactory((node, original) => …)` wraps the default `IPositionHandler` — [Decorating Graph Elements](https://docs.yworks.com/yfiles-html/dguide/customizing_graph/customizing_graph-graph_decorator.html)
- **React Flow: none during drag** (see `XYDrag.ts` pipeline above); the substitute is intercepting the emitted `NodePositionChange` via controlled `onNodesChange` or `experimental_useOnNodesChangeMiddleware` — [useOnNodesChangeMiddleware.ts](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnNodesChangeMiddleware.ts), demo [RestrictExtent.tsx](https://github.com/xyflow/xyflow/blob/main/examples/react/src/examples/Middlewares/RestrictExtent.tsx). The Helper Lines example is the canonical userland version — [Helper Lines](https://reactflow.dev/examples/interaction/helper-lines)
- **LogicFlow:** `graphModel.addNodeMoveRules()` registers a movement veto/transform rule, used by the DynamicGroup plugin to keep children inside their group — [dynamic-group source](https://raw.githubusercontent.com/didi/LogicFlow/master/packages/extension/src/dynamic-group/index.ts)

### Inferences

- The reusable pattern is **"mutable intent object + ordered chain + a claim flag"**. The claim flag (diagram-js `setSnapped`) is the detail most systems omit, and without it two independent snappers fight. ngx-vflow, which already _describes_ structural changes to the app rather than applying them, is well positioned to run a `DragIntent { position, snapped?: { x?: boolean; y?: boolean } }` through an ordered plugin chain before the change is emitted — architecturally this is diagram-js's model with ngx-vflow's existing "describe, don't apply" boundary.
- React Flow's middleware map (Symbol-keyed, unordered `Map`) shows the cost of retrofitting: there is **no priority**, so two middlewares' relative order is registration/mount order and effectively undefined. Designing priority in from the start is cheap; adding it later is not.

### Gaps

- A fetch summary of `Dragging.js` claimed "listeners cannot mutate x/y"; this contradicts `GridSnapping.snapEvent`/`setSnapped` and `Move.js` reading the final delta. I treat the source-level evidence from GridSnapping/CreateMoveSnapping/Move as authoritative but did not read `Dragging.js` line by line to pinpoint where the mutated value is re-read.

---

## Q3. Parent / group auto-resize

### Takeaway

Nearly every library implements it as an **after-the-fact reaction to a completed child change**, not as a constraint applied during the drag — and the good ones expose the padding/offset policy as overridable methods rather than options. The distinguishing quality is whether the derived resize joins the same undo transaction (diagram-js: yes; React Flow: it is just more changes in the stream; Rete: no transaction concept).

### Cited Findings

- **diagram-js `AutoResize` is a `CommandInterceptor`** — [AutoResize.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/auto-resize/AutoResize.js):
  ```javascript
  export default function AutoResize(eventBus, elementRegistry, modeling, rules) {
    CommandInterceptor.call(this, eventBus);
    this._elementRegistry = elementRegistry;
    this._modeling = modeling;
    this._rules = rules;
    // ...
  }
  AutoResize.$inject = ['eventBus', 'elementRegistry', 'modeling', 'rules'];
  ```
  It hooks **`postExecuted`** on `shape.create`, `elements.move`, `shape.toggleCollapse`, `shape.resize`; each handler calls `self._expand(elements, parent)`, which checks rules, computes optimal bounds and cascades up the parent chain. Overridable policy methods: `getOffset()` ("amount to expand the given shape in each direction", default TRBL 60/100), `getPadding()` ("activation threshold for each side for which resize triggers", default TRBL 2/15), `getOptimalBounds()`, `resize()` → `modeling.resizeShape()`. Because the expansion runs inside `postExecuted` of the original command, it joins the same command-stack transaction and undoes atomically with the child move.
- **Rete `ScopesPlugin`** does the same with pipes on the area scope — [retejs/scopes-plugin](https://github.com/retejs/scopes-plugin/blob/main/src/index.ts):
  ```javascript
  this.addPipe(async (context) => {
    if (context.type === 'nodetranslated') {
      if (!isTranslating(id)) {
        await translateChildren(id, context.data, props);
      }
      if (parent && !agentParams.exclude(id)) {
        await resizeParent(parent, agentParams, props);
      }
    }
    if (context.type === 'noderemoved') {
      if (parent) {
        await resizeParent(parent, agentParams, props);
      }
    }
    if (context.type === 'scopeupdated') {
      await resizeParent(parent, agentParams, props);
    }
  });
  ```
  Moving a **parent** translates its children; moving/removing a **child** resizes the parent to the children's bbox plus `padding`. Config is per-node functions — `size: (nodeId, size) => ({ width: size.width, height: 100 })`, `padding`, `exclude`; setup is `area.use(scopes)` + `scopes.addPreset(ScopesPresets.classic.setup())`; signals `scopepicked`/`scopereleased`; listens to `nodepicked`, `nodetranslated`, `nodedragged`, `noderemoved`; classic UX is "long-press a node and drop it onto another to nest it" — [Rete scopes guide](https://retejs.org/docs/guides/scopes/), [rete-scopes-plugin API](https://retejs.org/docs/api/rete-scopes-plugin/)
- **React Flow `expandParent`**: grow-only, change-emitting, drag-and-measurement-triggered, with sibling compensation — see the React Flow section above — [handleExpandParent in store.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/store.ts)
- **GoJS `Placeholder`**: the group's template contains a Placeholder that "assumes the size and position of the union of the bounds of all of the group's member parts, plus some padding" — declarative, no code — [intro/groups](https://gojs.net/latest/intro/groups.html)
- **maxGraph `SwimlaneManager`**: propagates sizes to siblings and ancestors via `swimlaneAdded()`, `cellsAdded()`, `cellsResized()`→`resizeSwimlane()` — [SwimlaneManager API](https://maxgraph.github.io/maxGraph/api-docs/classes/SwimlaneManager.html)
- **LogicFlow `DynamicGroup`**: expands the parent inside `onNodeMove` when `groupModel.isRestrict && autoResize` — auto-resize lives _in a plugin_, not core — [dynamic-group source](https://raw.githubusercontent.com/didi/LogicFlow/master/packages/extension/src/dynamic-group/index.ts)
- **yFiles**: `INodeSizeConstraintProvider.getMinimumEnclosedArea()` — the area that must stay enclosed, honoured by the reshape handler — [Decorating Graph Elements](https://docs.yworks.com/yfiles-html/dguide/customizing_graph/customizing_graph-graph_decorator.html)

### Inferences

- Auto-resize is the canonical stress test of a plugin system: it requires observing a completed change, issuing a **derived** change, and having the derived change be undoable together with the original. diagram-js passes cleanly (commands); Rete passes structurally (pipes + async) but without transactional grouping beyond the history plugin's ~200 ms `getRecent(1000)` windowing and manual `history.separate()` — [Rete undo-redo](https://retejs.org/docs/guides/undo-redo/). GoJS's declarative `Placeholder` is the cheapest ergonomics of all but only works because GoJS owns layout.
- For ngx-vflow, whose structural changes are _described to the app_, diagram-js is the closer analogue: a plugin should be able to **append derived changes to the same emitted change-set** rather than triggering a second round-trip through the app's state.

### Gaps

- I did not verify whether diagram-js `AutoResize` guards re-entrancy (a resize triggering another `shape.resize` `postExecuted`).

---

## Q4. Layout engines taking over positions

### Takeaway

Across every library, **node layout is an imperative, app-triggered command that produces positions**, while **edge routing is a continuously-called strategy slot**. That asymmetry is consistent and worth copying.

### Cited Findings

- **Rete `AutoArrangePlugin`** (ELK), attached to the area — [Rete arrange guide](https://retejs.org/docs/guides/arrange/):
  ```ts
  const arrange = new AutoArrangePlugin<Schemes>();
  arrange.addPreset(ArrangePresets.classic.setup());
  area.use(arrange);
  await arrange.layout();

  const applier = new ArrangeAppliers.TransitionApplier<Schemes, AreaExtra>({
    duration: 500,
    timingFunction: (t) => t,
  });
  await arrange.layout({ applier });
  ```
  Note the clean separation of **layout algorithm** (preset → ELK) from **position applier** (immediate vs animated transition).
- **React Flow**: pure userland — compute, `setNodes()`, `fitView()`; no layout slot — [Layouting guide](https://reactflow.dev/learn/layouting/layouting), [Dagre](https://reactflow.dev/examples/layout/dagre), [elkjs](https://reactflow.dev/examples/layout/elkjs)
- **GoJS**: `Layout` subclass with `doLayout()`, assigned to `Diagram.layout` / `Group.layout`; re-run policy declarative via `isInitial`/`isOngoing`/`invalidateLayout()` and per-part `layoutConditions` — [intro/layouts](https://gojs.net/latest/intro/layouts.html)
- **maxGraph `LayoutManager`**: override `getLayout(cell, eventName)` to return a layout per parent cell; runs automatically on MOVE_CELLS / RESIZE_CELLS / BEGIN_UPDATE / END_UPDATE — [LayoutManager API](https://maxgraph.github.io/maxGraph/api-docs/classes/LayoutManager.html). This is the only _automatic, reactive_ layout slot in the set.
- **diagram-js**: no node-layout service in core; `layouter` is connection-only — [BaseLayouter.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/layout/BaseLayouter.js)
- **LogicFlow**: layouts split into a separate `@logicflow/layout` package — [docs](https://docs.logic-flow.cn/docs/)

### Inferences

- maxGraph's `LayoutManager` is the one design that makes layout _reactive_ rather than imperative, and it does it with a single override (`getLayout(cell, eventName)`) plus an ancestor/descendant collection walk. If ngx-vflow wants layout plugins that re-run on graph change, that is the reference design; if it wants app-controlled layout, Rete's algorithm/applier split is the reference.

---

## Q5. What maintainers say about plugin-system tradeoffs

### Cited Findings

- **Rete (pro formal plugins):** v1's problem was "All events were concentrated in the core. Plugins can create their own events, leading to an overwhelming number of events that aren't isolated." v2's answer is the cascade: "plugins can be connected not only to the editor instance but also to other plugins… data, also known as signals, [is] transmitted from the parent plugin to all child plugins, where they can be transformed or prevented." Presets replaced feature flags to avoid "dozens of options, each requiring 5-10 more options to customize these features." Explicit priority statement: "Flexibility and extensibility have a higher priority than a multitude of features that can be easily enabled with a flag." — [Rete.js 2 announcement](https://dev.to/ni55an/retejs-2-visual-programming-for-reactjs-angular-and-vuejs-2072)
- **diagram-js (pro DI modules):** "When talking about _modules_ in the context of diagram-js, we refer to units that provide named services along with their implementation." — [bpmn-js walkthrough](https://bpmn.io/toolkit/bpmn-js/walkthrough/); and didi's rationale for name-shadowing: "Later modules override earlier declarations sharing the same name, enabling testing and customization without modifying original code." — [didi README](https://github.com/nikku/didi)
- **Baklava (against plugins):** v2 removed the concept outright — "There is no 'plugin' concept anymore" — replacing `editor.use(plugin)` with explicit constructors plus a typed event/hook pipeline — [migration.md](https://raw.githubusercontent.com/newcat/baklavajs/master/docs/migration.md)
- **xyflow (silence):** the two community discussions asking about plugins/packaging — [#4551](https://github.com/xyflow/xyflow/discussions/4551) and [#5034](https://github.com/xyflow/xyflow/discussions/5034) — **both have no maintainer answer**. The team nonetheless shipped `experimental_useOnNodesChangeMiddleware` in 12.10.0 — [What's new 2025-12-04](https://reactflow.dev/whats-new/2025-12-04) — which is a registry hook without calling itself one.

### Inferences

- The consequence of the ad-hoc approach is visible in xyflow: every non-trivial capability (auto layout, proximity connect, helper lines, undo/redo, collaborative editing, expand/collapse) is a **copy-pasted example**, not an installable package, and users asking how to ship one get no answer. The library stays small and the ecosystem stays fragmented.
- The consequence of the formal approach is visible in Rete and bpmn-js: real third-party/first-party plugin ecosystems (15+ Rete packages; bpmn-js is _itself_ a plugin stack on diagram-js), at the cost of ordering rules the user must understand (`readonly.root` before everything else) and magic priority numbers leaking into plugin code (`1500`, `LOWER_PRIORITY = 1200`).
- Baklava is the cautionary middle: it concluded that "plugin" was the wrong abstraction and that **typed, preventable events + sequential transform hooks** were the actual load-bearing primitives. For ngx-vflow this is arguably the most directly applicable lesson — the primitives (preventable event, sequential hook, token-based subscription) matter more than the `use()` ceremony around them.

### Gaps

- I found **no maintainer statement, for or against, a plugin API anywhere in xyflow discussions or issues.** Claims that the xyflow team have publicly debated a plugin system are unverified and probably false.
- A fetch summary of the Rete dev.to article listed "debugging difficulty and plugin-cascade ordering" as acknowledged downsides; I could not verify that as a direct maintainer quote and do not treat it as one.

---

## Q6. Edge routing as a strategy slot — what inputs does a router get?

### Takeaway

The two libraries with real router registries (X6, JointJS) define a router as the _same_ pure function — `(vertices, args, view) => points` — and **neither passes obstacles**. That signature is structurally incapable of expressing global obstacle avoidance, and JointJS's libavoid integration proves it: they stepped outside the router registry entirely and built a graph-level service that writes `vertices` back onto links.

### Cited Findings

- **X6:** `RouterDefinition<T> = (this: EdgeView, vertices: PointLike[], options: T, edgeView: EdgeView) => PointLike[]`; registration `Graph.registerRouter(name, fn)` / `Graph.unregisterRouter(name)`; selection per-edge `edge.setRouter(name, args)` or globally `connecting: { router: { name, args } }`. Obstacle logic lives _inside_ the built-in `manhattan` router, configured by `step` (default 10), `excludeTerminals`, `excludeShapes`, `excludeNodes`, `startDirections`, `padding`/`paddingBox` and a cost function — [src/registry/router/index.ts](https://github.com/antvis/X6/blob/master/src/registry/router/index.ts), [registry/router docs](https://x6.antv.antgroup.com/en/api/registry/router)
- **JointJS:** `GenericRouter<K>` = `(vertices: dia.Point[], args?, linkView?: dia.LinkView) => dia.Point[]`; `RouterArgumentsMap` is open-ended (`[key: string]: { [key: string]: any }`) so custom names typecheck. Built-ins `normal`, `manhattan`, `metro`, `orthogonal`, `oneSide` (deprecated → `rightAngle`), `rightAngle`. `manhattan` args include `isPointObstacle?: (point) => boolean`, `excludeEnds`, `excludeTypes`, `maximumLoops`, `fallbackRouter` — [types/routers.d.ts](https://github.com/clientIO/joint/blob/master/packages/joint-core/types/routers.d.ts), [routers docs](https://docs.jointjs.com/api/routers/)
- **libavoid via `@joint/router-avoid`:** "libavoid maintains a single incremental router shared by the whole graph: it tracks every element as an obstacle and every link as a connector, and reroutes affected connectors whenever obstacles move. This package wraps that behavior in a `RouterService` that listens to a `dia.Graph` and, whenever libavoid computes a new route for a link, applies it directly to that link's `vertices` and source/target anchors — **there is no `router: { name: ... }` attribute to set on links**." API `loadAvoidRouter()`, `initAvoidRouter(graph, options)` → `{ start(), routeAll(), routeSubgraph(), destroy() }` + a `link:routed` event; deps `@joint/core ~4.3.3` + `libavoid-js 0.4.5`; three demo variants (`ui-thread`, `web-worker`, `web-worker-perf`) — [README](https://unpkg.com/@joint/router-avoid@4.3.3/README.md), [demo source](https://github.com/clientIO/joint-demos/blob/main/libavoid-standalone-link-routing/js/src/ui-thread/app.js), [demo page](https://www.jointjs.com/demos/libavoid-standalone-link-routing)
- **diagram-js:** routing is a _replaceable DI service_ (`layouter`) rather than a named registry: `BaseLayouter#layoutConnection(connection, hints)` returns waypoints; `ManhattanLayout` offers `connectRectangles`, `repairConnection`, `tryLayoutStraight` with directions `'h:h'|'v:v'|'h:v'|'v:h'` or explicit sides, and hints `preferredLayouts`, `preserveDocking`, `connectionStart`/`connectionEnd`. **No obstacle avoidance.** — [BaseLayouter.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/layout/BaseLayouter.js), [ManhattanLayout.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/layout/ManhattanLayout.js)
- **GoJS** is the outlier that _does_ ship obstacle-aware routing as a first-class declarative value: `Link.routing = Routing.AvoidsNodes` "adjusts to avoid crossing over nodes" (explicitly slower), with `Node.avoidable` as the per-node opt-out and a separate `Router` class that "runs on the collection of links in a Diagram or Group **after the Layout has been completed**" — again a graph-level pass, not a per-link function — [intro/links](https://gojs.net/latest/intro/links.html)
- **maxGraph/mxGraph:** routers are named entries in a style registry — `mxStyleRegistry.putValue('myEdgeStyle', mxEdgeStyle.MyStyle)`, referenced by style key — [mxEdgeStyle](https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxEdgeStyle-js.html). ⚠️ _Release notes only_: maxGraph replaced `StyleRegistry` with `EdgeStyleRegistry`/`PerimeterRegistry`, e.g. `EdgeStyleRegistry.add('elbowEdgeStyle', EdgeStyle.ElbowConnector, { handlerKind: 'elbow', isOrthogonal: true })` — note the **metadata** alongside the function (which handler kind, whether it's orthogonal), which a pure-function registry cannot express — [maxGraph releases](https://github.com/maxGraph/maxGraph/releases)
- **React Flow:** no router slot at all. A custom edge component calls `getBezierPath` / `getSmoothStepPath` / `getStraightPath` / `getSimpleBezierPath` itself and is registered via the `edgeTypes` map — [getBezierPath](https://reactflow.dev/api-reference/utils/get-bezier-path)

### Inferences

- If ngx-vflow wants router plugins, the per-edge pure function is the right _default_ slot, but it must be paired with either (a) an obstacle/spatial-index service the router can query, or (b) a separate "global routing pass" extension point that runs after layout/measure and writes waypoints — GoJS's `Router` and JointJS's `RouterService` are the same idea arrived at independently.
- maxGraph's registry-with-metadata is worth copying: a router entry that declares `isOrthogonal` lets the framework pick the right bendpoint/handle behaviour without asking the plugin author to also patch the handles.

---

## Q7. Rotation — which libraries support it and what it does to handles/anchors/routing

### Takeaway

Rotation is a _paid or plugin_ feature almost everywhere (X6 Transform plugin, JointJS+ `ui.FreeTransform`, GoJS `RotatingTool`), and the hard part is uniformly solved the same way: compute anchors in the un-rotated frame and rotate the result back. None of the React/Vue/Svelte Flow family supports node rotation at all.

### Cited Findings

- **X6:** `node.angle()` / `node.rotate(deg, options)` (`src/model/node.ts` ~line 541); the `Transform` plugin's `rotating` option adds rotate handles with `rotateGrid` snapping (default **15°**), alongside `resizing` with `orthogonal` (default true), `preserveAspectRatio`, `allowReverse`, `restrictedResizing`, min/max width/height — [X6 transform plugin](https://x6.antv.antgroup.com/en/tutorial/plugins/transform). Anchor resolution under rotation: `Node.getBBox`-side code normalizes the angle, picks a quadrant, builds "a rectangle in size of the un-rotated node", applies `.rotate(-angle, bbox.getCenter())`, then converts back via polar coordinates. ⚠️ Source-read, undocumented. There is a `node:change:angle` model event.
- **JointJS+:** `ui.FreeTransform` provides combined resize + rotate handles (and `ui.BPMNFreeTransform` a BPMN-flavoured variant) — paid `@joint/plus` — [ui.FreeTransform docs nav](https://docs.jointjs.com/api/ui/Snaplines/)
- **GoJS:** rotation is declarative per-part — `Part.rotatable`, `rotateObjectName`, `rotateAdornmentTemplate`, with `RotatingTool.snapAngleMultiple` / `snapAngleEpsilon` for snapping — exactly mirroring the resize triple (`resizable`, `resizeObjectName`, `resizeAdornmentTemplate`) — [api/Part](https://gojs.net/latest/api/symbols/Part.html), [intro/tools](https://gojs.net/latest/intro/tools.html)
- **React Flow / Svelte Flow / Vue Flow:** no node rotation. `NodeResizer` handles resize only; the drag pipeline in `XYDrag.ts` has no angle concept — [packages/system/src/xydrag/XYDrag.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/xydrag/XYDrag.ts)
- **Rete:** no rotation; nodes are DOM elements positioned by translate.

### Inferences

- The recurring design is: **rotation is a property of the node model (`angle`), handles are a separate adornment/widget plugin, and every geometry consumer (anchors, connection points, bbox, hit-testing) must go through a shared un-rotate/re-rotate helper.** If ngx-vflow ever wants rotation, that helper has to exist in the core geometry layer _before_ any plugin can add rotate handles — it cannot be bolted on from a plugin.

### Gaps

- I found no library in this set that documents how edge _routing_ (as opposed to anchoring) accounts for rotated obstacles. libavoid works on polygons so it presumably handles it, but I found no source saying so.

---

## Q8. Proximity connect — who has it natively and via what hook?

### Takeaway

Only X6 and JointJS have it as a **framework option**; everywhere else it is userland code hanging off drag events.

### Cited Findings

- **X6:** `connecting.snap: boolean | { radius: number; anchor?: 'center' | 'bbox' }` — "Snap edge to the closest node/port in the given radius on dragging". It composes with `validateConnection` / `validateMagnet` / `allowPort` / `highlight` — [Graph API](https://x6.antv.antgroup.com/en/api/graph/graph), [src/graph/options.ts](https://github.com/antvis/X6/blob/master/src/graph/graph.ts)
- **JointJS:** `snapLinks?: boolean | { radius?, findInAreaOptions? }`, plus `snapLinksSelf?: boolean | { distance: number }`, `snapLabels?: boolean`, and `markAvailable?: boolean` (highlight valid magnets during a connect gesture) — [Paper API](https://docs.jointjs.com/api/dia/Paper/), `packages/joint-core/types/dia.d.ts`. The libavoid demo uses `snapLinks: { radius: 30 }` together with `linkPinning: false` — [demo source](https://github.com/clientIO/joint-demos/blob/main/libavoid-standalone-link-routing/js/src/ui-thread/app.js)
- **React Flow:** userland only — the [Proximity Connect example](https://reactflow.dev/examples/nodes/proximity-connect) "shows how to automatically create edges when a node is dropped in close proximity to another one", implemented with `onNodeDrag` + `onNodeDragStop` + `useStoreApi().getState().nodeLookup`. Note this is the _inverse_ gesture from X6/JointJS: React Flow snaps a **dragged node to a new edge**, whereas X6/JointJS snap a **dragged edge terminal to a nearby port**.
- **diagram-js:** the equivalent is the snapping module family operating on `connect.move`/`connect.end` and `bendpoint.move.*` at prioritised listeners — [GridSnapping.js](https://github.com/bpmn-io/diagram-js/blob/main/lib/features/grid-snapping/GridSnapping.js)
- **GoJS:** `LinkingTool`/`portGravity` style proximity is part of the linking tools rather than an option; ⚠️ I did not verify a specific `portGravity` citation, so treat GoJS proximity as unconfirmed here.

### Inferences

- Proximity connect is really two different features that share a name. Implementing it as a plugin needs (a) a spatial query over handles/nodes in viewport coordinates and (b) a hook that runs during both the _edge-drag_ and the _node-drag_ gestures. ngx-vflow would need to expose handle geometry to plugins for the first; the second falls out of the drag-intent chain proposed in Q2.

---

## Cross-cutting synthesis for ngx-vflow

### Formal plugin system vs ad-hoc hooks — the consequences

| Approach                          | Libraries                                                                                                  | Consequence observed                                                                                                                                                                                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Formal + ordered interception** | Rete.js (signal pipes), diagram-js (DI + priorities + commands)                                            | Real ecosystems: 15+ Rete packages; bpmn-js _is_ a module stack on diagram-js. Cost: documented ordering rules (`readonly.root` first), magic priority numbers (`1500`, `1200`) in plugin code.                                                                                           |
| **Formal but thin**               | X6 (`use`), G6 (`register` + spec diff), maxGraph (`plugins: []`), LogicFlow (`use`), Blockly (`registry`) | Plugins can add behaviour and UI, but **cannot veto interactions** — veto stays in framework options. X6 has no `update()` and no priority; G6's declarative reconcile is the most Angular-compatible design found.                                                                       |
| **Ad-hoc hooks + examples**       | React Flow, Svelte Flow, Vue Flow, JointJS(core), GoJS                                                     | Capabilities ship as copy-paste examples, not packages. xyflow users asking how to publish an add-on get no maintainer answer ([#4551](https://github.com/xyflow/xyflow/discussions/4551), [#5034](https://github.com/xyflow/xyflow/discussions/5034)). Small core, fragmented ecosystem. |
| **Deliberately no plugins**       | Baklava v2                                                                                                 | Concluded the load-bearing primitives are _preventable events + sequential transform hooks + token-based subscription_, not `use()` ceremony.                                                                                                                                             |

### The concrete primitives worth copying, ranked by evidence

1. **Present-tense (cancellable) / past-tense (notification) event pairs** — Rete `nodecreate`/`nodecreated`, Baklava `beforeAddNode`/`addNode`, diagram-js `preExecute`/`postExecuted`. Universal across every system that supports veto.
2. **Numeric priority over registration order** — diagram-js (default 1000, higher first) composes better for third parties than Rete's `use()` order or React Flow's unordered Symbol-keyed middleware `Map`.
3. **A mutable intent object plus a _claim flag_** — diagram-js `setSnapped(event, axis, value)` is the only mechanism found that lets two independent snappers cooperate instead of fighting.
4. **Sequential transform hooks with typed in/out** — Baklava `SequentialHook<I,E,O>` / `DynamicSequentialHook`, and the `ParallelHook` used for `checkConnection` (aggregated veto, returning _which_ connections would be displaced rather than a bare boolean).
5. **Provider collection with an updater form** — diagram-js palette/contextPad: a provider returns either an entries object or `entries => entries`, so a later plugin can _remove_ an earlier plugin's UI entry.
6. **Named strategy services replaceable by name** — didi's "later module wins", JointJS's per-paper `routerNamespace`, maxGraph's `EdgeStyleRegistry` with metadata.
7. **Logic plugin + render preset split** — Rete's minimap (`area.use(minimap)` + `render.addPreset(Presets.minimap.setup())`) maps directly onto Angular: plugin provides behaviour, a separate provider supplies the component projected into a layer.
8. **Declarative, reconciled extension specs** — G6's `setExtensions()` array diff by `key` (enter/update/exit) is the only model here that fits a signals/template-driven Angular API rather than imperative `use()`.

### Packaging signal

Two independent libraries **reversed** granular add-on packaging during the period covered: Vue Flow 2.0 collapsed `@vue-flow/{background,controls,minimap,node-resizer,node-toolbar}` into `@xyflow/vue` ([RFC #906](https://github.com/bcakmakoglu/vue-flow/discussions/906)), and X6 3.x collapsed eleven `@antv/x6-plugin-*` packages into `@antv/x6` ([X6 3.x upgrade](https://github.com/antvis/X6/blob/master/site/docs/tutorial/update.en.md)). React Flow had already done it in v12. Meanwhile Rete (15+ packages), Blockly (`@blockly/plugin-*` with core as a peer dep) and LogicFlow (`@logicflow/extension`, `@logicflow/layout`) keep the split. The differentiator appears to be whether _third parties_ are expected to publish plugins: where they are, granular packaging with a peer dep survives; where add-ons are all first-party, it gets merged.

### Gaps across the whole study

- No maintainer statement, for or against a plugin API, exists anywhere in xyflow's discussions or issues — claims to the contrary are unverified.
- Pro/paid example source (React Flow Pro, JointJS+) could not be read; those entries rest on prose descriptions and API listings.
- AntV doc sites are client-rendered SPAs, so X6/G6 facts here were verified against GitHub source; the cited doc URLs are correct for a browser but not for a fetcher.
- G6 combo auto-resize option name, GoJS proximity/`portGravity`, diagram-js `AutoResize` re-entrancy guarding, and maxGraph's post-`StyleRegistry` routing API remain unconfirmed.
