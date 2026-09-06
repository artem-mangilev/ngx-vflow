# Keyboard connection patterns in graph libraries

Subsequent decision, 2026-09-05: the user requested rolling back issue 11; keyboard connection creation is unsupported for now. These findings are retained as research, not an implementation commitment. See [issue 11](issues/11-implement-keyboard-editing-and-announcements.md).

Research date: 2026-09-05. Primary documentation and first-party source only; no runtime, visual, or assistive-technology testing was performed. This note distinguishes a core feature from an official recipe and does not equate keyboard navigation with keyboard creation of a connection.

## GoJS: core virtual pointer, with an explicit visible pressed state

The current API identifies **GoJS 4.0.2**. Its core `CommandHandler` supplies an opt-in focus-navigation and virtual-pointer mode: enable it programmatically (`isFocusEnabled`, `isVirtualPointerEnabled`) or toggle with **Ctrl+Alt+Enter**. **Tab retains native DOM navigation**; it does not cycle graph ports. Focus navigation has its own `focusBox` adornment, separate from selection. The virtual pointer has a configurable `virtualPointerBox`; `focusChanged` and `virtualPointerChanged` provide application hooks. [CommandHandler API](https://gojs.net/latest/api/symbols/CommandHandler.html)

The official accessibility guide explicitly demonstrates creating a link:

1. Arrow keys focus a node, **Enter** enters its objects, and arrow keys select a port.
2. Hold **Shift** to show the virtual pointer at that port. **Shift+Enter** generates mouse-down.
3. **Shift+arrows** move it in 10 document-unit increments; add **Ctrl** for 1-unit increments. This starts and drives the normal linking tool.
4. **Shift+Enter** generates mouse-up and completes the link at the target.

The pressed virtual pointer has a **thick dark-cyan circle**, providing feedback even before moving away from the source. Holding Shift is not necessary continuously between virtual down/up events. This is spatial pointer emulation, not a sequence of focusable source/target controls. [Accessibility guide](https://gojs.net/latest/learn/accessibility), [virtual pointer API](https://gojs.net/latest/api/symbols/CommandHandler.html#virtualPointerBox)

While the linking tool is active, its configurable **`temporaryLink`** draws the pending connection. `temporaryFromNode/Port`, `temporaryToNode/Port` and link validation support customization. **Escape** calls the tool's cancel operation. Changing focus also cancels tools started by the virtual pointer. [LinkingTool API](https://gojs.net/latest/api/symbols/LinkingTool.html#temporaryLink), [tool cancellation](https://gojs.net/latest/api/symbols/LinkingTool.html#doKeyDown), [focus policy](https://gojs.net/latest/api/symbols/CommandHandler.html)

The guide offers generic screen-reader support but asks application authors to customize what is announced for their diagram. It illustrates an application-supplied output element and `focusChanged`/`liveElementId`. The documented core interaction feedback is the focus adornment, virtual pointer, and pending link; the guide's explanatory keyboard table and simulations are documentation UI. This does not establish that users discover the mode without instruction. [Screen-reader customization](https://gojs.net/latest/learn/accessibility#customizing-for-screen-readers)

## yFiles for HTML: core preview and candidates; keyboard workflow as an official recipe

The default `GraphEditorInputMode` documentation describes creating edges by dragging from a port candidate or using touch. Its keyboard-navigation section concerns navigation/selection, not a complete source/target connection workflow. Therefore a built-in keyboard-only connection sequence is **not established by the reviewed default-mode documentation**. This is narrower than claiming that keyboard creation is impossible. [Supported interactions](https://docs.yworks.com/yfiles-html/dguide/interaction-support/)

Core `CreateEdgeInputMode` provides a pending edge (`previewGraph`/`previewEdge`), port-candidate rendering, and a highlighted current end-candidate owner (`showEndHighlight`, default true). `showPortCandidates` defaults to all; applications can configure these visuals and `portCandidateRenderer`. `startEdgeCreation`, `startPortCandidate`, `endPortCandidate`, `isCreationInProgress`, lifecycle events and `edgeCreator` expose the operation. These are interaction primitives and indicators, not an application instruction panel. [CreateEdgeInputMode API](https://docs.yworks.com/yfiles-html/api/CreateEdgeInputMode/), [customizing edge creation](https://docs.yworks.com/yfiles-html/dguide/customizing_interaction_creating_edges/)

The official **Graph Wizard for Flowchart** demo implements a concrete keyboard workflow in application source. Source snapshot: `yWorks/yfiles-for-html-demos` commit **522d47ae108d20fc0aed72d6301c4c057e33a94f**; its repository manifest labels the demo distribution **31.0.2**. This is not a separately verified version of the live hosted demo. [Manifest](https://github.com/yWorks/yfiles-for-html-demos/blob/522d47ae108d20fc0aed72d6301c4c057e33a94f/package.json)

- **R** starts a cross-reference from the current node's center using `startEdgeCreation`.
- **Arrow keys** navigate spatially to a node and update `endPortCandidate`, so the pending edge follows the chosen candidate rather than requiring precise keyboard pointer movement.
- **Enter** confirms. A demo-defined `KeyboardCreateEdgeInputMode extends CreateEdgeInputMode` installs the keyboard finish recognizer and endpoint behavior; this class lives in the demo, not the imported library.
- The reviewed subclass inherits cancellation; it does not declare its own cancel key. The demo describes **Escape** for backing out of multi-step actions, but this research did not independently verify the exact Escape behavior for its cross-reference gesture.

[Start/finish actions](https://github.com/yWorks/yfiles-for-html-demos/blob/522d47ae108d20fc0aed72d6301c4c057e33a94f/demos/showcase/graph-wizard-for-flowchart/Actions.ts#L418), [arrow navigation](https://github.com/yWorks/yfiles-for-html-demos/blob/522d47ae108d20fc0aed72d6301c4c057e33a94f/demos/showcase/graph-wizard-for-flowchart/Actions.ts#L222), [keyboard subclass](https://github.com/yWorks/yfiles-for-html-demos/blob/522d47ae108d20fc0aed72d6301c4c057e33a94f/demos/showcase/graph-wizard-for-flowchart/GraphWizardInputMode.ts#L1045)

This recipe **does supply application UI**: a contextual legend of active actions with shortcuts, plus buttons near the current item, accessible with Tab/Enter. The source refreshes that legend from action preconditions and defines “Set edge target” with Enter while edge creation is active. The custom creation mode displays end-port candidates and reuses the core edge preview. **No claim is made that a useful non-zero-length line appears immediately on R before selecting another node**: the start code passes the source center as the initial location, and this was not visually tested. [Demo explanation](https://www.yworks.com/demos/showcase/graph-wizard-for-flowchart/), [legend implementation](https://github.com/yWorks/yfiles-for-html-demos/blob/522d47ae108d20fc0aed72d6301c4c057e33a94f/demos/showcase/graph-wizard-for-flowchart/GraphWizardInputMode.ts#L340)

## JointJS: keyboard recipe infrastructure, plus customizable availability indicators

Current **JointJS 4.3** React accessibility guidance explicitly leaves ARIA roles, focus order and keyboard handlers to application rendering. It suggests an additional nonvisual representation of nodes and their connections. This is direct evidence of the accessibility boundary, not proof that every JointJS integration has no shortcuts. [Custom elements: accessibility](https://docs.jointjs.com/react/getting-started/custom-elements/)

The core port tutorial documents **click-and-drag** creation, with `magnet`, `defaultLink`, `validateMagnet` and `validateConnection`. It also offers an especially relevant visual primitive: enable **`markAvailable`** to mark connectable targets during dragging, then style `.available-magnet` and `.available-cell`. The `highlighting` option allows custom class or stroke highlighters for magnet and element availability. These are library-owned states with application-controlled styling; they do not force explanatory prose into the graph. [Ports and availability marking](https://docs.jointjs.com/learn/features/ports/#marking-available-magnets)

**JointJS+** supplies the optional commercial `ui.Keyboard` plugin to register application-defined shortcuts and filter keyboard events; that API is not a prebuilt keyboard connection workflow. Current React-plus defaults cover selection/deletion, clipboard and undo/redo when their backing features are installed. The reviewed default interaction list does not include keyboard connection creation. **No exact built-in start/navigation/confirm/cancel sequence was found in the reviewed JointJS/JointJS+ docs**; a custom handler creating links remains application logic. [Keyboard feature boundary](https://www.jointjs.com/features), [Keyboard API](https://docs.jointjs.com/api/ui/Keyboard/), [React built-in interactions](https://docs.jointjs.com/react/features/diagram/)

## AntV X6 — configurable connection feedback; no keyboard connection workflow in the examined handlers

Source snapshot: `@antv/x6` 3.1.8, commit `b14ca27540693c610257e7687c663f122deb0006` (upstream HEAD resolved on 2026-09-05, not a claim about the latest npm release).

- `Keyboard` provides application key bindings via `bindKey`; it does not install a connection workflow. The examined node connection handler starts from magnet mouse-down/drag and delegates the new edge's target dragging. This is evidence about those built-in handlers, not a claim that no application or extension can implement keyboard connections. [Keyboard documentation](https://x6.antv.antgroup.com/en/tutorial/plugins/keyboard), [keyboard source](https://github.com/antvis/X6/blob/b14ca27540693c610257e7687c663f122deb0006/src/plugin/keyboard/index.ts#L51-L58), [connection start](https://github.com/antvis/X6/blob/b14ca27540693c610257e7687c663f122deb0006/src/view/node/index.ts#L943-L1043).
- The useful visual precedent is `connecting.highlight` (default `false`). Applications can enable highlighting of available nodes/ports during pointer connection. `highlighting` defines separate `nodeAvailable`, `magnetAvailable`, and `magnetAdsorbed` appearances, with stroke or CSS-class highlighters. The library handles rendering and state; the application chooses whether/how to display it. This feature is not itself keyboard support. [Interaction/highlighting documentation](https://x6.antv.antgroup.com/en/api/model/interaction), [validation-driven candidate highlighting](https://github.com/antvis/X6/blob/b14ca27540693c610257e7687c663f122deb0006/src/view/edge/index.ts#L2305-L2351).

## Rete.js — replaceable connection interaction plugin

Source snapshot: `rete-connection-plugin` 2.0.5, commit `343ee308f26694b5f48083ce81201e72b4ecb4f9` (upstream HEAD resolved on 2026-09-05).

- The supplied `ClassicFlow` uses socket click/press then destination click/release. A pseudo-connection follows the pointer. The plugin source registers `pointerdown`, handles area `pointermove`/`pointerup`, and selects sockets through coordinates; no keydown/keyup handlers were found in this plugin's `src`. Thus its shipped interaction is not a native Tab/Enter connection workflow. [Guide](https://retejs.org/docs/guides/connections/), [pinned input handling](https://github.com/retejs/connection-plugin/blob/343ee308f26694b5f48083ce81201e72b4ecb4f9/src/index.ts#L60-L141).
- Custom flows/presets, `connectionpick`/`connectiondrop` pipes and `canMakeConnection`/`makeConnection` allow application-defined behavior. The temporary edge has `isPseudo: true`, allowing rendering customization. No generic instructional panel is required by this contract. [Connection API](https://retejs.org/docs/api/rete-connection-plugin/), [customization guide](https://retejs.org/docs/guides/connections/).

## maxGraph — connection tool and key-binding primitives

- The documented `KeyHandler` supplies initially empty key maps and application callback binding. `Escape` cancels editing/connecting. No complete built-in keyboard-only source/target selection sequence was found in the inspected `KeyHandler` and `ConnectionHandler` APIs. This is a documentation-scoped finding, not an exhaustive audit of all maxGraph applications. [KeyHandler](https://maxgraph.github.io/maxGraph/api-docs/classes/KeyHandler.html).
- `ConnectionHandler` describes mouse-driven start/move/release, preview updates, source/target highlighting, and `START`/`CONNECT`/`RESET` events. It exposes `start`, `connect`, and preview customization such as `getEdgeColor`/`getEdgeWidth`. These are interaction visuals and extension hooks; an application-specific keyboard workflow still has to be composed. [ConnectionHandler](https://maxgraph.github.io/maxGraph/api-docs/classes/ConnectionHandler.html).

## Related application, not a library feature: draw.io

The draw.io application offers `Alt+Shift+Arrow` (`Option+Shift+Arrow` on macOS): connect to an existing shape in that direction, or clone and connect if there is none. This produces a result directly, avoiding a waiting-for-destination mode. It also makes application-specific choices about direction, target selection and creating a node. Do not attribute this application command to maxGraph's core, or copy its automatic node creation into ngx-vflow's application-owned graph contract. [Official shortcut description](https://www.drawio.com/docs/reference/shortcuts/shortcut-clone-connect/).

## Implications for ngx-vflow — interpretation, not a settled design

The examined products do not establish a common native Tab-between-handles connection convention. GoJS uses a virtual pointer; the yFiles example composes a spatial keyboard workflow; X6, Rete and maxGraph expose interaction primitives without demonstrating that same keyboard contract.

There are two separate responsibilities: rendering the active connection attempt (origin/candidate indicators and preview), and teaching the application's users what to do (instructional panel, tutorial, legend). A general-purpose engine can provide configurable interaction visuals without imposing an instructional panel. X6's opt-in highlighters are a particularly close precedent for that boundary.

For ngx-vflow, investigate explicit styleable origin/current-candidate states and clear preview behavior first. Textual hints can remain application-owned. Whether to keep native Tab traversal or adopt spatial candidate navigation is a separate design decision; these findings do not authorize changing the accepted shortcut contract. No production code or issue acceptance criteria were changed by this research.
