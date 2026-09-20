# Plugin use-cases for ngx-vflow: how other libraries implement advanced features, and which hooks they need

Scope note: this file documents, per feature, (1) how 2–4 libraries implement it with source links, (2) the exact data + hooks the implementation needs from the engine and at which point of the interaction lifecycle, (3) pitfalls. Every feature section ends with a `hook | phase | sync/async | veto/transform/observe | reads | writes` table. A final section answers the four cross-cutting questions.

Vocabulary used throughout:

- **observe** — the plugin is told what happened and may write back to state afterwards.
- **transform** — the plugin receives a value mid-interaction and returns a replacement that the engine then uses (position → adjusted position).
- **veto** — the plugin can return `false`/`null` to forbid the operation.
- **strategy override** — the plugin replaces an engine algorithm wholesale (edge path, layout).
- **extra UI layer** — the plugin needs to render something that is not in application state.

---

## Feature 1 — Parent/group auto-resize (expandParent / auto-grow / shrink-to-fit)

### Takeaway

There are two distinct architectures. React Flow computes parent expansion **synchronously inside the drag loop** as a pure function that emits a batch of changes (parent dimension + parent position + compensating sibling positions), because its child coordinates are parent-relative. diagram-js, mxGraph, X6 and Rete instead run expansion **after the move commits**, as a command-stack post-execute interceptor or an async pipe, which is only possible because their coordinates are absolute (or because they refuse to move the parent origin). ngx-vflow has nested/parent-relative coordinates, so it is structurally in the React Flow camp and inherits the compensation problem.

### Cited Findings

**React Flow / xyflow**

- The entire feature is one pure function `handleExpandParent` in the framework-agnostic system package — it takes `ParentExpandChild[]` (`{ id, parentId, rect }`) and **returns an array of `NodeDimensionChange | NodePositionChange`; it writes nothing itself** — [packages/system/src/utils/store.ts#L313-L393](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/store.ts#L313-L393), type at [utils/types.ts#L5](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/types.ts#L5).
- It runs **during the drag move, synchronously**: the d3 `.on('drag')` handler runs `updateNodes()`, which mutates `dragItem.position` / `internals.positionAbsolute` and calls `updateNodePositions(dragItems, true)` — [XYDrag.ts#L324](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/xydrag/XYDrag.ts#L324), [XYDrag.ts#L214](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/xydrag/XYDrag.ts#L214). The React store's `updateNodePositions` collects `parentExpandChildren` and calls `handleExpandParent` before `triggerNodeChanges`, so **every pointer move emits one batch containing both child-position and parent-dimension changes** — [packages/react/src/store/index.ts#L211-L262](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/store/index.ts#L211-L262).
- The child's relative position is **clamped at zero** while expanding: `position: expandParent ? { x: Math.max(0, dragItem.position.x), y: Math.max(0, dragItem.position.y) } : dragItem.position` — same file. This is what keeps the child visually still while the parent's top-left moves out from under it.
- **Siblings are explicitly compensated.** When the expanded rect starts left/above the parent, `handleExpandParent` computes `xChange`/`yChange`, moves the parent back by that amount and then offsets every _other_ child of that parent in the opposite direction, with the in-source comment _"We move all child nodes in the oppsite direction so the x,y changes of the parent do not move the children"_ — [store.ts#L313-L393](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/store.ts#L313-L393). Dragged children are excluded from the loop (they already got the `Math.max(0, …)` clamp).
- **Ancestor recursion is not done in one call.** `handleExpandParent` handles exactly one level. The emitted dimension change carries `setAttributes: true`, which `applyNodeChanges` turns into real `node.width`/`node.height` ([packages/react/src/utils/changes.ts#L126-L147](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/utils/changes.ts#L126-L147)); the parent's DOM box then changes, the ResizeObserver fires `updateNodeInternals`, and _that_ re-enters the expansion logic — so **recursion up the ancestor chain costs one measurement frame per level**.
- The dimension path is a second entry point: `updateNodeInternals` pushes into `parentExpandChildren` when `dimensionChanged && node.expandParent && node.parentId`, using `nodeToRect(newNode, nodeOrigin)` — [store.ts#L487-L505](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/store.ts#L487-L505). Interactive resize is a third: `NodeResizeControl.onChange` calls `handleExpandParent([child], …)` directly with the same clamp — [NodeResizeControl.tsx#L91-L125](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/additional-components/NodeResizer/NodeResizeControl.tsx#L91-L125); `XYResizer` carries a `parentNode` field commented _"Needed to fix expandParent"_ and applies a top/left correction at [XYResizer.ts#L297-L310](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/xyresizer/XYResizer.ts#L297-L310).
- `expandParent` **suppresses `extent: 'parent'` clamping**: the clamping extent is only built `if (node.extent === 'parent' && !node.expandParent)` — [graph.ts#L436](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/graph.ts#L436). The two features are mutually exclusive by construction.
- It **never shrinks**: `Math.max(dimensions.width, Math.round(expandedRect.width))`. `origin`/`nodeOrigin` participates in the arithmetic (`widthChange = (newWidth - dimensions.width) * origin[0]`).
- User-facing docs: [expandParent example](https://reactflow.dev/examples/nodes/expand-parent), [Node type reference](https://reactflow.dev/api-reference/types/node).

**diagram-js `auto-resize`**

- [`AutoResize.js`](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/auto-resize/AutoResize.js) is a `CommandInterceptor` registering **`postExecuted`** on `shape.create`, `elements.move`, `shape.toggleCollapse`, `shape.resize` — [L57-L127](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/auto-resize/AutoResize.js#L57-L127). Correction to a common assumption: there is **no `shape.move` interceptor**; shape drags arrive as `elements.move`, whose `context.closure.topLevel` is grouped by `element.parent.id` and expanded per group.
- Because `postExecuted` fires while the command stack is still inside the enclosing execute, the `modeling.resizeShape` it issues ([L258-L260](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/auto-resize/AutoResize.js#L258-L260)) becomes a **child command, so one undo reverts move _and_ resize atomically**. The CommandStack documents this explicitly: _"Command handlers may execute other modeling operations (and thus commands) in their `preExecute(d)` and `postExecute(d)` phases. The command stack will properly group all commands together into a logical unit that may be re- and undone atomically."_ — [CommandStack.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/command/CommandStack.js).
- **Veto is delegated to the rules system**: `_expand` calls `this._rules.allowed('element.autoResize', { elements, target })` and bails if false — [L193-L200](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/auto-resize/AutoResize.js#L193-L200); [`AutoResizeProvider.js`](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/auto-resize/AutoResizeProvider.js) defines the rule with `canResize` defaulting to `false`, i.e. the feature is opt-in per toolkit. Per-command opt-out via `hints.autoResize === false` (or an array of elements to consider).
- **Two thresholds**: `getPadding` (default `{top:2,bottom:2,left:15,right:15}`) is the _activation_ threshold; `getOffset` (default `{top:60,bottom:60,left:100,right:100}`) is how far past the child's edge the new border lands. `_getOptimalBounds` only assigns a violated side and merges with the target's current TRBL — **grow-only, never shrink** (a grep of `lib/` for "shrink" turns up only an unrelated viewbox comment in `Canvas.js`).
- **Ancestor recursion is synchronous and unconditional**: `_expand` ends with `if (parent) { this._expand([ target ], parent); }` — [L216-L221](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/auto-resize/AutoResize.js#L216-L221).
- **No child compensation is needed** because diagram-js shape `x`/`y` are absolute diagram coordinates; `ResizeShapeHandler.execute` assigns `{x,y,width,height}` onto the shape and touches no children — [ResizeShapeHandler.js](https://github.com/bpmn-io/diagram-js/blob/b228eb96f19430e8f865ddd3b5c32aec07ac2c26/lib/features/modeling/cmd/ResizeShapeHandler.js). This is the single biggest architectural divergence from React Flow.

**Rete.js `ScopesPlugin`**

- [`ScopesPlugin`](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/index.ts#L86-L129) installs an **async pipe** reacting to `nodetranslated`, `noderemoved` and its own `scopeupdated` signal. It **observes and writes back**; it never vetoes (the pipe always `return context`).
- `resizeParent` is **shrink-to-fit as well as grow**: it computes the children's bounding box, sets the parent to exactly `width + padding.left + padding.right`, then `await agentParams.translate(parent.id, outerLeft, outerTop)` — the parent is _moved_ to hug the box; with no children it collapses to the padding. Defaults `{ top: 40, left: 20, right: 20, bottom: 20 }`; recurses up explicitly — [src/sizing.ts#L51-L83](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/sizing.ts#L51-L83).
- **Feedback-loop guard is explicit.** Because the parent moves, translating children would re-trigger the resize. `trackedTranslate` keeps a refcount map and exposes `isTranslating(id)`; the pipe guards with the comment _"prevent translating children if the node translation is triggered by its resizing (when its children moved)"_, and the docblock says _"keep track of currently moving nodes (to prevent infinite loop)"_ — [src/utils.ts#L39-L65](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/utils.ts#L39-L65). Two further guards (`hasSelectedParent(id)`, `belongsTo(id, pickedNodes)`) suppress resizing while a whole subtree is dragged.
- **Reparenting is drag-end only.** The classic agent picks candidates on `nodepicked` after a 250 ms timeout, **cancels on `nodetranslated`** (moving aborts the pick), and on `nodedragged` calls `reassignParent(ids, pointer, …)` — [src/agents/classic/index.ts#L49-L64](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/agents/classic/index.ts#L49-L64). `reassignParent` hit-tests the pointer against node views, picks the front-most by DOM index, reassigns `node.parent`, then resizes **both** the new parent and every former parent — that last loop is what makes drop-_out_ shrink the old group — [src/scope.ts#L11-L63](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/scope.ts#L11-L63). Guide: [retejs.org/docs/guides/scopes](https://retejs.org/docs/guides/scopes).

**GoJS, mxGraph, X6 (brief)**

- **GoJS is layout-driven, not event-driven**: a `Placeholder` in the group template _"assumes the size and position of the union of the bounds of all of the group's member parts, plus some padding"_ — [gojs.net/latest/intro/groups.html](https://gojs.net/latest/intro/groups.html). Because the group size is a measured consequence of its members, there is no expand hook, no compensation and no recursion problem — it falls out of measure/arrange. `Group.layout` is _"responsible for the positioning of member Nodes"_, which is also the cleanest answer to "auto-layout inside a group".
- **mxGraph** has `extendParents = true`, `extendParentsOnAdd = true`, `extendParentsOnMove = false` — [mxGraph.js#L1376-L1397](https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/view/mxGraph.js#L1376-L1397). `extendParent(cell)` is minimal: only `p.width = Math.max(p.width, geo.x + geo.width)` and the same for height — [L6027-L6058](https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/view/mxGraph.js#L6027-L6058). It **never moves the parent's origin**, so parent-relative child geometry never needs compensation; the cost is that you cannot drag a child off the top-left. Recursion falls out of `cellsResized([parent],…)` re-checking `isExtendParent` — [L5805-L5828](https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/view/mxGraph.js#L5805-L5828). Call sites `cellsAdded` (L4786), `cellsFolded` (L5270), `cellsMoved` (L6257, gated by `isExtendParentsOnMove()`), all inside `model.beginUpdate()/endUpdate()` → atomic undo. Layout-driven sizing alternatives: `mxStackLayout.resizeParent/resizeParentMax/fill`, `mxSwimlaneManager` (listens on `ADD_CELLS`/`CELLS_RESIZED`, recursively `resizeSwimlane`).
- **AntV X6 implements reparenting, not expansion.** `processEmbedding` runs on every mousemove: resolves candidates via `options.embedding.findParent` (`'pointer' | 'bbox' | fn`), optionally restricts to top z-index (`frontOnly`), runs the `validate` hook — a genuine **veto** — and only highlights. `finalizeEmbedding` on mouseup wraps `insertChild`/`unembed` in `graph.startBatch('embedding')` — [src/view/node/index.ts#L791-L877](https://github.com/antvis/X6/blob/master/src/view/node/index.ts#L791-L877), [L886-L922](https://github.com/antvis/X6/blob/master/src/view/node/index.ts#L886-L922). X6 positions are absolute, so `Node.translate` recurses into `eachChild(child => child.translate(tx, ty, options))` and stamps `options.translateBy = options.translateBy || this.id` to identify the initiator and prevent re-entrancy — [src/model/node.ts#L445-L533](https://github.com/antvis/X6/blob/master/src/model/node.ts#L445-L533).
- JointJS covers the same ground declaratively on the Paper: `embeddingMode: true`, `findParentBy: 'bbox' | 'pointer' | 'center' | 'origin' | 'corner' | 'topRight' | 'bottomLeft' | function(elementView, evt, x, y)`, and `validateEmbedding(childView, parentView) => boolean` — [docs.jointjs.com/api/dia/Paper](https://docs.jointjs.com/api/dia/Paper/).

### Inferences

- With parent-relative coordinates (ngx-vflow's model), auto-grow **cannot** be a pure "observe + write back" plugin: if the parent origin moves, every sibling's stored position becomes wrong in the same tick. The engine must either (a) give the plugin a batched write that applies parent + siblings atomically, or (b) forbid the parent origin from moving (mxGraph's choice), which forbids growing to the left/top.
- The cheapest correct design for ngx-vflow is React Flow's: a **pure transform** `(dragItems, nodeLookup) => Change[]` invoked synchronously in the drag loop, whose output the engine applies as one batch. This keeps the plugin free of feedback loops, because the plugin never writes.
- Recursion up ancestors should be done **synchronously inside the plugin** (diagram-js/Rete style) rather than via re-entrancy through measurement (React Flow style). React Flow's variant costs one frame per nesting level and is the most likely source of visible lag/jitter.
- "Shrink-to-fit" and "auto-grow" are the same plugin with a different clamp; only Rete ships both. If ngx-vflow wants shrink, it must additionally handle "former parents" on reparent (Rete's `reassignParent` loop).
- Since ngx-vflow describes structural changes rather than applying them, the _resize_ part of auto-resize is an interactive-property write (allowed), but the _reparent_ part must be emitted as a structural operation at drag end.

### Gaps

- I did not find an explicit `AutoResizeProvider` in diagram-js core that enables resizing for a generic shape type — bpmn-js supplies its own provider; the default is off. The exact per-toolkit enabling code is out of scope here.
- No library I examined does auto-grow **and** keeps a stable parent origin **and** supports growing left/top. That combination appears unsolved in the ecosystem.

### Hook table — Feature 1

| hook needed                                         | phase                                                 | sync/async                        | veto/transform/observe                                     | reads                                                                             | writes                                                                                |
| --------------------------------------------------- | ----------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `handleExpandParent`-style pure transform (drag)    | drag move, every pointer event                        | sync                              | transform (pure → change batch)                            | `position`, `positionAbsolute`, measured size, `parentId`, `origin`, sibling list | parent `position` + `size`, dragged child `position` (clamped ≥0), sibling `position` |
| same transform on size change                       | after render / ResizeObserver → `updateNodeInternals` | async (post-measure)              | transform                                                  | DOM rect, measured size, `parentId`, `extent`                                     | parent `size`, handle bounds                                                          |
| post-commit interceptor (diagram-js `postExecuted`) | after the move command commits, in-transaction        | sync                              | observe + write (veto delegated to a rule)                 | element & target TRBL, `getOffset`, `getPadding`, `parent`                        | `modeling.resizeShape(target, newBounds)` only                                        |
| auto-resize veto rule                               | before expanding                                      | sync                              | **veto** (`element.autoResize` rule)                       | `{ elements, target }`                                                            | —                                                                                     |
| shrink-to-fit pipe (Rete)                           | `nodetranslated` / `noderemoved` / own signal         | async (awaited)                   | observe + write back                                       | children `position`/`size`, `padding`, exclusion set                              | parent `size` **and** parent `position`, recursive up                                 |
| reparent on drop                                    | drag end (`nodedragged` / mouseup)                    | sync (decision) + structural emit | transform (choose parent) + **veto** (`validateEmbedding`) | pointer, view rects, z-order, `findParentBy`                                      | structural op: `node.parent`; then resize new + former parents                        |
| re-entrancy guard                                   | across all of the above                               | —                                 | engine-provided                                            | "is this translation engine-initiated?" (`isTranslating`, `translateBy`)          | —                                                                                     |

---

## Feature 2 — Layout engines as plugins (dagre, ELK, d3-force, cola)

### Takeaway

**Essentially nobody intercepts the position write for layout.** React Flow, ngx-graph, Rete, Cytoscape, X6/G6 all _compute, then write_. The only two genuine write-side hooks in the survey are JointJS's `DirectedGraph` `setPosition` option and Rete's `applier` — and both answer "_how_ do the computed positions land" (animated vs instant), never "_what_ should the position be". Nothing anywhere offers a veto on a user-initiated position write. The one contract that treats one-shot and continuous layout uniformly, and the only one with drag hooks, is ngx-graph's `Layout` interface.

### Cited Findings

**React Flow — one-shot layout is purely post-hoc**

- React Flow ships no layout engine and no layout slot: _"We have not implemented our own layouting solution yet, but will present some viable external libraries on this page"_ — [reactflow.dev/learn/layouting/layouting](https://reactflow.dev/learn/layouting/layouting).
- The dagre recipe is a free function returning _new_ arrays which the component pushes into state — [LayoutingFlow2-Dagre/index.js](https://github.com/xyflow/react-flow-docs/blob/main/src/components/CodeViewer/api-flows/LayoutingFlow2-Dagre/index.js):
  ```js
  const layouted = getLayoutedElements(nodes, edges, { direction });
  setNodes([...layouted.nodes]);
  setEdges([...layouted.edges]);
  window.requestAnimationFrame(() => {
    fitView();
  });
  ```
  `fitView()` is deferred by one `requestAnimationFrame`; the ELK variant's comment explains why: _"Give React and React Flow a chance to update and render the new node positions before we fit the viewport."_
- The ELK variant mutates ELK's result children in place and hands them straight to `setNodes` — [LayoutingFlow6-Elkjs/index.js](https://github.com/xyflow/react-flow-docs/blob/main/src/components/CodeViewer/api-flows/LayoutingFlow6-Elkjs/index.js). **There is no reconciliation against a graph that may have changed during the await.**
- Measurement ordering is the hard constraint: dagre _"needs to know the dimensions of each node in order to lay them out"_, and React Flow only knows dimensions after DOM measurement. Hence `useNodesInitialized()` — _"This hook tells you whether all the nodes in a flow have been measured and given a width and height"_; it returns `false` initially, takes `options.includeHiddenNodes` (default `false`), and _"always returns `false` if the internal nodes array is empty"_ — [reactflow.dev/api-reference/hooks/use-nodes-initialized](https://reactflow.dev/api-reference/hooks/use-nodes-initialized).
- The _only_ interception point React Flow offers is the controlled-change pipeline: drags emit `NodePositionChange` = `{ id, type: "position", position, positionAbsolute, dragging }` into `onNodesChange`, and `applyNodeChanges(changes, nodes) => nodes` is documented as _"If you don't need any custom behavior, this util can be used"_ — [NodeChange](https://reactflow.dev/api-reference/types/node-change), [applyNodeChanges](https://reactflow.dev/api-reference/utils/apply-node-changes). **No layout example uses it.**

**React Flow — continuous layout (d3-force)**

- The force example replaces `getLayoutedElements` with `useLayoutedElements` _"because d3-force's layouting algorithm is iterative, so we need a way to keep computing the layout across multiple renders"_ — [reactflow.dev/learn/layouting/layouting](https://reactflow.dev/learn/layouting/layouting), example page [reactflow.dev/examples/layout/force-layout](https://reactflow.dev/examples/layout/force-layout).
- v11 source ([LayoutingFlow4-D3-Force/index.js](https://github.com/xyflow/react-flow-docs/blob/main/src/components/CodeViewer/api-flows/LayoutingFlow4-D3-Force/index.js)) shows the whole contract: a `useStore` selector used as a _readiness gate_ (`every(node => node.width && node.height)`), and a `tick()` that reads dragging state and pins the dragged node, with the in-source comment _"Setting the fx/fy properties of a node tells the simulation to 'fix' the node at that position and ignore any forces that would normally cause it to move."_
  ```js
  const dragging = Boolean(document.querySelector(`[data-id="${node.id}"].dragging`));
  nodes[i].fx = dragging ? node.position.x : null;
  nodes[i].fy = dragging ? node.position.y : null;
  simulation.tick();
  setNodes(nodes.map((node) => ({ ...node, position: { x: node.x, y: node.y } })));
  window.requestAnimationFrame(() => {
    fitView();
    if (running) tick();
  });
  ```
  The guide notes that passing `getNodes`/`getEdges` rather than `nodes`/`edges` _"is important when combined with the store selector in initialized because it will prevent us from reconfiguring the simulation any time the nodes update."_
- In the **current v12 build** of that example (pulled from the live bundle at `https://example-apps.xyflow.com/react/learn/layouting-flow-4-d3-force/index.html`, asset `assets/162-CDJmMFIm.js`) drag detection has been upgraded from a DOM query to a `dragRef` fed by `onNodeDragStart` / `onNodeDrag` / `onNodeDragStop`, positions are written as `n.fx ?? n.x`, and `toggle()` re-syncs the simulation's node array from live React Flow positions before restarting — _the closest thing in React Flow to a staleness guard_.

**ngx-graph — the only real drag-aware layout interface** ([layout.model.ts](https://github.com/swimlane/ngx-graph/blob/master/projects/swimlane/ngx-graph/src/lib/models/layout.model.ts))

```ts
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

- `Graph | Observable<Graph>` is the key trick: the same method serves one-shot and continuous layouts. `DagreLayout.run()` returns a `Graph` synchronously ([dagre.ts](https://github.com/swimlane/ngx-graph/blob/master/projects/swimlane/ngx-graph/src/lib/graph/layouts/dagre.ts)); `D3ForceDirectedLayout.run()` returns `this.outputGraph$.asObservable()` and pushes a new graph on every d3 `'tick'` ([d3ForceDirected.ts](https://github.com/swimlane/ngx-graph/blob/master/projects/swimlane/ngx-graph/src/lib/graph/layouts/d3ForceDirected.ts)). The host normalizes with `result instanceof Observable ? result : of(result)` ([graph.component.ts](https://github.com/swimlane/ngx-graph/blob/master/projects/swimlane/ngx-graph/src/lib/graph/graph.component.ts)).
- **The drag hooks are observers, not interceptors.** `GraphComponent.onDrag()` calls `layout.onDrag(node, event)` and _then still applies its own delta_ (`node.position.x += event.movementX / this.zoomLevel`, then rewrites `node.transform`). The layout mirrors the drag into simulation state (`fx`/`fy`, `alphaTarget(0.3).restart()` on start, `alphaTarget(0)` + clear on end) but cannot veto or rewrite it.
- `updateEdge(graph, edge)` is called **per incident edge during the drag** so the layout can re-route edges live. Disabling drag synthesizes a `mouseup` and calls `layout.onDragEnd(...)` so the layout is never left with a stuck pin.

**Rete `auto-arrange-plugin` — ELK + a pluggable "applier"** ([src/index.ts](https://github.com/retejs/auto-arrange-plugin/blob/main/src/index.ts), [guide](https://retejs.org/docs/guides/arrange))

- ELK-only and async; nodes must carry `width`/`height` because _"elkjs requires these values"_. Defaults: `elk.algorithm: 'layered'`, `elk.hierarchyHandling: 'INCLUDE_CHILDREN'`, `elk.edgeRouting: 'POLYLINE'`.
- The **applier is the extension seam for _how positions land_**:
  ```ts
  export abstract class Applier<S, K> {
    editor!: NodeEditor<S>;
    area!: BaseAreaPlugin<S, K>;
    setEditor(e);
    setArea(a);
    public abstract apply(nodes: ElkNode[]): Promise<void>;
  }
  ```
  `StandardApplier.apply` recurses children and **converts ELK's parent-relative coordinates to absolute** by threading an offset (`this.translateNode(id, offset.x + x, offset.y + y)` then recursing with the accumulated offset), because Rete's area plugin is absolute-positioned. `TransitionApplier` overrides `translateNode`/`resizeNode` to interpolate over `duration` (default 2000) with `timingFunction`, `onTick(t)`, a `needsLayout(id)` predicate, and `cancel(id)` / `destroy()` — [transition applier](https://github.com/retejs/auto-arrange-plugin/blob/main/src/appliers/list/transition/index.ts).
- Nesting: _"Any node that has the `parent` property will be considered as a nested node."_

**Cytoscape.js — a formal layout plugin contract**

- Registration is `cytoscape('layout', 'name', LayoutClass)`; _"The extension registers a layout prototype"_ — [extensions.md](https://github.com/cytoscape/cytoscape.js/blob/unstable/documentation/md/extensions.md). The prototype, verbatim: `constructor(options)` with `options.cy` and `options.eles` (_"The collection of elements passed to the layout"_); `run()` — _"calls `eles.layoutPositions()` to set the final layout positions, if the layout is discrete"_, _"starts the async layout, if the layout is continuous"_, _"A continuous layout may use a worker … or it may run several layout iterations per call of `requestAnimationFrame()`"_, _"Each visible iteration of a continuous layout may set `nodes.positions()`"_; `stop()` — _"This function is specified only for continuous layouts."_
- `cy.layout(options)` looks up `cy.extension('layout', name)` and does `new Layout({...options, cy, eles})` — [core/layout.mjs](https://github.com/cytoscape/cytoscape.js/blob/unstable/src/core/layout.mjs). Lifecycle events are emitted by `layoutPositions` — [collection/layout.mjs](https://github.com/cytoscape/cytoscape.js/blob/unstable/src/collection/layout.mjs): `layoutstart` first; with `options.animate`, each node gets `node.animation({position, duration: animationDuration, easing: animationEasing})`, `layoutready` fires immediately and `layoutstop` only after `Promise.all(layout.animations.map(a => a.promise()))`; without animation, `nodes.positions(getFinalPos)` writes directly and `layoutready`/`layoutstop` fire back-to-back. `options.transform(node, newPos)` is a per-node post-transform. **This is direct mutation of model positions, not a controlled store.**

**X6 / G6 / JointJS (brief)**

- AntV ships layout as a separate package, [@antv/layout](https://github.com/antvis/layout) — _"turns graph structures into renderable coordinates"_; you run it over `{nodes, edges}` and feed the result back into X6, converting coordinates because **X6 uses top-left while the algorithms emit centers** — [X6 layout docs](https://x6.antv.vision/en/docs/tutorial/advanced/layout/).
- **G6 v5 is the most formalized**: `register(ExtensionCategory.LAYOUT, 'layout-id', CustomLayoutClass)` with `execute(data, options): Promise<GraphData>` (always async), plus `tick(): LayoutMapping`, `stop()` and `destroy()` for iterative layouts, which call `options.onTick` each iteration — [g6 custom layout](https://g6.antv.antgroup.com/en/manual/layout/custom-layout).
- **JointJS `DirectedGraph.layout(graph|cells, opt): g.Rect`** has the one genuine write-interception hook found in the survey: `setPosition` is _"a function that will be used to set the position of elements at the end of the layout. This is useful if you don't want to use the default `element.set('position', position)` but want to set the position in an animated fashion via transitions"_, with parallel `setVertices` / `setLabels` — [docs.jointjs.com/api/layout/DirectedGraph](https://docs.jointjs.com/api/layout/DirectedGraph/).

**ELK hierarchy and coordinate spaces**

- ELK's graph is a tree: _"They can contain child nodes, which is why the graph itself is represented by an `ElkNode`"_ — [ELK graph data structure](https://eclipse.dev/elk/documentation/tooldevelopers/graphdatastructure.html). `layout(graph, options)` _"returns a `Promise`, which passes either the laid out graph on success or a … error on failure"_; worker mode is `new ELK({ workerUrl: './node_modules/elkjs/lib/elk-worker.min.js' })` — [elkjs README](https://github.com/kieler/elkjs).
- Coordinate rule: _"The coordinates of most elements are relative to their parent element"_; edge source/bend/target points are relative to the edge's _containing_ node; overridable via `org.eclipse.elk.json.shapeCoords` / `edgeCoords` with `INHERIT | PARENT | ROOT | CONTAINER` — [ELK coordinate system](https://eclipse.dev/elk/documentation/tooldevelopers/graphdatastructure/coordinatesystem.html).
- This matches React Flow's sub-flow model — with `parentId`, _"the child node is positioned relative to its parent. A position of `{ x: 0, y: 0 }` is the top left corner of the parent"_ — [reactflow.dev/learn/layouting/sub-flows](https://reactflow.dev/learn/layouting/sub-flows). So an ELK→React Flow adapter needs **no conversion** if it keeps the hierarchy; Rete, being absolute, must flatten (hence `StandardApplier`'s offset accumulation).

### Inferences

- The answer to "is intercepting the coordinate write a real design?" is **no, and for a principled reason**: in controlled-state libraries the only sanctioned mutation channel is the app's own reducer, so a layout plugin that hooked the write would have to live inside the user's code. Libraries that _own_ their model (Cytoscape) let layouts mutate positions directly. ngx-vflow is in the controlled camp, so the layout plugin contract should be `run() → positions`, applied by the engine into the app's writable signals — exactly what ngx-vflow already does for drag.
- ngx-graph's `Graph | Observable<Graph>` return type is the single best idea found for ngx-vflow: it is idiomatic Angular, unifies one-shot and continuous layout, and naturally expresses "this layout keeps emitting". An `applier` (Rete) is orthogonal and can be layered on top for animation.
- Drag-vs-layout conflict is solved identically everywhere: **pinning**. The engine must therefore expose, to the layout, "which nodes are currently being dragged and where", and must let the layout write everything _except_ those. `onDragStart/onDrag/onDragEnd` as observe-only hooks are sufficient; no veto is needed.
- Async reconciliation is a **genuine ecosystem-wide weakness**, not something to copy: React Flow's ELK example does `setNodes(children)` on resolve with no generation check; nothing aborts a stale ELK promise. The only levers anyone has are `stop()` (Cytoscape, G6) and `TransitionApplier.cancel(id)` (Rete). ngx-vflow should add request versioning (drop results whose input revision is stale) and drop positions for nodes that were removed or reparented meanwhile.
- Layout is the clearest case for an explicit **"the engine is not the author of these positions"** mode: while a continuous layout runs, the engine's own drag-end snapping, expandParent, etc. must not fight it.

### Gaps

- The React Flow force-layout example is now Pro-gated, so the v12 source quoted above came from the deployed example bundle rather than a readable repository. It should be treated as accurate-but-minified evidence.
- No library I examined versions or aborts an async layout against concurrent structural change. There is no prior art to copy for the "graph changed while ELK was running" problem.
- I found no evidence of any library supporting _cola_ as a first-class plugin in the flow-library space (webcola integrations exist for Cytoscape as `cytoscape-cola`, but I did not verify its contract).

### Hook table — Feature 2

| hook needed                                     | phase                             | sync/async                                     | veto/transform/observe                | reads                                         | writes                                         |
| ----------------------------------------------- | --------------------------------- | ---------------------------------------------- | ------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `run(graph)` / `execute(data)`                  | after measure, on demand          | both (`Graph \| Observable<Graph>`, `Promise`) | transform (produces positions)        | nodes + edges, measured w/h, parent hierarchy | node positions (applied by the host)           |
| "sizes ready" gate (`useNodesInitialized`)      | after DOM measure, before layout  | sync boolean                                   | observe (gates the run)               | measured width/height per node                | —                                              |
| tick / `onTick`                                 | per animation frame while running | sync callback inside an async loop             | transform                             | current positions, drag pins                  | all non-pinned node positions                  |
| `onDragStart(node, e)`                          | pointer down on node              | sync                                           | observe (host still applies the drag) | node id, pointer coords                       | layout-internal pin (`fx`/`fy`), `alphaTarget` |
| `onDrag(node, e)`                               | drag move                         | sync                                           | observe                               | pointer coords                                | `fx`/`fy`                                      |
| `onDragEnd(node, e)`                            | drag end / drag disabled          | sync                                           | observe                               | node id                                       | clears `fx`/`fy`, `alphaTarget(0)`             |
| `updateEdge(graph, edge)`                       | per incident edge during drag     | both                                           | transform                             | graph + one edge                              | edge points / labels                           |
| applier `apply(nodes)`                          | after layout resolves             | async                                          | transform (_how_ positions land)      | layout result tree (parent-relative)          | positions + sizes, optionally animated         |
| `stop()` / `cancel(id)`                         | on graph change or teardown       | sync                                           | veto of in-flight work                | run state                                     | halts the layout's own writes                  |
| lifecycle events (`layoutstart`/`ready`/`stop`) | bracket the run                   | sync emit                                      | observe                               | layout instance                               | —                                              |
| structural-change notification                  | on add/remove/reparent            | sync                                           | observe                               | change list                                   | triggers re-run / invalidates in-flight result |

---

## Feature 3 — Node rotation

### Takeaway

Canvas libraries (X6, JointJS, GoJS, Fabric, Konva) all store rotation as a scalar `angle` on the node and keep **two bounding boxes** — the unrotated/natural one and the derived rotated AABB — plus an explicit per-anchor switch for "rotated frame or screen frame?". No DOM-based flow library supports rotation, and **React Flow's maintainers have explicitly declined to add it**; the community workaround (CSS `transform: rotate()` on an inner div + `updateNodeInternals()` per frame) works only approximately, because `getBoundingClientRect` returns an inflated AABB while `offsetWidth/offsetHeight` ignore transforms.

### Cited Findings

**AntV X6 — rotation as a first-class plugin**

- `new Transform({ resizing, rotating })`; the rotating surface is only two options — [packages/x6-plugin-transform/src/index.ts](https://github.com/antvis/X6/blob/v2/packages/x6-plugin-transform/src/index.ts):
  ```ts
  export interface RotatingRaw {
    enabled?: boolean;
    grid?: number;
  }
  export type Options = { rotating?: boolean | Partial<Rotating>; resizing?: boolean | Partial<Resizing> };
  ```
  `grid` defaults to 15 (`rotateGrid: rotating.grid || 15`). Every option may be a function `(node) => value` (`OptionItem<Node, T>`), but it is resolved **once per node by `parseOptionGroup` at widget-creation time — per-node config is pull-based, not reactive**. Docs: [x6 Transform plugin](https://x6.antv.antgroup.com/en/docs/api/plugins/transform), [tutorial source](https://github.com/antvis/X6/blob/master/site/docs/tutorial/plugins/transform.en.md).
- Lifecycle ([transform.ts](https://github.com/antvis/X6/blob/v2/packages/x6-plugin-transform/src/transform.ts)): widget created on `node:click`, cleared on `blank:mousedown`; `mousedown` on the `-rotate` knob calls `startRotating`, opening a model batch `'rotate'` and stashing `angle: Angle.normalize(node.getAngle())`; move computes `target = data.angle + theta`, applies `GeometryUtil.snapToGrid(target, options.rotateGrid)`, normalizes, `node.rotate(target, { absolute: true })`. Events: `node:rotate` (start) → `node:rotating` (each move) → `node:rotated` (end).
- Storage ([model/node.ts](https://github.com/antvis/X6/blob/v2/packages/x6/src/model/node.ts)): `angle` is a plain store attribute defaulting to `0`; `rotate(angle, { absolute?, center? })` with a `center` converts rotation about an arbitrary pivot into **a position translation plus an absolute angle**, wrapped in a batch.
- **Two bounding boxes.** `node.getBBox()` returns `Rectangle.fromPositionAndSize(getPosition(), getSize())` — the _unrotated_ rect. The rotated AABB comes from [`Rectangle.bbox(angle)`](https://github.com/antvis/X6/blob/v2/packages/x6-geometry/src/rectangle.ts): `w' = w·|cos| + h·|sin|`, `h' = w·|sin| + h·|cos|`, re-centred. `Cell.getCellsBBox` applies it per node (`if (angle) rect = rect.bbox(angle)`) and `CellView.getBBox({useCellGeometry:true})` does `cell.getBBox().bbox(angle)` — [view/cell.ts](https://github.com/antvis/X6/blob/v2/packages/x6/src/view/cell.ts).
- **Ports** are computed in the node's own frame then mapped: `Node.getConnectionPoint(edge, type)` takes the port layout position, translates by the bbox origin, then `if (angle) portCenter.rotate(-angle, center)`.
- **Anchors are opt-in.** [registry/node-anchor/bbox.ts](https://github.com/antvis/X6/blob/v2/packages/x6/src/registry/node-anchor/bbox.ts) documents `rotate?: boolean` as _"Should the anchor bbox rotate with the terminal view. Default is `false`, meaning that the unrotated bbox is used."_ So default `top`/`left` anchors sit on the **screen-axis-aligned** box of the rotated element.
- **Resizer-in-rotated-space is solved explicitly**: the widget container gets CSS `transform: rotate(${angle}deg)`, `updateResizerDirections()` rotates cursor classes by `shift = Math.floor(angle * 8/360)`, `getTrueDirection(dir)` remaps the dragged handle's logical direction by the same index shift, and drag deltas are un-rotated via `.rotate(data.angle, currentBBox.getCenter())`.
- **Nested children**: `rotate()` writes only the node's own `angle`; descendants are untouched in the model. `getBBox({deep:true})` unions each descendant's _own_ rotated AABB.

**JointJS**

- `element.rotate(deg, [absolute, origin, opt])` rotates around the centre unless `origin` is given; `angle()` returns 0–360 and mutation fires `change:angle`; `getBBox()` accepts a `rotate` option to _"Return the bounding box after the element's rotation"_ — [docs.jointjs.com/api/dia/Element/#rotate](https://docs.jointjs.com/api/dia/Element/#rotate).
- Anchors mirror X6: `rotate` is documented as _"Should the anchor bbox rotate with the end view? Default is `false`, meaning that the unrotated bbox is used"_, and the docs warn that _"measuring the rendered view is slower"_, recommending `useModelGeometry: true` — [docs.jointjs.com/api/anchors](https://docs.jointjs.com/api/anchors/).
- UI: [`ui.FreeTransform`](https://docs.jointjs.com/api/ui/FreeTransform/) with `allowRotation` (default `true`), `rotateAngleGrid` (default 15), `allowOrthogonalResize`, `preserveAspectRatio`, `min/maxWidth/Height`, `resizeGrid`, `padding` (3), `clearAll`, `clearOnBlankPointerdown`; emits `rotate:start` / `rotate` / `rotate:stop`.

**GoJS — the cleanest bounds model**

- `Part.rotatable = true` activates the `RotatingTool`, which _"adds an Adornment containing one rotate handle a short distance from the object at the object's angle"_; `Part.rotateObjectName` redirects rotation to a named inner `GraphObject`, and `RotatingTool.handleAngle` moves the handle — [gojs.net/latest/intro/tools.html](https://gojs.net/latest/intro/tools.html). Persistence requires a TwoWay `Binding` on `angle`.
- `naturalBounds` is _"the natural bounding rectangle … before any transformation by scale or angle"_, while _"the actualBounds width and height of a GraphObject are the final size after the scale and angle are applied"_ — [GraphObject API](https://gojs.net/latest/api/symbols/GraphObject.html#actualBounds). Because `angle` is a GraphObject transform, the whole visual subtree rotates with the part, and link routing (by default _"the furthest point on the route … that is an intersection of an edge of the port"_, adjustable via `fromSpot`/`toSpot` — [intro/connectionPoints](https://gojs.net/latest/intro/connectionPoints.html)) operates on already-transformed document bounds.

**Fabric.js / Konva**

- Fabric stores `angle: TDegree` and composes its matrix from `{ angle, translateX/Y = centre, scaleX/Y, skewX/Y, flipX/Y }`. `calcACoords()` builds the four **oriented** corners via `createRotateMatrix({ angle })`; `getBoundingRect()` is `makeBoundingBoxFromPoints(this.getCoords())`, documented as _"the box is intended as aligned to axis of canvas"_ — [ObjectGeometry.ts](https://github.com/fabricjs/fabric.js/blob/master/packages/core/src/shapes/Object/ObjectGeometry.ts). Fabric therefore keeps **both an OBB** (for `containsPoint`, `isContainedWithinObject`) **and a derived AABB**.
- Konva's [Transformer](https://konvajs.org/api/Konva.Transformer.html) exposes `rotateEnabled`, `rotationSnaps` (e.g. `[0,90,180,270]`), `rotationSnapTolerance` (5), `rotateAnchorOffset` (50), `boundBoxFunc`, `anchorDragBoundFunc`, `keepRatio`, `centeredScaling`; it _"is not changing `width` and `height` properties of nodes when you resize them. Instead it changes `scaleX` and `scaleY`"_ — [Basic demo](https://konvajs.org/docs/select_and_transform/Basic_demo.html). AABB via `node.getClientRect({ skipTransform, skipShadow, skipStroke, relativeTo })`.

**React Flow / xyflow — the critical finding**

- **There is no built-in rotation and the maintainers have declined to add it.** On [issue #3987](https://github.com/xyflow/xyflow/issues/3987): _"Since rotation is not built-in, it breaks a lot of things"_, and on both #3987 and [#2777](https://github.com/xyflow/xyflow/issues/2777): _"We will not add rotation as a built-in feature for React Flow. If you need resizing and rotation, you would need to implement resizing in the custom node on your own since the built-in NodeResizer doesn't work with rotated nodes."_ Svelte Flow and Vue Flow inherit this, since measurement lives in the shared `@xyflow/system` package.
- The sanctioned workaround is the [Rotatable Node example](https://reactflow.dev/examples/nodes/rotatable-node), entirely in userland: a `d3-drag` handler on a `nodrag` div computes `deg = Math.atan2(dx, dy) * (180/Math.PI)`, calls `setRotation(180 - deg)` and then `updateNodeInternals(id)`; the node renders `<div style={{ transform: \`rotate(${rotation}deg)\` }} className="react-flow__node rotatable-node">`with`<Handle>`s inside. **Rotation lives in component-local `useState`, not node data.**
- Why a CSS rotate is picked up at all — [packages/system/src/utils/dom.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/dom.ts) measures handles as
  ```ts
  const handleBounds = handle.getBoundingClientRect();
  return { …, x: (handleBounds.left - nodeBounds.left) / zoom,
               y: (handleBounds.top  - nodeBounds.top)  / zoom,
           ...getDimensions(handle) };   // offsetWidth / offsetHeight
  ```
  `getBoundingClientRect()` returns the **AABB of the transformed element**, so the handle rect follows the rotation and `x/y` land near the right place. But `width/height` come from `offsetWidth/offsetHeight`, which **ignore CSS transforms**, while `x/y` come from the inflated AABB (`w|cosθ| + h|sinθ|`): a consumer computing a handle centre as `x + width/2` drifts by `(rectW − offsetW)/2`, up to ≈0.21·w at 45°. The same file divides only by the viewport `zoom`, which is the root cause of [issue #6023](https://github.com/xyflow/xyflow/issues/6023) ("Handle offsets are inflated by ancestor CSS transform/zoom").
- The example deliberately rotates an **inner** div, leaving `.react-flow__node` axis-aligned so `nodeBounds` (the subtraction base) stays unrotated, and calls `updateNodeInternals` on **every drag tick** — a full DOM re-measure per frame. `updateNodeInternals` is documented as required _"when you programmatically add or remove handles to a node or update a node's handle position"_ — [useUpdateNodeInternals](https://reactflow.dev/api-reference/hooks/use-update-node-internals).

### Inferences

- Rotation is the one feature in this whole survey that **cannot be a pure plugin on top of an unaware engine**. It changes the meaning of "the node's box" for selection, minimap, fitView, hit-testing, resize and edge anchoring. If ngx-vflow wants rotation to ever be pluggable, the engine must be rotation-aware from the start in exactly one respect: **every consumer of a node's box must go through a bbox provider, never through `position + size` directly.** That single indirection is cheap now and impossible to retrofit later.
- The `naturalBounds` / `actualBounds` split (GoJS) plus the per-anchor `rotate: boolean` switch (X6, JointJS — same default, `false`) is the minimum vocabulary. Note both libraries default to the _unrotated_ box, which is usually the wrong _visual_ answer for `top`/`left` anchors — so the switch must be exposed, not hardcoded.
- For a DOM engine, relying on `getBoundingClientRect` for handle measurement gives roughly-correct handle centres for free but inflated sizes. ngx-vflow should either store the angle in the model and compute handle positions analytically (X6's `portCenter.rotate(-angle, center)`), or accept per-frame re-measure cost and fix the width/height source.
- **The nesting mismatch is the biggest trap**: a DOM library gets GoJS semantics _visually_ (a CSS transform inherits to children) while the store keeps X6 semantics (children's stored `position` is unchanged). Every world-coordinate query for a descendant must then compose the ancestor chain's rotations. With ngx-vflow's "any node can be a parent" model this applies everywhere, not just to designated groups.
- Hit-testing must use the OBB, not the AABB, or lasso selection and pointer tests over-report on rotated nodes.

### Gaps

- No DOM/headless flow library implements rotation, so there is **no prior art at all** for "rotation + measured DOM handles + nested parents". The design would be new work.
- I did not find a statement of how X6 or JointJS handle a rotated _parent_ with children in terms of edge routing between a child and an outside node; both keep children un-rotated in the model, which suggests the case is simply not supported.

### Hook table — Feature 3

| hook needed                             | phase                                      | sync/async                 | veto/transform/observe                                | reads                                           | writes                                   |
| --------------------------------------- | ------------------------------------------ | -------------------------- | ----------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| `rotateStart`                           | pointer down on rotate knob                | sync                       | veto (cancel gesture)                                 | node id, current `angle`, rotation centre       | ephemeral drag session only              |
| `rotateSnap`                            | drag move (rAF-throttled)                  | sync                       | transform (snap to grid, clamp)                       | pointer position, start angle, grid step        | proposed angle (ephemeral)               |
| `rotateCommit`                          | drag end                                   | sync                       | veto (revert) + transform                             | proposed angle                                  | `node.angle` in app state — one write    |
| `measureHandles`                        | after render / after angle change          | sync, post-layout DOM read | observe                                               | handle rects, node rect, zoom, angle            | node internals: handle x/y in node frame |
| `bboxProvider` (natural vs actual)      | on data change (`angle`/`size`/`position`) | sync, memoized             | transform                                             | position, size, angle                           | AABB for selection / minimap / fitView   |
| anchor frame switch (`rotate: boolean`) | edge anchor computation                    | sync                       | transform                                             | node box, angle, anchor spec                    | edge endpoint                            |
| `resizeFrameMap`                        | drag move on a resize handle               | sync                       | transform (un-rotate delta, remap direction + cursor) | angle, handle direction, pointer delta          | proposed size + position                 |
| `hitTest`                               | pointer move / query time                  | sync                       | observe                                               | OBB corner points (not AABB)                    | —                                        |
| `childWorldTransform`                   | on data change                             | sync                       | transform                                             | ancestor angles + centres, child local position | child world coords for edges / hit-test  |

---

## Feature 4 — Proximity connect

### Takeaway

React Flow's reference implementation does an `O(n)` scan of all nodes on every drag frame and **pushes the hint edge into the application's own `edges` array**, marking it ephemeral with a CSS class — the worst possible fit for an app-owned-state design. Rete and diagram-js show the alternative: a preview rendered in a **view-only layer that never touches the data model**, with the commit happening in exactly one write at drag end. diagram-js additionally shows the right veto shape: three-valued, and able to _transform_ the connection it authorises.

### Cited Findings

**React Flow — the reference implementation** ([reactflow.dev/examples/nodes/proximity-connect](https://reactflow.dev/examples/nodes/proximity-connect))

- Description: _"automatically create edges when a node is dropped in close proximity to another one. While dragging, a dotted connection line is displayed to show which edge will be created if you drop the node."_
- `getClosestEdge` reads `nodeLookup` from `useStoreApi()` and reduces over **all** nodes comparing `internals.positionAbsolute` deltas against `MIN_DISTANCE = 150`:
  ```js
  const closestNode = Array.from(nodeLookup.values()).reduce(
    (res, n) => {
      if (n.id !== internalNode.id) {
        const dx = n.internals.positionAbsolute.x - internalNode.internals.positionAbsolute.x;
        const dy = n.internals.positionAbsolute.y - internalNode.internals.positionAbsolute.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < res.distance && d < MIN_DISTANCE) {
          res.distance = d;
          res.node = n;
        }
      }
      return res;
    },
    { distance: Number.MAX_VALUE, node: null },
  );
  ```
  Direction is decided by `closeNodeIsSource = closestNode.node.internals.positionAbsolute.x < internalNode.internals.positionAbsolute.x`.
- `onNodeDrag` rewrites the edge array every frame: `setEdges(es => { const nextEdges = es.filter(e => e.className !== 'temp'); if (closeEdge && !nextEdges.find(ne => ne.source === closeEdge.source && ne.target === closeEdge.target)) { closeEdge.className = 'temp'; nextEdges.push(closeEdge); } return nextEdges; })`. **`onNodeDragStop` is byte-for-byte the same minus the `className = 'temp'` assignment** — that is the entire commit. The dotted look is one CSS rule: `.temp .react-flow__edge-path { stroke: #bbb; stroke-dasharray: 5 5; }`.
- So: **the temporary edge is put into React Flow's own `edges` state; there is no overlay layer.** Consequences — the host's edge array is mutated every drag frame; any `onEdgesChange` consumer, persistence layer, undo stack or derived selector observes the ephemeral edge; "ephemeral" is a _string convention_ rather than a type; and the temp edge is a real edge (measured, rendered, selectable, routable).
- Performance/semantics caveats: `O(n)` per frame with a fresh `Array.from(nodeLookup.values())` allocation, and it compares **top-left `positionAbsolute`**, not centres or box distance — so large and small nodes are judged by the same corner.
- React Flow's other ephemeral-edge example confirms the pattern: [Temporary Edges](https://reactflow.dev/examples/edges/temporary-edges) creates a real "ghost node" (`type: 'ghost'`) plus a real edge marked `reconnectable: 'target'` in state, cleaned up via `onReconnectEnd` / `onEdgesDelete`.

**AntV X6 `connecting.snap`**

- [graph/options.ts](https://github.com/antvis/X6/blob/v2/packages/x6/src/graph/options.ts): `snap: boolean | { radius: number; anchor?: 'center' | 'bbox' }`, documented _"Snap edge to the closest node/port in the given radius on dragging"_ — [interaction docs](https://x6.antv.antgroup.com/en/docs/api/graph/interaction#connecting).
- `EdgeView.snapArrowhead` defaults to `radius = 50`, `anchor = 'center'`; it calls `graph.renderer.findViewsInArea({ x-r, y-r, 2r, 2r }, { nodeOnly: true })` — i.e. **an area query, not a full scan** — measures `view.cell.getBBox().getCenter().distance(pos)` (or `getNearestPointToPoint(pos).distance(pos)` for `'bbox'`), and calls `this.validateConnection(...)` **before** accepting a candidate. The winner is highlighted with `closestView.highlight(closestMagnet, { type: 'magnetAdsorbed' })`; `snapArrowheadEnd` unhighlights on drop.
- Veto hooks: `validateMagnet` (_"Check whether to add a new edge to the graph when user clicks on an a magnet"_), `validateConnection` (_"Check whether to allow or disallow the edge connection while an arrowhead end (source/target) being changed"_), `validateEdge` on drop (_"If the function returns `false`, the edge is either removed … or reverted to the state before the interaction"_). Coarse predicates `allowBlank / allowLoop / allowNode / allowEdge / allowPort / allowMulti`, each `boolean | (args) => boolean`. `highlight: boolean` pre-highlights **all** valid magnets on drag start (`highlightAvailableMagnets`, markers `magnetAvailable` / `nodeAvailable`).
- Note: this fires while dragging a **link end**, not while dragging a node.

**JointJS**

- `snapLinks` — _"when enabled, force a dragged link to snap to the closest valid magnet within the snap radius"_ — `true` or `{ radius }` (default 50) plus `findInAreaOptions`; `snapLinksSelf` (`{ radius }`, default 20). `magnetThreshold` is _"the required mousemove events before a new link is created from a magnet"_, or the keyword `'onleave'`. Veto: `validateMagnet(cellView, magnet, evt)`, `validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView)`. `highlighting` keys: `default`, `connecting`, `embedding`, `magnetAvailability`, `elementAvailability`. Source: [docs.jointjs.com/api/dia/Paper](https://docs.jointjs.com/api/dia/Paper/).
- `connectionStrategy` can rewrite the terminal on drop — [connectionStrategies](https://docs.jointjs.com/api/connectionStrategies/).
- **`snapLinks` is about dragging a LINK end, not a node.** JointJS has no node-proximity auto-connect, and its ephemeral link during a drag is a real `dia.Link` model on the graph.

**Rete.js — pseudo-connections in the view layer only**

- [rete-connection-plugin](https://github.com/retejs/connection-plugin) uses **exact DOM hit-testing, not a radius**: sockets register into a `socketsCache` keyed by DOM element when a `render` signal of type `'socket'` passes through the pipe; on `pointerup`/`pointerdown`, `pick()` runs `elementsFromPoint(event.clientX, event.clientY)` (a shadow-DOM-traversing wrapper) and `findSocket(socketsCache, pointedElements)`. `pointermove` only calls `update()`. Events: `connectionpick`, `connectiondrop`. Validation lives in the preset flow (`Presets.classic`) rather than explicit veto callbacks — [guide](https://retejs.org/docs/guides/basic#connection-plugin).
- [`createPseudoconnection`](https://github.com/retejs/connection-plugin/blob/main/src/pseudoconnection.ts) allocates `id = \`pseudo_${getUID()}\``, calls `areaPlugin.addConnectionView(payload)`with`isPseudo: true` and a half-empty terminal (`target: '', targetInput: ''`), then emits a `render`signal each move with`end`/`start`set to the live pointer;`unmount()`calls`areaPlugin.removeConnectionView(id)`. **The pseudo-connection exists only in the area plugin's view layer, never in the `NodeEditor` data model.**

**diagram-js — the explicit preview layer, and a three-valued veto**

- [Connect.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/connect/Connect.js) starts with `dragging.init(event, 'connect', { autoActivate, data: { shape: start, context: { start, connectionStart } } })`. `connect.hover` sets `context.canExecute = rules.allowed('connection.create', { source, target })` and, if that fails, retries reversed (`canConnectReverse`). **The result is three-valued**: `isNil(canExecute)` means "ignore this hover", distinct from `false`. `connect.out` / `connect.cleanup` null out `hover/source/target`.
- `connect.end` is **the only writer**: `context.connection = modeling.connect(source, target, attrs, hints)`, returning `false` to veto; **when `canExecute` is an object it is passed through as `attrs`, so the rule can _transform_ the connection it authorises**.
- [ConnectPreview.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/connect/ConnectPreview.js): on `connect.move` → `connectionPreview.drawPreview(context, canConnect, { source, target, connectionStart, connectionEnd })`; on `connect.hover` at `LOW_PRIORITY = 900` → `canvas.addMarker(hover, canExecute ? 'connect-ok' : 'connect-not-ok')`; on `connect.out`/`connect.cleanup` at `HIGH_PRIORITY = 1100` → remove markers and `connectionPreview.cleanUp(event.context)`.
- [ConnectionPreview.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/connection-preview/ConnectionPreview.js) is the layer: `MARKER_CONNECTION_PREVIEW = 'djs-dragger'`; `createConnectionPreviewGfx()` is `svgCreate('g')` with `pointerEvents: 'none'`, class `djs-dragger`, appended to `canvas.getActiveLayer()`. `drawPreview` clears that `<g>`, builds a **throwaway model** via `elementFactory.createConnection(attrs)` (never added to the canvas), then runs the _real_ `layouter.layoutConnection(...)` and `connectionDocking.getCroppedWaypoints(...)`, and `graphicsFactory.drawConnection(gfx, connection, { stroke: 'var(--element-dragger-color)' })`. No valid connection → `drawNoopPreview`, a cropped straight line. `cleanUp` is `svgRemove(context.connectionPreviewGfx)`.
- **Key design property: the preview reuses the same layouter, docking and graphics factory as committed connections**, so what you see while dragging is pixel-identical to what you get — with zero model writes until `connect.end`.

### Inferences

- For ngx-vflow, React Flow's "put the temp edge in app state" is a non-starter: the library's contract is that structural changes are _described_ to the app, not applied. A temp edge in app state would be a structural change applied by the library, once per frame. The engine therefore **must** provide an ephemeral edge/preview layer.
- The best available model is diagram-js's: one `pointer-events: none` SVG group on the active layer, drawn by _the same_ path/marker/label pipeline as committed edges, cleaned up by id. Rete's `addConnectionView`/`removeConnectionView` is the same idea with a nicer API.
- The candidate scan needs a **spatial query, not a full scan**. X6 already does `findViewsInArea`; xyflow maintains an [rbush fork](https://github.com/xyflow/rbush) precisely for this class of problem. One engine-owned R-tree of node rects serves proximity connect, collision resolution, lasso selection, alignment guides and obstacle routing.
- The veto should be three-valued (allow / deny / ignore) as in diagram-js's rules, so that multiple plugins can compose with priority fallthrough — a two-valued boolean forces the first plugin to answer for everyone.
- Allowing the veto to return an _object_ that becomes the edge's attributes (diagram-js) collapses "validate" and "decide what the edge looks like" into one hook, which is a genuinely good simplification worth copying.
- The commit at drag end is a **structural operation** (`connect`), which is exactly what ngx-vflow already emits rather than applies — so this half of the feature already fits the architecture.

### Gaps

- No library ships _node_-proximity auto-connect as a built-in; React Flow's is an example, X6/JointJS snapping is for link ends. So there is no production-hardened prior art for the exact feature, only for its parts.
- I found no library that exposes its preview/overlay layer as a **documented public API for third-party plugins** — diagram-js's `ConnectionPreview` and Rete's `addConnectionView` are internal-ish services used by first-party features. diagram-js's `overlays` service is the closest documented equivalent, but it is HTML-anchored-to-an-element, not free-form SVG.

### Hook table — Feature 4

| hook needed                            | phase                         | sync/async                       | veto/transform/observe                                           | reads                                                    | writes                                                            |
| -------------------------------------- | ----------------------------- | -------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `candidateScan` (spatial query)        | node drag move, rAF-throttled | sync                             | observe → emits candidate                                        | node index (absolute rects + size), dragged node, radius | candidate `{source,target}` (ephemeral)                           |
| `validateCandidate`                    | drag move, before preview     | sync                             | **veto**, three-valued (allow / deny / ignore), may return attrs | source & target node data, existing edges, dedupe key    | —                                                                 |
| `previewRender` (ephemeral edge layer) | drag move                     | sync                             | transform (waypoints, styling, markers)                          | candidate + live pointer + routing/anchor config         | ephemeral overlay only, never app state                           |
| `highlightTarget`                      | candidate enter / leave       | sync                             | observe                                                          | candidate node id, validity                              | ephemeral marker class on the target node                         |
| `commit`                               | drag end                      | sync (decision), structural emit | veto + transform                                                 | final candidate, validity                                | **structural op** `connect(source, target, attrs)` — one emission |
| `cleanup`                              | drag end / cancel / destroy   | sync                             | observe                                                          | drag session state                                       | removes overlay `<g>` and all markers                             |

---

## Feature 5 — Obstacle-avoiding / smart edge routing (libavoid-js and alternatives)

### Takeaway

Two incompatible router shapes exist, and an engine needs **both channels**. A _pull-based, per-edge, synchronous_ path-strategy registry (JointJS/X6's `router` + `connector` + `anchor` + `connectionPoint`) hosts manhattan/metro-style routers cleanly. It **cannot** host libavoid, ELK or a worker, because those are _push-based, global and transactional_ — for those the engine needs an imperative "set this edge's path" channel carrying an **origin tag**, which every integration examined independently invented to stop infinite change loops.

### Cited Findings

**libavoid-js — the real API surface**

- **The README does not document the API** — [README.md](https://github.com/Aksem/libavoid-js/blob/master/README.md) covers only build instructions, the release (`dist/`) vs debug (`examples/lib`) split, and one FAQ entry about an invalid `libavoid.wasm`. The contract lives in [typings/libavoid.d.ts](https://github.com/Aksem/libavoid-js/blob/master/typings/libavoid.d.ts) and [examples/main.js](https://github.com/Aksem/libavoid-js/blob/master/examples/main.js). Package `libavoid-js@0.4.5`, LGPL-2.1-or-later ([package.json](https://github.com/Aksem/libavoid-js/blob/master/package.json)).
- Loading: `AvoidLib.load(filePath?) => Promise<void>`, then `AvoidLib.getInstance() => Avoid`. [src/common.js](https://github.com/Aksem/libavoid-js/blob/master/src/common.js) wires `filePath` into emscripten's `locateFile` for any path ending in `.wasm`; `getInstance()` throws _"Avoid library should be initialized before using"_ if called early.
- **Async only at load.** Everything after `load()` is synchronous; `processTransaction()` returns after routing and callbacks fire synchronously inside it.
- **Routing is incremental.** `router.moveShape(shapeRef, dx, dy)` (or `moveShape(shape, newPolygon)`) then `processTransaction()` reroutes only what changed. The example's own comment is the evidence: _"It's expected you know the connector needs rerouting, so the callback isn't called."_ — callbacks fire only for connectors libavoid decided need a new route, i.e. **one transaction emits callbacks for the affected subset, not all connectors**. You must keep your own map connector → edge, because the callback gives a raw pointer, not your id.
- **Correction to a common premise:** `displayRoute()` returns a `PolyLine` with **methods**, not fields — `route.size()` and `route.get_ps(i)` → `Point{x,y}`. There is no `route.ps` / `route.size` property access.
- Other API facts from the typings: `new Avoid.Router(Avoid.OrthogonalRouting | Avoid.PolyLineRouting)`; `new Avoid.ShapeRef(router, polygon)`; `new Avoid.Rectangle(topLeft, bottomRight)` or `(centre, width, height)`; `new Avoid.ConnRef(router)` or `(router, srcConnEnd, dstConnEnd)`; `new Avoid.ConnEnd(point)` or `(shapeRef, classId)`; `connRef.setSourceEndpoint/setDestEndpoint`; `router.deleteShape` / `router.deleteConnector`; `setRoutingParameter(number, number)`; `setRoutingOption(number, boolean)`. `setCallback(cb, connRef)` hands a **raw pointer**, rewrapped with `Avoid.wrapPointer(ptr, Avoid.ConnRef)`; `Avoid.getPointer(obj)` is the inverse; `Avoid.destroy(obj)` exists for emscripten memory. Ports: `new Avoid.ShapeConnectionPin(shapeRef, classId, xOffset, yOffset, proportional, insideOffset, visDirs)` + `setExclusive(false)`; direction flags `Avoid.ConnDirUp/Right/Down/Left/All`.

**The JointJS avoid-router integration — the most instructive integration**

- Source: [examples/libavoid/src/shared/avoid-router.js](https://github.com/clientIO/joint/blob/master/examples/libavoid/src/shared/avoid-router.js) (plus a TS variant at [examples/avoid-router-ts](https://github.com/clientIO/joint/tree/master/examples/avoid-router-ts)), shared by [ui-thread/app.js](https://github.com/clientIO/joint/blob/master/examples/libavoid/src/ui-thread/app.js) and [web-worker/app.js](https://github.com/clientIO/joint/blob/master/examples/libavoid/src/web-worker/app.js) + [worker.js](https://github.com/clientIO/joint/blob/master/examples/libavoid/src/web-worker/worker.js).
- **The single most important finding: it does _not_ use JointJS's router hook.** Despite JointJS having the cleanest router plugin model in the ecosystem, the libavoid integration bypasses it. `routeLink()` writes the route into the **model** as `vertices` (interior points only — `for (i = 1; i < route.size() - 1)`), sets `router: null`, and sets both ends' `anchor: { name: 'modelCenter', args: { dx, dy } }` with deltas derived by comparing libavoid's endpoint against the element/port anchor. The normal connector then draws it (the paper sets `defaultConnector: { name: 'straight', args: { cornerType: 'cubic', cornerRadius: 4 } }`). The reason is structural: **libavoid is transactional and global, while a JointJS router is per-edge, pull-based and synchronous** — a pull hook cannot host a push router.
- **Re-entrancy tagging is mandatory.** Every write is `link.set(attrs, { avoidRouter: true })`, and `onCellChanged(cell, opt)` begins with `if (opt.avoidRouter) return;`. The worker variant uses a second tag, `{ fromWorker: true }`. Without these you get an infinite change loop.
- Bookkeeping maps: `shapeRefs[element.id]`, `edgeRefs[link.id]`, `pinIds['elementId:portId'] → number`, and `linksByPointer[connRef.g] → link`. The last carries a warning worth quoting: libavoid-js _"seems not to work properly if you add-remove-add a connRef with a same `id`"_, so they key off the emscripten pointer field `connRef.g` rather than `connRef.id()`.
- Events: an `mvc.Listener` on the graph for `remove`/`add`/`change`/`reset`; `onCellChanged` branches on `'source' in cell.changed || 'target' in cell.changed` and `'position' in cell.changed || 'size' in cell.changed`. `updateShape` reuses an existing `ShapeRef` via `moveShape(shapeRef, shapeRect)` rather than recreating it.
- **Batching**: the UI-thread app sets `commitTransactions: true` and calls `processTransaction()` on every change (synchronous routing during drag); the worker sets `commitTransactions: false` and wraps it in `util.debounce(fn, 100)` followed by `setTimeout(..., 0)` that checks `debouncedProcessTransaction.pending()` before posting results. **No `requestAnimationFrame` anywhere.**
- **Optimistic path + reconcile**: while a worker route is pending, the main thread sets each connected link to `link.router('rightAngle')` and adds an `awaiting-update` highlighter class; when `{command:'routed', cells}` arrives it applies only `vertices`, `source`, `target`, `router: null`. A node moved meanwhile is simply corrected by the next batch.
- **Fallback**: libavoid gives no validity signal, so `isRouteValid()` is a heuristic (routes with >2 points are trusted; 2-point routes are checked for straightness and for endpoints landing inside the opposite element's inflated bbox). Invalid → `router: { name: 'rightAngle', args: { margin } }` with empty vertices.

**JointJS's four extension points (from source)**

- The pipeline is in [LinkView.mjs](https://github.com/clientIO/joint/blob/master/packages/joint-core/src/dia/LinkView.mjs): `updateRoute()` runs findAnchors → findRoute → findConnectionPoints, then `updatePath()` runs findPath.

| Point               | Signature (`this` = linkView)                                          | Namespace / default                                                         |
| ------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **router**          | `(vertices, opt, linkView) => Point[]`                                 | `routerNamespace`, `defaultRouter: {name:'normal'}`                         |
| **connector**       | `(sourcePoint, targetPoint, route, opt, linkView) => g.Path \| string` | `connectorNamespace`, `defaultConnector: {name:'normal'}`                   |
| **anchor**          | `(cellView, magnet, ref, args, endType, linkView) => g.Point`          | `anchorNamespace` / `linkAnchorNamespace`, `defaultAnchor: {name:'center'}` |
| **connectionPoint** | `(line, view, magnet, args, endType, linkView) => g.Point`             | `connectionPointNamespace`, `defaultConnectionPoint: {name:'boundary'}`     |

`findRoute` resolves `model.router()` else `paper.options.defaultRouter`; the value may be **a function directly** or `{name, args}` looked up in the namespace; a falsy return falls back to the raw vertices. `findPath` forces `args.raw = true` to get a `g.Path`. Docs: [routers](https://docs.jointjs.com/api/routers/), [connectors](https://docs.jointjs.com/api/connectors/), [anchors](https://docs.jointjs.com/api/anchors/), [connectionPoints](https://docs.jointjs.com/api/connectionPoints/).

- **Manhattan defaults** ([manhattan.mjs](https://github.com/clientIO/joint/blob/master/packages/joint-core/src/routers/manhattan.mjs)): `step: 10`, `maximumLoops: 2000`, `precision: 1`, `maxAllowedDirectionChange: 90`, `perpendicular: true`, `excludeEnds: []`, `excludeTypes: []`, `startDirections`/`endDirections` all four sides, `paddingBox = {x:-step, y:-step, width:2*step, height:2*step}`, `isPointObstacle: null` (when set, _"the `padding`, `excludeEnds` and `excludeTypes` options are ignored"_), `fallbackRouter: orthogonal`. [metro.mjs](https://github.com/clientIO/joint/blob/master/packages/joint-core/src/routers/metro.mjs) is a thin wrapper: `maxAllowedDirectionChange: 45`, 8 directions with a `diagonalCost`, own `fallbackRoute`, then delegates to `manhattan`.
- **Obstacles** come from `ObstacleMap.build(graph, link)`: iterate `graph.getElements()`, skip `excludeTypes`, skip `excludeEnds`, and skip **`excludedAncestors`** built from `source.getAncestors()` and `target.getAncestors()`. Each survivor's bbox is `element.getBBox().moveAndExpand(opt.paddingBox)`, inserted into a spatial hash with `mapGridSize = 100` keyed `"x@y"`. All **model coordinates** — zoom/pan never enters the router.

**AntV X6**

- [src/registry/router/index.ts](https://github.com/antvis/X6/blob/master/src/registry/router/index.ts):
  ```ts
  export type RouterDefinition<T> = (this: EdgeView, vertices: PointLike[], options: T, edgeView: EdgeView) => PointLike[];
  ```
  [src/registry/connector/index.ts](https://github.com/antvis/X6/blob/master/src/registry/connector/index.ts):
  ```ts
  export type ConnectorDefinition<T> = (this: EdgeView, sourcePoint, targetPoint, routePoints: PointLike[], options: T, edgeView: EdgeView) => Path | string;
  ```
  Both are `Registry.create(...)`, exposed on [graph.ts](https://github.com/antvis/X6/blob/master/src/graph/graph.ts) as `static registerRouter`, `registerConnector`, `registerAnchor`, `registerEdgeAnchor`, `registerConnectionPoint` (plus `unregister*`). Built-ins: `normal`, `oneside`, `orth`, `metro`, `manhattan`, `er`, `loop`.
- Manhattan options ([manhattan/options.ts](https://github.com/antvis/X6/blob/master/src/registry/router/manhattan/options.ts)) are JointJS's, **renamed**: `maxLoopCount`, `maxDirectionChange`, `excludeTerminals`, `excludeShapes`, plus a new `excludeNodes: (Node|string)[]`, `padding` (normalized into `paddingBox`), `snapToGrid: true`, `fallbackRouter: orth`. Every option may be a value **or a thunk** (`Callable<T>`) resolved by `resolveOptions`. X6 adds one hook JointJS lacks: `draggingRouter?: (dragFrom, dragTo, options) => Point[]` — an explicit "route while dragging an endpoint" strategy.

**react-flow-smart-edge — the premise has moved on two major versions**

- [@tisoap/react-flow-smart-edge](https://github.com/tisoap/react-flow-smart-edge) is now **v5.0.0 with zero runtime dependencies** (peers `@xyflow/react >=12`, `react >=18`). The `pathfinding@0.4.18` npm package was a dependency in **v1.0.1–v3.0.0 only**; v4 vendored `src/pathfinding/aStar.ts` + `jumpPoint.ts`, and v5 replaced those with typed-array `flatAStar` / `flatJumpPoint` / `flatGrid` / `binaryHeap`.
- **It is no longer "just a custom edge component calling `useNodes()`."** v5 requires a `SmartEdgeProvider` taking `nodes` as a _controlled prop_; edges register geometry through `useSmartEdgePath`, and a scheduler batches all registered edges and dispatches them to a **Web Worker by default**. The README is explicit that _"v5 makes `SmartEdgeProvider` required"_ and nodes must be lifted out of `defaultNodes`.
- The evidence for the original thesis nonetheless holds, and is stronger: **React Flow exposes no routing hook at all**, so even this engine plugs in purely through the standard `edgeTypes` map. The provider exists precisely _because_ the per-edge component boundary is too narrow to host a global router — the same lesson as JointJS+libavoid, reached from the other direction.
- Coordinate space and nesting: [getBoundingBoxes.ts](https://github.com/tisoap/react-flow-smart-edge/blob/main/src/functions/getBoundingBoxes.ts) uses `node.position` and `node.measured?.width/height` — flow coordinates, never screen — applies `nodePadding`, snaps corners outward with `roundDown`/`roundUp`, and accepts `avoidAreas: Rect[]` as extra obstacles (documented use: _"keeping edges clear of edge labels"_). [subflow.ts](https://github.com/tisoap/react-flow-smart-edge/blob/main/src/functions/subflow.ts) states the nested-node problem exactly: _"React Flow stores a child node's `position` relative to its parent, while edge handle coordinates are always absolute."_ `getAbsoluteNodes()` walks the `parentId` chain summing offsets (with a `visited` set against cycles); `excludeEdgeAncestorNodes()` removes the edge's own ancestor containers from the obstacle set, _"otherwise the path is forced to route around the container instead of within it."_ **That is the same rule JointJS reaches via `getAncestors()` — two independent implementations converging.**
- Performance model (README): `routeOnlyWhenBlocked: true` by default (clear straight line ⇒ skip A* entirely); corridor-cropped `Uint8Array` grid per edge, widened only on failure; LRU route cache keyed by each edge's own obstacle set; moving a node re-routes only edges whose corridor it entered or left; `routeWhileDragging: false` by default, so a dragged edge keeps its native path until drop; `onMetrics` reports `batchLatencyMs` and `mainThreadBlockingMs`. The sync escape hatch `getSmartEdge({nodes, sourceX, ...})` returns `{ svgPathString, edgeCenterX, edgeCenterY, points, wasRouted }` — `edgeCenterX/Y` exists specifically for label placement.

**GoJS**

- `Link.routing` is a plain per-link property, type `Routing`, default `Routing.Normal`, values `Normal` / `Orthogonal` / `AvoidsNodes` — [API](https://gojs.net/latest/api/symbols/Link.html#routing). The [Links intro](https://gojs.net/latest/intro/links.html) carries the performance warning verbatim: _"the use of AvoidsNodes routing is distinctly slower than normal Orthogonal routing, especially for large diagrams."_ It also documents two robustness behaviours worth copying: a node very close to or overlapping the link's own `fromNode`/`toNode` that would block the route **is ignored**, and if a ring of nodes makes routing impossible _"the routing algorithm will give up and cross over some nodes anyway."_ Opt-out is per-node: `Node.avoidable = false`, _"commonly done for Groups"_ — GoJS's equivalent of the ancestor-exclusion rule.

**React Flow + libavoid — there _is_ prior art**

- React Flow's own layouting docs: _"For automatic edge routing that avoids node intersections, our edge routing Pro Example uses libavoid to compute paths around nodes as the diagram changes"_ — [reactflow.dev/learn/layouting/layouting](https://reactflow.dev/learn/layouting/layouting), linking `Aksem/libavoid-js`. The Pro example is [Edge Routing](https://reactflow.dev/examples/edges/edge-routing) — _"Implement a routable edge with libavoid"_; it is paid, so the source is not inspectable.
- Open source: [avoid-nodes-edge](https://www.npmjs.com/package/avoid-nodes-edge) (v0.3.2, first published 2026-03-06) — _"Orthogonal edge routing for React Flow — edges avoid overlapping nodes via libavoid-js WASM running in a Web Worker."_ Peers `@xyflow/react >=12`, `zustand >=4`, `libavoid-js 0.4.5`. Shape: a custom edge component `AvoidNodesEdge` in `edgeTypes`, plus a `useAvoidNodesRouterFromWorker()` hook returning `{ updateRoutingOnNodesChange, resetRouting }`, with a zustand store between them. Advertises group-aware routing (_"edges pass through ancestor groups but route around unrelated groups"_ — the ancestor rule again), incremental re-routing on drag, and smooth-step/straight fallback while the worker loads. **Caveat: the README opens with "⚠️ Not actively maintained"** and redirects to a pure-JS successor, [avoid-edge-routing](https://github.com/awaisshah228/avoid-edge-routing). Deployment friction is real: `libavoid.wasm` must be copied into `public/` (postinstall script) and ES-module workers configured in Vite/webpack.

### Inferences

- **Both channels are needed.** A sync per-edge path-strategy registry (`{name, args}` resolved against an overridable namespace, plus a flow-level default, plus the option to pass a bare function) covers manhattan/metro-style routers and is genuinely clean. But it cannot host libavoid, ELK or a worker, which are global and transactional. For those, add an **imperative push channel** — "set this edge's path/vertices" — carrying an **origin tag** so the resulting change event is ignored by the router. Every integration reviewed independently invented that tag (`{avoidRouter:true}`, `{fromWorker:true}`); it is not optional.
- Keeping the **connector** (points → `d`) separate from the **router** (→ points) is what lets both channels share rounding, corner radius and curvature. The four-way JointJS split (anchor / router / connectionPoint / connector) is the most reusable decomposition found in the survey and maps directly onto ngx-vflow's "edges are SVG paths computed from handle positions".
- **Obstacles must be in flow/model coordinates, never screen** — zoom and pan must not perturb routes. Two rules converge across all four libraries: resolve nested children to absolute coordinates by summing the parent chain (with a cycle guard), and **exclude the edge's own ancestor containers from the obstacle set**, or an edge inside a group can never leave it. This is directly relevant to ngx-vflow's "any node can be a parent" model.
- Batching should be **debounce, not rAF** (JointJS worker: `debounce(100)` + `setTimeout(0)` + a `pending()` guard). Render an optimistic cheap path immediately and swap when results land, marking pending edges visually. Reconciliation is "last write wins, next batch corrects" — no edge is ever blocked on the router. Cache per edge keyed by that edge's own obstacle set and invalidate only edges whose corridor a moved node entered or left.
- **Labels come free if they are defined as a fraction along the path.** JointJS's `updateLabelPositions()` runs every render and derives position from `path.tangentAtLength(distance)` where `distance = relative ? labelDistance * getConnectionLength() : labelDistance`, so any routing change relocates labels automatically and the router never touches them. smart-edge instead returns `edgeCenterX/edgeCenterY` alongside the path, and — the interesting inversion — lets labels become obstacles via `avoidAreas`.
- A router needs a **fallback strategy**, because libavoid returns no validity signal; and a **per-node opt-out** (`Node.avoidable = false`) for containers.

### Gaps

- React Flow's official libavoid integration is a Pro example, so its source could not be inspected; the only inspectable React Flow + libavoid integration is an unmaintained package.
- libavoid-js's own README does not document its API; the contract had to be reconstructed from the TypeScript typings and the example. There is no stability guarantee attached to that reconstruction.
- No source examined measured the cost of `processTransaction()` on a large graph, so there is no quantitative basis for choosing debounce intervals beyond JointJS's chosen 100 ms.

### Hook table — Feature 5

| hook needed                                                               | phase                            | sync/async | veto/transform/observe        | reads                                                | writes                                        |
| ------------------------------------------------------------------------- | -------------------------------- | ---------- | ----------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| path-strategy registry (per-edge `{name,args}` or fn)                     | edge path computation            | sync       | transform / strategy override | vertices, edge ends, node bboxes                     | route points                                  |
| default path strategy (flow-level)                                        | edge path computation            | sync       | transform                     | same                                                 | route points                                  |
| connector / serializer (points → `d`)                                     | after routing                    | sync       | transform                     | route points, endpoints                              | SVG path `d`                                  |
| anchor resolution                                                         | before routing                   | sync       | transform                     | node/port bbox, ref point, rotation                  | endpoint                                      |
| connection point resolution                                               | after routing                    | sync       | transform                     | route line, node shape                               | trimmed endpoint                              |
| obstacle provider (absolute bboxes, ancestors excluded, per-node opt-out) | before routing                   | sync       | observe                       | node store, `parentId` chain, measured size, padding | obstacle set                                  |
| graph-change notification (move/resize/add/remove/reconnect)              | on model change                  | sync       | observe                       | changed keys + **origin tag**                        | —                                             |
| imperative path push (`setEdgePath`, origin-tagged)                       | any time (debounced batch)       | async-safe | transform                     | external route result                                | edge path / vertices (ephemeral or committed) |
| drag lifecycle (start / move / end)                                       | interaction                      | sync       | observe                       | dragged node ids                                     | routing mode switch (optimistic vs real)      |
| label position from path                                                  | after path update                | sync       | transform                     | path, `distance` / offset                            | label transform                               |
| fallback strategy                                                         | after routing, on invalid result | sync       | transform                     | candidate route, endpoints                           | replacement route                             |

---

## Feature 6 — Further plugin candidates

### Takeaway

The ecosystem's own packaging is the best catalogue: diagram-js ships **49 separate feature modules** under `lib/features`, and React Flow ships ~15 components plus ~84 examples that are effectively unpackaged plugins. Sorting them by hook kind gives four buckets — _observe only_ (the majority), _veto_, _transform in the drag loop_, _strategy override_ — plus an orthogonal requirement for an _extra UI layer_.

### Cited Findings

**diagram-js's feature list is a plugin taxonomy.** The complete set of modules under `lib/features` is: `align-elements`, `attach-support`, `auto-place`, `auto-resize`, `auto-scroll`, `bendpoints`, `change-support`, `clipboard`, `complex-preview`, `connect`, `connection-preview`, `context-pad`, `copy-paste`, `create`, `distribute-elements`, `dragging`, `editor-actions`, `global-connect`, `grid-snapping`, `hand-tool`, `hover-fix`, `hover-tooltip`, `interaction-events`, `keep-selection-visible`, `keyboard-move-selection`, `keyboard`, `label-support`, `lasso-tool`, `modeling`, `mouse`, `ordering`, `outline`, `overlays`, `palette`, `popup-menu`, `preview-support`, `replace`, `resize`, `root-elements`, `rules`, `scheduler`, `search-pad`, `search`, `selection`, `snapping`, `space-tool`, `tool-manager`, `tooltips` — [github.com/bpmn-io/diagram-js/tree/develop/lib/features](https://github.com/bpmn-io/diagram-js/tree/develop/lib/features). Note the ones that are _infrastructure for other plugins_: `overlays`, `tooltips`, `preview-support`, `complex-preview`, `rules`, `dragging`, `tool-manager`, `change-support`, `scheduler`, `interaction-events`.

**React Flow's built-in components** — [reactflow.dev/api-reference/components](https://reactflow.dev/api-reference/components): `Background` (line/dot/cross backgrounds), `BaseEdge` (used internally by all edges, manages the invisible interaction path and labels), `Controls` + `ControlButton` (zoom in/out, fit view, lock), `MiniMap` (SVG overview with viewport rect), `Handle` (connection points inside custom nodes), `NodeResizer` / `NodeResizeControl`, `NodeToolbar` (toolbar beside a node, _unaffected by zoom_), `EdgeToolbar`, `EdgeLabelRenderer` (**portal** for div-based edge labels), `Panel` (fixed-position overlay above the viewport; used by MiniMap and Controls), `ViewportPortal` (**portal into the transformed viewport**), `ReactFlowProvider`.

- `ViewportPortal` lets you _"add components to the same viewport of the flow where nodes and edges are rendered"_ so they are pan/zoom transformed — [reactflow.dev/api-reference/components/viewport-portal](https://reactflow.dev/api-reference/components/viewport-portal). `Panel` by contrast stays fixed on screen. **These two are React Flow's entire answer to "extra UI layer for plugins".**

**React Flow props that are plugin hooks** — [reactflow.dev/api-reference/react-flow](https://reactflow.dev/api-reference/react-flow): `onNodesChange` / `onEdgesChange` (controlled-flow interception point), `onNodeDragStart/onNodeDrag/onNodeDragStop`, `nodeDragThreshold`, `onConnect`, `onConnectStart/onConnectEnd`, `onReconnect`, `isValidConnection` (**veto**), `onBeforeDelete` (**veto**), `connectionRadius`, `snapToGrid` + `snapGrid`, `nodeExtent`, `translateExtent`, `autoPanOnNodeDrag`, `autoPanOnConnect`, `selectionOnDrag`, `selectionMode`, `panOnDrag`, `onlyRenderVisibleElements` (virtualization), `nodesDraggable` / `nodesConnectable` / `elementsSelectable` (read-only mode), `deleteKeyCode` / `selectionKeyCode` / `multiSelectionKeyCode`, `onSelectionChange`.

**The diagram-js extension primitives, quoted.**

- _EventBus_: listeners register with a **priority (default 1000, higher runs first)**; _"Returning false from a listener will prevent the events default action (if any is specified). To stop an event from being processed further in other listeners execute Event#stopPropagation."_ and _"Returning anything but `undefined` from a listener will stop the listener propagation"_ (the value is stored in `event.returnValue`) — [lib/core/EventBus.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/core/EventBus.js).
- _Rules_ (the canonical veto): `addRule(actions, priority, fn)` where the callback _"must return `false` to disallow the action from happening or `true` to allow the action. Usually returning `null` denotes that a particular interaction shall be ignored. By returning nothing or `undefined` you pass evaluation to lower priority rules."_ — [lib/features/rules/RuleProvider.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/rules/RuleProvider.js).
- _Dragging_ (the canonical drag lifecycle): fires `init`, `start`, `move`, `end`, `cleanup`, `ended`, `cancel`/`canceled` under both a generic `drag.` prefix and a caller-supplied namespace; payload carries `x`, `y`, `dx`, `dy` **in diagram space (canvas-relative, zoom-corrected)**, `originalEvent`, `hover`, `hoverGfx`, `previousSelection`, plus merged `options.data`. It stays "initialized" until a `threshold` (default 5 px) is exceeded or `autoActivate: true`. Listeners may `return false` to cancel — [lib/features/dragging/Dragging.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/dragging/Dragging.js).
- _Overlays_ (the plugin UI layer): `overlays.add(element, type, { position: {top,right,bottom,left}, html, show: {minZoom,maxZoom}, scale })` returns an id; `remove(idOrFilter)`. Each element gets a `.djs-overlays` container positioned at the element's x/y, individual overlays sit in `.djs-overlay` divs, and a **root container applies the canvas viewbox matrix to all overlays at once**; overlays hide outside the declared zoom range and are cleaned up when the element is removed — [lib/features/overlays/Overlays.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/overlays/Overlays.js).
- _CommandStack_ (undo/redo): phases `preExecute → preExecuted → execute → executed → postExecute → postExecuted` on execute and `revert → reverted` on undo, each fired as both `commandStack.{event}` and `commandStack.{command}.{event}`; commands issued from `preExecute`/`postExecute` join the same atomic undo unit — [lib/command/CommandStack.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/command/CommandStack.js).

**Per-candidate notes with sources.**

- **Snap-to-grid** — diagram-js `GridSnapping` listens at `LOWER_PRIORITY` (1200) to `shape.move.move/end`, `resize.move/end`, `connect.move/end`, `bendpoint.move.move/end`, `create.move/end`, `connectionSegment.move.move/end` and **mutates `event.x/y/dx/dy` in place** via `snapEvent` → `snapValue` → `setSnapped`, quantizing to `SPACING`; resize obeys `resizeConstraints` per direction and create obeys `createConstraints` — [lib/features/grid-snapping/GridSnapping.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/grid-snapping/GridSnapping.js). React Flow's equivalent is the declarative `snapToGrid`/`snapGrid` pair.
- **Alignment guides / helper lines** — React Flow's Pro example intercepts `onNodesChange`: `getHelperLines` compares the dragged node's anchors (top/bottom/left/right/center) against `HelperLine` objects derived from the other nodes within a `SNAP_RADIUS`, **modifies the position change's coordinates before `applyNodeChanges` processes it**, and returns a `HelperLines` canvas component rendered inside the flow — [reactflow.dev/examples/interaction/helper-lines](https://reactflow.dev/examples/interaction/helper-lines). diagram-js's equivalent is `Snapping`: `snapCurrent` combines event coords with a snap origin and `setSnapped(event, axis, value)` **mutates the in-flight drag event synchronously**, while `showSnapLine` renders the guide — [lib/features/snapping/Snapping.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/snapping/Snapping.js). → _transform in the drag loop + extra UI layer._
- **Undo/redo/history** — diagram-js CommandStack (above) is the reference design; React Flow has no built-in stack and ships a Pro example built on snapshots of nodes/edges — [reactflow.dev/examples/interaction/undo-redo](https://reactflow.dev/examples/interaction/undo-redo). → _needs a transaction/batch boundary emitted by the engine, not a hook of its own._
- **Copy/paste/clipboard** — diagram-js splits `clipboard` (the store) from `copy-paste` (the semantics); React Flow ships a Pro example — [reactflow.dev/examples/interaction/copy-paste](https://reactflow.dev/examples/interaction/copy-paste). → _structural op emission + serialization hook._
- **Keyboard shortcuts** — diagram-js `keyboard`, `keyboard-move-selection`, `editor-actions`; React Flow `deleteKeyCode`/`selectionKeyCode`/`multiSelectionKeyCode`. → _observe + veto (swallow the key)._
- **Minimap / background / controls** — React Flow components; all read the viewport + node rects and render in a fixed `Panel`. → _observe only + extra UI layer._
- **Node toolbar** — React Flow `NodeToolbar` renders beside a node but is _"unaffected by zoom"_. → _extra UI layer anchored to a node, counter-scaled._
- **Node resizer** — React Flow `NodeResizer`/`NodeResizeControl` + `XYResizer`; interacts with `expandParent` (see Feature 1). → _transform (size + position) in the drag loop._
- **Edge reconnect / bendpoints** — diagram-js `bendpoints` + `connectionSegment.move`; React Flow `onReconnect` and the [Reconnect Edge](https://reactflow.dev/examples/edges/reconnect-edge) and Pro [Editable Edge](https://reactflow.dev/examples/edges/editable-edge) examples. → _transform + structural op at drag end + extra UI layer (the bendpoint handles)._
- **Lasso / marquee selection** — diagram-js `lasso-tool`; React Flow `selectionOnDrag` + `selectionMode` (partial vs full containment) and the whiteboard [Lasso Selection](https://reactflow.dev/examples/whiteboard/lasso-selection) example. → _extra UI layer + writes selection._
- **Context menu** — diagram-js `context-pad` / `popup-menu`; React Flow [Context Menu example](https://reactflow.dev/examples/interaction/context-menu). → _observe + extra UI layer._
- **Auto-pan (edge scrolling)** — diagram-js `auto-scroll` and `keep-selection-visible`; React Flow `autoPanOnNodeDrag`, `autoPanOnConnect`, and `autoPanOnNodeFocus` for a11y. → _observe drag position + writes the viewport._
- **Collaboration (Yjs)** — React Flow ships a Pro [Collaborative example](https://reactflow.dev/examples/interaction/collaborative) _"for multiple users with React Flow and yjs"_; xyflow maintains forks of the transports, [xyflow/y-webrtc](https://github.com/xyflow/y-webrtc) and [xyflow/y-websocket-server](https://github.com/xyflow/y-websocket-server). → _observe + write; needs remote-origin tagging so remote writes don't re-emit._
- **Persistence / serialization** — React Flow [Save and Restore](https://reactflow.dev/examples/interaction/save-and-restore) (`toObject()`). → _observe only._
- **Export to image** — React Flow [Download Image](https://reactflow.dev/examples/misc/download-image) uses `html-to-image`, pinned: _"The version of the html-to-image package used in this example, has been locked to 1.11.11, which is the latest working version for the package."_; viewport maths via `getNodesBounds` + `getViewportForBounds`. → _observe + needs a stable DOM root and bounds utilities._
- **Node search / filter** — diagram-js `search` + `search-pad`. → _observe + extra UI layer._
- **Collapse / expand subtree** — React Flow Pro [Expand and Collapse](https://reactflow.dev/examples/layout/expand-collapse): _"The implementation uses a custom `useExpandCollapse` hook that maintains the complete graph structure while only rendering the currently visible portions"_, followed by a Dagre layout pass. diagram-js has `shape.toggleCollapse` as a first-class command (see Feature 1). → _transform of the rendered node/edge set (a derived view), not of positions._
- **Edge bundling** — no JS flow library ships it. Desktop Cytoscape has a Bundle Edges layout action that _"does not scale well to large networks"_ ([manual.cytoscape.org](https://manual.cytoscape.org/en/stable/Navigation_and_Layout.html)); cytoscape.js has an open request rather than an implementation ([cytoscape.js#2332](https://github.com/cytoscape/cytoscape.js/issues/2332)); the D3 implementations are Holten's hierarchical bundling ([observablehq.com/@d3/hierarchical-edge-bundling](https://observablehq.com/@d3/hierarchical-edge-bundling)) and force-directed bundling ([d3.ForceBundle](https://github.com/vasturiano/d3.ForceBundle)). → _strategy override on edge paths, same hook as Feature 5, but global rather than per-edge._
- **Virtualization** — React Flow `onlyRenderVisibleElements`: _"only render nodes and edges that would be visible in the viewport"_. → _transform of the rendered set._
- **Read-only mode** — React Flow `nodesDraggable` / `nodesConnectable` / `elementsSelectable`, each overridable per element; JointJS `interactive` can be a boolean, an object of interaction keys, **or a function `(cellView, eventName) => boolean|object`** ([docs.jointjs.com/api/dia/Paper](https://docs.jointjs.com/api/dia/Paper/)). → _veto._
- **Validation / connection rules** — React Flow `isValidConnection` and the [Validation](https://reactflow.dev/examples/interaction/validation) and [Preventing Cycles](https://reactflow.dev/examples/interaction/prevent-cycles) examples; JointJS `validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView)` and `validateMagnet(cellView, magnet, evt)`; diagram-js `rules`. → _veto, evaluated live during the connect drag (for highlighting) and again at drop._
- **Touch support** — React Flow [Touch Device](https://reactflow.dev/examples/interaction/touch-device); JointJS `clickThreshold` and `magnetThreshold` (number of mousemoves, or `'onleave'`) exist for the same reason. → _engine-level, not a plugin._
- **Accessibility** — React Flow ships tab focus of nodes/edges, Enter/Space to select, Escape to deselect, arrow keys to move a selected node (Shift for faster), `role="group"` by default, an `aria-live="assertive"` region announcing node movement, and the props `nodesFocusable`, `edgesFocusable`, `disableKeyboardA11y`, `autoPanOnNodeFocus`, `ariaRole`, `ariaLabelConfig`, `domAttributes` — [reactflow.dev/learn/advanced-use/accessibility](https://reactflow.dev/learn/advanced-use/accessibility). → _engine-level with per-node overrides; a plugin only needs the live region and key bindings._
- **Collision resolution / node overlap** — React Flow's [Node Collisions example](https://reactflow.dev/examples/layout/node-collisions) uses an **iterative manual sweep**, not d3-force: nodes are converted to boxes, each pair is compared, and overlaps are resolved along the smaller penetration axis (`if (px < py) { … A.x += moveAmount; B.x -= moveAmount; }`), with an early exit when nothing moved. xyflow additionally maintains an experimental repo, [xyflow/node-collision-algorithms](https://github.com/xyflow/node-collision-algorithms), _"Testing various algorithms for resolving node overlaps in a flow"_, and a fork of [rbush](https://github.com/xyflow/rbush), _"a high-performance JavaScript R-tree-based 2D spatial index for points and rectangles"_. → _transform in the drag loop; needs a spatial index._

### Inferences

- The `rbush` fork plus the collision-algorithms repo are strong evidence that **an engine-owned spatial index of node rects is the missing primitive** shared by proximity connect, collision resolution, lasso selection, snapping/alignment guides and obstacle routing. Exposing it once pays for four or five plugins.
- diagram-js's split between `rules` (veto), `dragging` (lifecycle with mutable event), `overlays`/`tooltips`/`preview-support` (UI layers) and `CommandStack` (transactions) is almost exactly the set of extension points this research keeps rediscovering. It is the best single model to copy.
- React Flow's `onNodesChange` is a _change-list interceptor_: a single choke point where a plugin may rewrite or drop a change before it is applied. That is a strictly more general design than a dedicated `constrainPosition`, and it is how the helper-lines plugin works.
- Most of the catalogue is "observe only" — those do not need a plugin API at all, only stable public state + a UI layer. The API surface that actually matters is the small set needing veto, transform, strategy override or transactions.

### Gaps

- I found no third-party plugin _marketplace_ for React Flow; the curated [awesome-node-based-uis](https://github.com/xyflow/awesome-node-based-uis) list is about libraries, not plugins. React Flow's extension story is examples + Pro examples, i.e. copy-paste code, not installable plugins. Rete and Cytoscape are the only two with a real installable-plugin ecosystem.
- I did not verify the exact internal source of the React Flow helper-lines example (it is Pro; the source is not in the public `xyflow/xyflow` repo — a GitHub code search for `getHelperLines` in the org returns nothing). The description above comes from the documentation page, not the source.

---

## Cross-cutting questions

### Q1 — Which features need to _transform_ a value in the drag loop vs _observe_ and write back? What do libraries choose?

#### Takeaway

The ecosystem has three distinct shapes, and they are not interchangeable. React Flow's `onNodeDrag` is **observe-only** (it returns nothing and the drag has already been applied); its actual transform point is the **change-list interceptor** `onNodesChange`. CDK, JointJS and X6 offer a **point/rect transform** at the pointer level. diagram-js offers a **mutable in-flight drag event**. Anything that must adjust the position _before it is rendered_ needs shape 2 or 3; observe-and-write-back always renders one frame of the un-adjusted position first.

#### Cited Findings

- **React Flow — no position transform hook.** `onNodeDrag` / `onNodeDragStart` / `onNodeDragStop` are event handlers; the transform point is `onNodesChange`, which receives a `NodePositionChange` = `{ id, type: "position", position, positionAbsolute, dragging }` and is expected to end in `applyNodeChanges(changes, nodes)` — _"If you don't need any custom behavior, this util can be used"_ — [NodeChange](https://reactflow.dev/api-reference/types/node-change), [applyNodeChanges](https://reactflow.dev/api-reference/utils/apply-node-changes), [ReactFlow props](https://reactflow.dev/api-reference/react-flow). The helper-lines plugin works exactly this way: it _"modifies the position change object's coordinates to align with helper lines, then passes the transformed change to the standard React Flow change system"_ — [helper lines example](https://reactflow.dev/examples/interaction/helper-lines). Declarative constraints (`snapToGrid`/`snapGrid`, `nodeExtent`, `extent: 'parent'`) are baked into the engine instead of exposed as hooks.
- **Angular CDK — a point transform.** `DragConstrainPosition` is _"Function that can be used to constrain the position of a dragged element"_ with signature `(userPointerPosition: Point, dragRef: DragRef, dimensions: DOMRect, pickupPositionInElement: Point) => Point`, called inside `_getConstrainedPointerPosition()` as `let {x, y} = this.constrainPosition ? this.constrainPosition(point, this, this._initialDomRect!, this._pickupPositionInElement) : point;` — _after_ the initial pointer position is computed but _before_ axis-locking and boundary clamping — [drag-ref.ts](https://raw.githubusercontent.com/angular/components/main/src/cdk/drag-drop/drag-ref.ts).
- **JointJS — a rect _or_ a point transform.** `restrictTranslate` accepts a bounding box `{x,y,width,height}`, `null` for no restriction, **or a function `(x, y) => { x, y }` returning a new position for the pointer coordinates** — [docs.jointjs.com/api/dia/Paper](https://docs.jointjs.com/api/dia/Paper/). Note it is the _only_ one of the three that lets you return either a constraint region or a computed point.
- **X6 — a rect transform only.** `translating.restrict` is `boolean | number | Rectangle.RectangleLike | ((cellView: CellView) => Rectangle.RectangleLike)`: `true` prevents nodes leaving the canvas, a negative number insets the allowed area, and a function returns the movement region — [X6 transform docs](https://x6.antv.vision/en/docs/api/graph/transform/). X6 cannot express "snap to this point"; for that it uses `snapToGrid` inside individual routers/tools instead.
- **diagram-js — a mutable in-flight event.** The drag payload carries `x`, `y`, `dx`, `dy` **in diagram space (canvas-relative, zoom-corrected)**, and listeners may `return false` to cancel — [Dragging.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/dragging/Dragging.js). `GridSnapping` listens at `LOWER_PRIORITY` (1200) to `shape.move.move/end`, `resize.move/end`, `connect.move/end`, `bendpoint.move.move/end`, `create.move/end`, `connectionSegment.move.move/end` and **mutates `event.x/y/dx/dy` in place** via `snapEvent` → `snapValue` → `setSnapped` — [GridSnapping.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/grid-snapping/GridSnapping.js). `Snapping` does the same for alignment: `snapCurrent` combines the event coords with a snap origin and `setSnapped(event, axis, value)` mutates synchronously, while `showSnapLine` renders the guide — [Snapping.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/snapping/Snapping.js).
- **Ordering between plugins is explicit in diagram-js and absent elsewhere.** EventBus listeners take a **priority (default 1000, higher first)**; _"Returning false from a listener will prevent the events default action"_; _"Returning anything but `undefined` from a listener will stop the listener propagation"_ — [EventBus.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/core/EventBus.js). Rete v2's pipes are the same idea in a different idiom: `addPipe((context) => …)` where **returning the context continues propagation and returning nothing blocks it** — [retejs.org/docs/concepts/plugin-system](https://retejs.org/docs/concepts/plugin-system).

#### Inferences

- **Need transform-in-loop:** snap-to-grid, alignment guides/helper lines, parent auto-grow (React Flow does it in-loop for exactly this reason), collision resolution, resize-in-rotated-space, node extent/boundary clamping, rotation snapping. All of these must adjust the value the user sees this frame.
- **Observe-and-write-back is sufficient:** proximity-connect candidate detection, layout pinning (`fx`/`fy`), auto-pan, obstacle-routing invalidation, minimap/collab/persistence, selection-driven UI. These react to the position; they do not correct it.
- **The single most flexible shape is React Flow's change-list interceptor**, because one choke point lets a plugin rewrite, drop, or add changes, and it composes naturally with a priority-ordered chain. A dedicated `constrainPosition(point) => point` (CDK) is simpler but cannot express "also resize the parent and shift the siblings", which is precisely what feature 1 needs.
- For ngx-vflow the recommendation that falls out of this: a **priority-ordered pipeline over the batch of interactive-property writes**, where each plugin may transform the batch, add to it, or veto it — diagram-js's priority semantics + Rete's "return context or block" convention + React Flow's change-list payload. A drag-loop `Point => Point` hook alone is not enough.
- Ordering matters concretely: grid snapping must run _after_ alignment-guide snapping (diagram-js encodes this as priority 1200 vs Snapping's default), and parent auto-grow must run after both.

#### Gaps

- No library documents a _public_ ordering contract for third-party plugins in the drag loop other than diagram-js's numeric priorities; React Flow leaves composition entirely to the application's reducer.

### Q2 — Which features need ephemeral render state, and how is an overlay/decoration layer exposed?

#### Takeaway

Three genuinely different surfaces are needed — content in flow coordinates (guide lines, preview edges, hint boxes), content anchored to an element but counter-scaled (rotation knobs, resize handles, toolbars), and fixed screen-space chrome (minimap, controls). React Flow exposes the first two as `ViewportPortal` / `NodeToolbar`+`EdgeLabelRenderer` and the third as `Panel`; diagram-js exposes an `Overlays` service plus a `djs-dragger` preview group. **React Flow's proximity-connect example is the cautionary counter-example**: it uses no overlay at all and pushes the ephemeral edge into application state.

#### Cited Findings

- **React Flow's overlay primitives.** `ViewportPortal` lets you _"add components to the same viewport of the flow where nodes and edges are rendered"_, so children are pan/zoom transformed — [viewport-portal](https://reactflow.dev/api-reference/components/viewport-portal). `Panel` _"helps you position content above the viewport"_ and stays fixed on screen. `NodeToolbar` and `EdgeToolbar` render beside an element but are _"unaffected by zoom"_; `EdgeLabelRenderer` is a portal for div-based edge labels — [components reference](https://reactflow.dev/api-reference/components).
- **diagram-js `Overlays`**: `overlays.add(element, type, { position: {top,right,bottom,left}, html, show: {minZoom,maxZoom}, scale })` → id; `remove(idOrFilter)`. Each element gets a `.djs-overlays` container at the element's x/y, individual overlays sit in `.djs-overlay` divs, and a **root container applies the canvas viewbox matrix to all overlays at once**; overlays hide outside their declared zoom range and are cleaned up with the element — [Overlays.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/overlays/Overlays.js). Note `scale: true | false | {min,max}` is exactly the "counter-scale or not" switch.
- **diagram-js preview layer**: `MARKER_CONNECTION_PREVIEW = 'djs-dragger'`; `createConnectionPreviewGfx()` is `svgCreate('g')` with `pointerEvents: 'none'`, class `djs-dragger`, appended to `canvas.getActiveLayer()`. `drawPreview` builds a **throwaway model** via `elementFactory.createConnection(attrs)` (never added to the canvas) and then runs the _real_ `layouter.layoutConnection` + `connectionDocking.getCroppedWaypoints` + `graphicsFactory.drawConnection` — [ConnectionPreview.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/connection-preview/ConnectionPreview.js). The module list also contains dedicated `preview-support`, `complex-preview`, `tooltips` and `outline` features — [lib/features](https://github.com/bpmn-io/diagram-js/tree/develop/lib/features).
- **Rete**: `createPseudoconnection` allocates `id = \`pseudo_${getUID()}\``, calls `areaPlugin.addConnectionView(payload)`with`isPseudo: true`, re-renders on each move, and `unmount()`calls`areaPlugin.removeConnectionView(id)`. **It exists only in the area plugin's view layer, never in the `NodeEditor` data model** — [pseudoconnection.ts](https://github.com/retejs/connection-plugin/blob/main/src/pseudoconnection.ts).
- **The counter-example**: React Flow's proximity connect pushes `{ ...closeEdge, className: 'temp' }` into the `edges` array on every drag frame and commits by removing the class on `onNodeDragStop` — [proximity-connect](https://reactflow.dev/examples/nodes/proximity-connect). Its Temporary Edges example likewise creates a real ghost node and a real edge in state — [temporary-edges](https://reactflow.dev/examples/edges/temporary-edges).

#### Inferences

- Features needing an ephemeral layer: proximity-connect hint edge, connection preview while dragging from a handle, alignment/helper lines, snap lines, rotation knob, resize handles, lasso rectangle, drop-target highlight, "awaiting route" edge state, collaboration cursors, node toolbar, context menu.
- ngx-vflow needs **all three surfaces**, and they should be distinct APIs because their transform behaviour differs: flow-coordinate SVG (scales with zoom), element-anchored counter-scaled HTML (diagram-js's `scale` option; React Flow's `NodeToolbar`), and fixed screen chrome.
- The strongest design property found is diagram-js's: **the preview is drawn by the same path/marker pipeline as committed content**, so preview and result are pixel-identical. For ngx-vflow this means the ephemeral edge layer should accept the same edge descriptor the real edge renderer takes, not a bespoke "hint line" primitive.
- Given ngx-vflow's app-owned-state contract, the ephemeral layer is not a nicety — it is **required**, because the alternative (React Flow's) is the library writing structural data into the app's store every frame.

#### Gaps

- No library exposes its preview layer as a documented third-party plugin API; `Overlays` (HTML anchored to an element) is the only documented one, and it cannot draw a free-form SVG path between two points.

### Q3 — Which features need a "structural operation" emission at drag end?

#### Takeaway

Reparenting and connecting are the two, and both libraries that treat them seriously (diagram-js, X6) make the _decision_ during the drag (highlight only) and the _write_ exactly once at drag end, inside a transaction.

#### Cited Findings

- **Connect**: diagram-js's `connect.end` is the only writer — `context.connection = modeling.connect(source, target, attrs, hints)`, returning `false` to veto; when the rule's `canExecute` is an object it is passed through as `attrs` — [Connect.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/connect/Connect.js). X6's `validateEdge` fires on drop and _"If the function returns `false`, the edge is either removed … or reverted to the state before the interaction"_ — [X6 connecting](https://x6.antv.antgroup.com/en/docs/api/graph/interaction#connecting).
- **Reparent**: X6's `processEmbedding` runs on every mousemove but **only highlights**; `finalizeEmbedding` on mouseup wraps `insertChild`/`unembed` in `graph.startBatch('embedding')` — [view/node/index.ts#L791-L877](https://github.com/antvis/X6/blob/master/src/view/node/index.ts#L791-L877), [#L886-L922](https://github.com/antvis/X6/blob/master/src/view/node/index.ts#L886-L922). Rete's classic scopes agent picks candidates on `nodepicked` after 250 ms, cancels on `nodetranslated`, and calls `reassignParent` only on `nodedragged` — [agents/classic/index.ts#L49-L64](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/agents/classic/index.ts#L49-L64).
- **Transactionality**: diagram-js's CommandStack groups nested commands issued from `preExecute`/`postExecute` into one atomic undo unit — [CommandStack.js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/command/CommandStack.js); mxGraph wraps `extendParent` call sites in `model.beginUpdate()/endUpdate()` — [mxGraph.js](https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/view/mxGraph.js). React Flow has no transaction concept; its undo/redo Pro example is snapshot-based — [undo-redo](https://reactflow.dev/examples/interaction/undo-redo).

#### Inferences

- Structural emissions needed at drag end: **connect** (proximity connect, handle drag), **reparent** (drop into/out of a parent), **delete** (drag-to-trash / eraser), **add** (drag-and-drop from a palette), **reconnect** (edge endpoint moved to a new node).
- ngx-vflow's existing "describe structural changes to the app" contract already matches this shape. What it additionally needs is a **batch/transaction boundary**: one drag gesture that both moved a node and reparented it (and auto-grew the parent) must surface as one unit, or the app's undo stack will fragment.
- The decision/commit split should be explicit in the API: a `candidate` observable during the drag (for highlighting only) and a single structural emission at the end.

#### Gaps

- Nothing found on how a library should express "this interactive-property write and this structural change belong to the same user gesture" when the two go to different owners (library-written signal vs app-applied operation). That is a design question specific to ngx-vflow's split-ownership model, with no prior art.

### Q4 — Which features need async work, and how is the result reconciled?

#### Takeaway

Async is needed for ELK/dagre layouts, libavoid WASM, web-worker routers, and any measurement-dependent pass. **Reconciliation is the ecosystem's weakest area**: nobody versions requests. The only defences found in practice are (a) an origin tag on writes to break feedback loops, (b) optimistic cheap output swapped when the real result lands, (c) `stop()`/`cancel()` for in-flight work, and (d) "last write wins, the next batch corrects".

#### Cited Findings

- **Async sources**: `elk.layout(graph)` _"returns a `Promise`"_, with worker mode `new ELK({ workerUrl: … })` — [elkjs](https://github.com/kieler/elkjs); `AvoidLib.load(filePath?) => Promise<void>` with everything after the load synchronous — [libavoid-js src/common.js](https://github.com/Aksem/libavoid-js/blob/master/src/common.js); react-flow-smart-edge v5 dispatches batched routing **to a Web Worker by default** — [tisoap/react-flow-smart-edge](https://github.com/tisoap/react-flow-smart-edge); `avoid-nodes-edge` runs libavoid-js WASM in a worker — [npm](https://www.npmjs.com/package/avoid-nodes-edge).
- **No versioning anywhere**: React Flow's ELK example does `setNodes(children)` on resolve with no generation check — [LayoutingFlow6-Elkjs](https://github.com/xyflow/react-flow-docs/blob/main/src/components/CodeViewer/api-flows/LayoutingFlow6-Elkjs/index.js). The only levers are Cytoscape's `stop()` (_"specified only for continuous layouts"_) — [extensions.md](https://github.com/cytoscape/cytoscape.js/blob/unstable/documentation/md/extensions.md) — G6's `stop()`/`destroy()` — [g6 custom layout](https://g6.antv.antgroup.com/en/manual/layout/custom-layout) — and Rete's `TransitionApplier.cancel(id)` — [transition applier](https://github.com/retejs/auto-arrange-plugin/blob/main/src/appliers/list/transition/index.ts).
- **Origin tagging is universal and mandatory**: JointJS's avoid-router writes `link.set(attrs, { avoidRouter: true })` and `onCellChanged(cell, opt)` starts with `if (opt.avoidRouter) return;`, with a second tag `{ fromWorker: true }` in the worker variant — [avoid-router.js](https://github.com/clientIO/joint/blob/master/examples/libavoid/src/shared/avoid-router.js). X6 stamps `options.translateBy = options.translateBy || this.id` during recursive translation — [model/node.ts](https://github.com/antvis/X6/blob/master/src/model/node.ts). Rete keeps a refcount map with `isTranslating(id)` and the docblock _"keep track of currently moving nodes (to prevent infinite loop)"_ — [scopes-plugin/src/utils.ts#L39-L65](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/utils.ts#L39-L65).
- **Optimistic + reconcile**: while a worker route is pending, JointJS sets each connected link to `router('rightAngle')` plus an `awaiting-update` highlighter class; on `{command:'routed', cells}` it applies only `vertices`, `source`, `target`, `router: null`; a node moved meanwhile is corrected by the next batch — [avoid-router.js](https://github.com/clientIO/joint/blob/master/examples/libavoid/src/shared/avoid-router.js).
- **Debounce, not rAF**: the worker variant uses `util.debounce(fn, 100)` + `setTimeout(..., 0)` guarded by `debouncedProcessTransaction.pending()`. No `requestAnimationFrame` anywhere in that integration.
- **Measurement is the other async source**: layout must wait for measured sizes — `useNodesInitialized()` _"tells you whether all the nodes in a flow have been measured and given a width and height"_ — [useNodesInitialized](https://reactflow.dev/api-reference/hooks/use-nodes-initialized); React Flow's expandParent recursion up ancestors is likewise deferred one measurement frame via the ResizeObserver → `updateNodeInternals` path — [store.ts#L487-L505](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/store.ts#L487-L505).

#### Inferences

- The engine must provide three async-related primitives, none of which are optional:
  1. **An origin tag on every write** (`{ source: 'plugin:x' }`), so a plugin can ignore its own echoes. Every integration reviewed invented this independently.
  2. **A revision/generation counter on the graph**, so an async result computed against revision _N_ can be dropped or partially applied when the graph is at _N+k_. No library does this; it is the obvious gap to fill rather than copy.
  3. **A "sizes are measured" signal**, since both layout and auto-resize depend on it.
- Partial application is preferable to all-or-nothing: apply the async result only to nodes/edges that still exist and were not touched by the user since the request. This is implementable on top of (2) with per-entity revisions.
- Results should land as a **transform applied by the engine into the app's writable signals**, not as a direct write by the plugin, so ownership stays with the engine and the origin tag is applied consistently.
- Debouncing (~100 ms) plus an optimistic cheap fallback is the pattern with the most evidence behind it; rAF-driven routing has none.

#### Gaps

- There is **no prior art at all** for reconciling an async layout/route against concurrent structural change (node removed, reparented, edge deleted). Every implementation reviewed either ignores the problem or relies on "the next batch fixes it". Any design ngx-vflow adopts here will be novel.
- No source quantifies the cost of `processTransaction()` or an ELK run at a given graph size, so debounce intervals and the cutover point between sync and worker routing cannot be grounded in published numbers.

### Summary matrix — hook kind by feature

| feature                          | veto                  | transform                     | strategy override       | extra UI layer    | structural op    | async            |
| -------------------------------- | --------------------- | ----------------------------- | ----------------------- | ----------------- | ---------------- | ---------------- |
| parent auto-grow / shrink-to-fit | ✓ (allow-resize rule) | ✓ (drag loop)                 | —                       | —                 | ✓ (reparent)     | measurement only |
| layout engines                   | —                     | ✓ (positions)                 | ✓                       | —                 | —                | ✓                |
| node rotation                    | ✓ (commit)            | ✓ (angle, bbox, resize frame) | ✓ (bbox / anchor frame) | ✓ (knob)          | —                | —                |
| proximity connect                | ✓ (3-valued)          | ✓ (candidate → attrs)         | —                       | ✓ (hint edge)     | ✓ (connect)      | —                |
| obstacle routing                 | —                     | ✓ (path)                      | ✓                       | ✓ (pending state) | —                | ✓                |
| snap-to-grid                     | —                     | ✓ (drag loop)                 | —                       | —                 | —                | —                |
| alignment guides                 | —                     | ✓ (drag loop)                 | —                       | ✓ (lines)         | —                | —                |
| collision resolution             | —                     | ✓ (drag loop)                 | —                       | —                 | —                | —                |
| undo/redo                        | —                     | —                             | —                       | —                 | ✓ (transactions) | —                |
| copy/paste                       | —                     | —                             | ✓ (serialization)       | —                 | ✓                | —                |
| keyboard shortcuts               | ✓ (swallow key)       | —                             | —                       | —                 | ✓                | —                |
| minimap / background / controls  | —                     | —                             | —                       | ✓                 | —                | —                |
| node toolbar / context menu      | —                     | —                             | —                       | ✓                 | ✓ (actions)      | —                |
| node resizer                     | ✓                     | ✓                             | —                       | ✓ (handles)       | —                | —                |
| edge reconnect / bendpoints      | ✓                     | ✓                             | —                       | ✓                 | ✓                | —                |
| lasso / marquee selection        | —                     | —                             | ✓ (containment mode)    | ✓                 | —                | —                |
| auto-pan                         | —                     | —                             | —                       | —                 | —                | —                |
| collaboration (Yjs)              | —                     | —                             | —                       | ✓ (cursors)       | ✓                | ✓                |
| persistence / export image       | —                     | —                             | ✓ (serializer)          | —                 | —                | ✓                |
| node search / filter             | —                     | ✓ (visible set)               | —                       | ✓                 | —                | —                |
| collapse / expand subtree        | —                     | ✓ (visible set)               | —                       | —                 | —                | —                |
| edge bundling                    | —                     | —                             | ✓ (global path)         | —                 | —                | ✓                |
| virtualization                   | —                     | ✓ (rendered set)              | —                       | —                 | —                | —                |
| read-only mode                   | ✓                     | —                             | —                       | —                 | —                | —                |
| validation / connection rules    | ✓                     | ✓ (returned attrs)            | —                       | ✓ (highlight)     | —                | —                |
| accessibility                    | —                     | —                             | —                       | ✓ (live region)   | —                | —                |
