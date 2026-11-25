## Migration from v2 to v3

This page lists every breaking change between ngx-vflow 2.7 and 3.0. Apply the sections in order.

- **Tables** map a v2 API to its v3 replacement. These are mechanical edits.
- **Rules** describe behavior that changed under the same API. Check the code that depends on it.
- An API not named here is unchanged. Old names have no aliases.

### Requirements

- Angular 20 or later: `@angular/core` and `@angular/common` 20, 21 or 22.
- Remove `d3-zoom`, `d3-drag`, `d3-selection` and their `@types/*` packages unless the application imports them
  itself. Gestures run on Pointer Events.
- The `ngx-vflow/testing` entry point is removed. See [Testing](#testing).
- Core renders no ready-made presentation. Every node and edge needs a template or a component, written by the
  application or taken from [@vflow/ui](/packages/ui/overview) (`npx @vflow/cli ui`, requires Tailwind CSS 4).

### Selectors and classes

Core selectors use the `v` prefix. Public classes are `Vflow*Directive` / `Vflow*Component`. The `Vflow` array
still contains everything public.

| v2                                                                                           | v3                                                                                      |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `ng-template[nodeHtml]`, `NodeHtmlTemplateDirective`, `NodeContext`                          | `ng-template[vNode]` or the structural `vNode`, `VflowNodeTemplateDirective`, `NodeRef` |
| `ng-template[nodeSvg]`, `NodeSvgTemplateDirective`, `SvgNodeContext`                         | `vNode` with HTML content. SVG node content is not supported                            |
| `ng-template[groupNode]`, `GroupNodeTemplateDirective`, `GroupNodeContext`                   | A branch of the `vNode` template, see [Nodes](#nodes)                                   |
| `ng-template[edge]`, `EdgeTemplateDirective`, `EdgeContext`                                  | `ng-template[vEdge]` or the structural `vEdge`, `VflowEdgeTemplateDirective`, `EdgeRef` |
| `ng-template[connection]`, `ConnectionTemplateDirective`                                     | `ng-template[vConnection]`, `VflowConnectionTemplateDirective`                          |
| `ng-template[edgeLabelHtml]`, `EdgeLabelHtmlTemplateDirective`                               | `vEdgeLabel` inside the edge presentation, `VflowEdgeLabelTemplateDirective`            |
| `<handle>`, `HandleComponent`, `ng-template[handle]`, `HandleTemplateDirective`              | `[vHandle]` on an application element, `VflowHandleDirective`, see [Handles](#handles)  |
| `[resizable]`, `ResizableComponent`                                                          | `[vResizable]`, `VflowResizableComponent`                                               |
| `[dragHandle]`, `DragHandleDirective`                                                        | `[vDragHandle]`, `VflowDragHandleDirective`                                             |
| `[selectable]`, `SelectableDirective`                                                        | Remove. A click on the presentation selects, see [Selection](#selection)                |
| `g[customTemplateEdge]`, `CustomTemplateEdgeComponent`                                       | Remove the attribute. The flow draws the interaction stroke                             |
| `<mini-map>`, `MiniMapComponent`, `MiniMapPosition`                                          | `<v-minimap>`, `VflowMinimapComponent`; placement through `vPanel` and `PanelPosition`  |
| `<node-toolbar>`, `NodeToolbarComponent`                                                     | `<v-node-toolbar>`, `VflowNodeToolbarComponent`                                         |
| `ConnectionControllerDirective`, `ChangesControllerDirective`, `NodeDragControllerDirective` | Remove the imports. Their outputs are outputs of `vflow`                                |

v2 CSS classes are removed. Style through data attributes:

| v2 class                                                        | v3 attribute                                         |
| --------------------------------------------------------------- | ---------------------------------------------------- |
| `.vflow-node`                                                   | `[data-v-node="<id>"]` on the node host              |
| `.vflow-drag-handle`                                            | `[data-v-drag-handle]`                               |
| `.selection-box`                                                | `[data-v-selection-box]`                             |
| `.reconnect-handle`                                             | `[data-v-reconnect-handle]`                          |
| `.interactive-edge`                                             | `[data-v-interactive-edge]`                          |
| `.default-handle`, `.magnet`, `.wrapper`, `.edge-label-wrapper` | No replacement. Style the application's own elements |

New entity attributes: `data-v-edge="<id>"`, `data-v-handle`, `data-v-handle-state`, `data-v-selected`,
`data-v-node-toolbar="top|right|bottom|left"`, `data-v-resize-control` with `data-v-resize-control-position`.
Private DOM structure (layers, wrappers, nesting) is not a public contract.

### Nodes

`Node` is one interface. The `type` discriminator is removed. A node with `component` renders that component;
any other node renders the `vNode` template. The library reads no node kind: keep a discriminator in `data`.

| v2                                                                                                                           | v3                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `type: 'html-template'`                                                                                                      | Remove the field                                                                          |
| `type: 'svg-template'`                                                                                                       | Remove the field; render HTML in `vNode`                                                  |
| `type: 'template-group'`                                                                                                     | Remove the field; keep `width` and `height`; mark the group in `data`                     |
| `type: 'default'`, `text`                                                                                                    | Remove both; render the text from `data` in `vNode`; `ariaLabel` sets the accessible name |
| `type: 'default-group'`, `color`, `resizable`                                                                                | Node with `width`, `height` and a group marker in `data`; `[vResizable]` in its branch    |
| `type: NodeComponent` or a lazy import function                                                                              | `component: NodeComponent` or the same function                                           |
| `DefaultNode`, `DefaultGroupNode`, `HtmlTemplateNode`, `SvgTemplateNode`, `TemplateGroupNode`, `ComponentNode`, `SharedNode` | `Node`                                                                                    |
| `isDefaultNode`, `isDefaultGroupNode`, `isTemplateNode`, `isSvgTemplateNode`, `isTemplateGroupNode`, `isComponentNode`       | Check `node.component` or the application's own `data`                                    |
| `preview` field, `NodePreview`                                                                                               | Remove                                                                                    |
| `NODE_DEFAULTS`                                                                                                              | Remove                                                                                    |
| `createNode(node, { useDefaults })`                                                                                          | `createNode(node)`; the factory always creates the signals                                |

Rules:

- **Size.** Nodes no longer default to 100 × 50. An axis without its `width` / `height` signal is content-sized
  (`auto`): the library measures it and writes no inline size. An axis with its signal is `explicit`. A resize
  gesture makes an axis `explicit`.
- **Size signals.** `width` / `height` hold only the size the application requests. The library never writes the
  measured size into them. Read the rendered size from `ctx.width()` / `ctx.height()` or `flow.getNodeRect(id)`.
  `NodeWithDefaults` has optional `width` and `height`: read them as `width?.()`.
- **Groups.** A group is any node with a size whose children reference it through `parentId`. Assistive
  technology reads it as a `group` while it has children.
- **Data type.** `Node`, `NodeWithDefaults`, `StaticNode` and `injectNode()` default the data type to `unknown`
  instead of `any`. Pass the type: `Node<MyData>[]`, `injectNode<MyData>()`.

Before:

{% raw %}

```ts
const nodes = createNodes([
  { id: 'group', type: 'template-group', point: { x: 0, y: 0 }, width: 300, height: 200 },
  { id: 'task', type: 'html-template', point: { x: 20, y: 20 }, parentId: 'group', data: { title: 'Task' } },
  { id: 'chart', type: ChartNodeComponent, point: { x: 400, y: 0 } },
]);
```

```html
<vflow [nodes]="nodes">
  <ng-template let-ctx nodeHtml><div class="card">{{ ctx.data().title }}</div></ng-template>
  <ng-template let-ctx groupNode>
    <svg:rect class="group" [attr.width]="ctx.width()" [attr.height]="ctx.height()" />
  </ng-template>
</vflow>
```

{% endraw %}

After:

{% raw %}

```ts
const nodes = createNodes([
  { id: 'group', point: { x: 0, y: 0 }, width: 300, height: 200, data: { type: 'group' } },
  { id: 'task', point: { x: 20, y: 20 }, parentId: 'group', data: { title: 'Task' } },
  { id: 'chart', component: ChartNodeComponent, point: { x: 400, y: 0 } },
]);
```

<!-- prettier-ignore -->
```html
<vflow [nodes]="nodes">
  <ng-template let-ctx vNode>
    @if (ctx.data()?.type === 'group') {
      <div class="group" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
    } @else {
      <div class="card">{{ ctx.data().title }}</div>
    }
  </ng-template>
</vflow>
```

{% endraw %}

### Component nodes

A component node is any standalone component. It reads its node through `injectNode()`, which returns the object a
`vNode` template receives as `ctx`.

| v2                                                     | v3                                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `extends CustomNodeComponent<T>`                       | A plain component with `ctx = injectNode<T>()`                                                     |
| `this.node()`                                          | `this.ctx.node`                                                                                    |
| `this.data()`, `this.selected()`, `this.preselected()` | `this.ctx.data()`, `this.ctx.selected()`, `this.ctx.preselected()`                                 |
| `ComponentNodeEvent<[A, B]>`                           | `AnyComponentNodeEvent`, narrowed with `isComponentNodeEvent(event, A)` to `ComponentNodeEvent<A>` |

Rules:

- `(componentNodeEvent)` collects every output of the component: `@Output()`, `output()` and
  `outputFromObservable()`. `eventName` is the output's property name.
- Edges can also be components: `component` on an edge, `injectEdge()` inside, outputs in `(componentEdgeEvent)`.

### Edges

| v2                                                                                             | v3                                                                                                   |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Edge `type: 'default'`, `type: 'template'`, `EdgeType`                                         | Remove. Every edge renders through the `vEdge` template or its `component`                           |
| `floating: true`                                                                               | `position="auto"` on the node's handle: the edge meets the side facing the other end                 |
| `edgeLabels`, `EdgeLabel`, `DefaultEdgeLabel`, `HtmlTemplateEdgeLabel`, `HtmlEdgeLabelContext` | A `vEdgeLabel` element in the edge presentation; label text in edge `data`                           |
| `ng-template[edgeLabelHtml]` with `ctx.label`                                                  | `vEdgeLabel` reading `ctx.data()` of the edge                                                        |
| `color`, `markerUnits` of `Marker`                                                             | Remove. Markers take the edge stroke (`context-stroke`); `strokeWidth` is in flow units, default `2` |
| `EDGE_DEFAULTS`                                                                                | Remove                                                                                               |
| `createEdge(edge, { useDefaults })`                                                            | `createEdge(edge)`                                                                                   |
| `EdgeSelectChange`                                                                             | `EdgeSelectedChange`                                                                                 |

Rules:

- The flow draws a transparent interaction stroke `interactionWidth` wide (default `20`). When the template's root
  is `<svg:g>`, the stroke is its first child, so `:hover` on the group sees it.
- A label element must be a sibling of the SVG root, not inside `svg:g`: Angular compiles HTML inside SVG in the
  SVG namespace and it does not render.
- The label position is `start`, `center` (default) or `end`, written as an expression: `'end'`.
- `createEdge()` no longer fills missing `sourceHandle` / `targetHandle` with `''`; they stay `undefined`.

Before:

{% raw %}

```ts
edges = createEdges([{ id: 'a-b', source: 'a', target: 'b', type: 'template', edgeLabels: { center: { type: 'html-template', data: { text: 'Approve' } } } }]);
```

```html
<ng-template let-ctx edge>
  <svg:g customTemplateEdge>
    <svg:path [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
  </svg:g>
</ng-template>
<ng-template let-ctx edgeLabelHtml>
  <span class="label">{{ ctx.label.data.text }}</span>
</ng-template>
```

{% endraw %}

After:

{% raw %}

```ts
edges = createEdges([{ id: 'a-b', source: 'a', target: 'b', data: { label: 'Approve' } }]);
```

<!-- prettier-ignore -->
```html
<ng-template let-ctx vEdge>
  <svg:g>
    <svg:path [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
  </svg:g>
  @if (ctx.data()?.label; as label) {
    <span *vEdgeLabel class="label">{{ label }}</span>
  }
</ng-template>
```

{% endraw %}

### Handles

A handle is an application element with the `vHandle` directive. The directive positions it on the node side.

| v2                                                    | v3                                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `<handle type="source" position="right" id="out" />`  | `<span vHandle handleType="source" position="right" handleId="out"></span>`        |
| `[template]` / `ng-template[handle]`, `HandleContext` | Content and CSS of the `vHandle` element                                           |
| `ctx.state()` of the handle template                  | `[data-v-handle-state]` attribute, or the `state` signal of `VflowHandleDirective` |
| `ctx.point()` of the handle template                  | Remove. Placement belongs to the directive                                         |
| `offsetX`, `offsetY`                                  | Same inputs with the opposite sign: positive moves right and down                  |

{% raw %}

```css
.port {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.port[data-v-handle-state='valid'] {
  background: green;
}
```

{% endraw %}

### Connections

| v2                                                                | v3                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `mode: 'loose'` of `ConnectionSettings`, `ConnectionMode`         | `handleType="any"` on handles that connect in either direction                              |
| `type` of `ConnectionSettings`                                    | Remove. The preview uses `ng-template[vConnection]` when declared                           |
| `marker` of `ConnectionSettings`                                  | `markerEnd`                                                                                 |
| `ctx.marker()` in the connection template                         | `ctx.markerEnd()`                                                                           |
| Validator argument `source`, `target`                             | `source.node.id`, `target.node.id`                                                          |
| Validator argument `sourceHandle`, `targetHandle`                 | `source.handle.id`, `target.handle.id`                                                      |
| Validator argument `sourceHandleType`, `targetHandleType`         | `source.handle.type`, `target.handle.type`                                                  |
| `oldEdge` of `ReconnectEvent`                                     | `edge` of `ReconnectEvent`                                                                  |
| `sourceHandleType`, `targetHandleType` in the `(connect)` payload | Removed. `(connect)` emits `Connection`: `source`, `target`, `sourceHandle`, `targetHandle` |

```ts
// v2
validator: (c) => typeOf(c.source) === typeOf(c.target),
// v3
validator: ({ source, target }) => source.node.data().type === target.node.data().type,
```

Rules:

- The connection gesture is always active. v2 enabled it only when `<vflow>` bound a connection output. To keep a
  handle inert, set `[canStart]="false"` and `[canAccept]="false"` on it.
- The validator also runs when an edge end is dragged to another handle; it then receives the edge as
  `reconnectedEdge`.
- A connection that duplicates an existing edge is rejected unless `allowDuplicateConnections` of `ConnectionSettings`
  is `true`.
- `ConnectEndEvent` / `ReconnectEndEvent`: `to` is `{ node, handle }` and `valid` is a boolean when the pointer is
  released on a handle; both are `null` otherwise. A release on the origin handle is a drop.
- `ConnectionSettings`, `ConnectionForValidation` and `ConnectionValidatorFn` take the node and edge types:
  `ConnectionSettings<NodeWithDefaults<MyData>>`.

### `vflow` inputs

Every input is a signal input. Template bindings are unchanged.

| v2                                                                     | v3                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `[view]="[400, 400]"`, `[view]="'auto'"`                               | Remove. Size the `vflow` element with CSS; it fills its parent by default |
| `[optimization]="{ virtualization }"`                                  | `[virtualization]` (default `false`)                                      |
| `[optimization]="{ lazyLoadTrigger }"`                                 | `lazyLoadTrigger` (default `'immediate'`)                                 |
| `[optimization]="{ detachedGroupsLayer }"`                             | `[parentsBelowEdges]`                                                     |
| `[optimization]="{ virtualizationZoomThreshold }"`                     | Remove                                                                    |
| `Optimization`, `DEFAULT_OPTIMIZATION`                                 | Remove                                                                    |
| `[selectionBox]="{ mode }"`, `SelectionBoxSettings`                    | `selectionBoxMode` (default `'full'`)                                     |
| `[selectionBox]="{ color }"`                                           | `--v-selection-box` CSS token                                             |
| `[entitiesSelectable]`                                                 | `[nodesSelectable]` and `[edgesSelectable]`                               |
| `[keyboardShortcuts]`                                                  | `provideVflow(withShortcuts(...))`, see [Keyboard](#keyboard)             |
| `[background]="'#fff'"`, `{ type: 'solid', color }`, `ColorBackground` | `--v-background` CSS token                                                |
| `color`, `backgroundColor` of a dots or grid background                | `--v-background-pattern`, `--v-background`                                |
| `size` of a grid background                                            | `gap`                                                                     |
| `alignmentHelper` `lineColor`                                          | `--v-alignment-guides` CSS token                                          |

Rules:

- `flow.minZoom` → `flow.minZoom()`. The read returns the bound value or `undefined`. The value in effect is
  `flow.settings.minZoom()`.
- Assigning `flow.minZoom = 2` no longer works. Bind the input to a signal, or call
  `componentRef.setInput('minZoom', 2)`.
- `[connection]` merges the passed keys over the defaults on every binding: a key left out returns to its default.
- `[autoPan]` follows later changes of its binding.
- `alignmentHelper.tolerance` is in screen pixels (same as before at zoom 1). The helper snaps during the drag, not
  after release, and also snaps to equal gaps. Holding `Alt` bypasses it.
- Settings, shortcuts, accessibility labels and component registries can be provided once for many flows with
  `provideVflow()`. See [Configuration](/docs/getting-started/configuration).

### Keyboard

v2 had two held modifiers. v3 has held modifiers and commands, provided through `provideVflow(withShortcuts(...))`.

| v2                                                   | v3                                                       |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `[keyboardShortcuts]="{ selection: ['ShiftLeft'] }"` | `withShortcuts({ modifiers: { selection: ['Shift'] } })` |
| `{ multiSelection: ['MetaLeft'] }`                   | `{ modifiers: { multiSelection: ['Mod'] } }`             |
| `null` to disable an entry                           | `[]`                                                     |
| `KeyboardAction`                                     | `KeyboardModifierName`, `KeyboardCommandName`            |

Rules:

- A binding is `[Modifier+]*Key`. `Key` matches the event `code` (`ShiftLeft`) or the event `key` (`x`).
  `Mod` is Meta on macOS and Control elsewhere.
- Control, Meta and Alt must match exactly. Shift is checked only when the binding names it.
- New default commands act on the focused flow: `Enter` / `Space` select, `Escape` clears the selection, arrows
  move focused nodes or pan, `+` / `-` zoom, `0` fits the view, `Delete` / `Backspace` emit `(deleteRequest)`.
  The library deletes nothing: handle `(deleteRequest)` to remove elements. Disable a command with
  `withShortcuts({ commands: { delete: [] } })`.

### Flow methods and outputs

| v2                                                                   | v3                                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `viewportTo(state)`                                                  | `setViewport(state)`                                                               |
| `panTo({ x, y })`                                                    | `setViewport({ ...flow.viewport(), x, y })`, or `setCenter(point)`                 |
| `documentPointToFlowPoint(point)`                                    | `clientToFlowPosition(point)`; inverse: `flowToClientPosition(point)`              |
| `documentPointToFlowPoint(point, { spaces: true })`, `SpacePoint`    | `getNodesAtPoint(clientToFlowPosition(point))`                                     |
| `toNodeSpace(nodeId, spaceNodeId)`                                   | Subtract `flow.getNodeRect(id)`: `{ x: p.x - rect.x, y: p.y - rect.y }`            |
| `getIntesectingNodes<T>(id, options)`                                | `getIntersectingNodes(id, options)`                                                |
| `getNode(id)`                                                        | `nodes.find((node) => node.id === id)` on the application's array                  |
| `getDetachedEdges()`                                                 | `flow.detachedEdges()`                                                             |
| `initialized` signal, `initialized$`                                 | `(initialized)` output                                                             |
| `nodesChange$`, `edgesChange$`, `nodesChange`, `edgesChange` signals | `flow.nodesChanges` / `flow.edgesChanges` outputs; `outputToObservable()` for RxJS |
| `connection` getter                                                  | Remove                                                                             |
| `NodeDragStartEvent`, `NodeDragEndEvent`                             | `NodeDragEvent` for all three drag outputs                                         |

Rules:

- `setViewport`, `setCenter`, `fitView`, `zoomTo`, `zoomIn`, `zoomOut` accept `{ duration }` and return
  `Promise<boolean>`: `true` when the target is reached, `false` when nothing changed or another call or a gesture
  interrupted it. Consecutive calls compose.
- `FitViewOptions` has `minZoom` and `maxZoom` for one call.
- `(initialized)` is emitted once, after the first layout, including for an empty graph. A late subscriber does not
  receive it. Replace `effect(() => flow.initialized() && flow.fitView())` with `(initialized)="flow.fitView()"`.
- `(viewportChangeEnd)` is new: it emits when a gesture or a programmatic change ends.
- `VflowComponent<N, E>` is generic. `$event` of drag and connection outputs, `getNodesAtPoint()`,
  `getIntersectingNodes()` and `detachedEdges()` carry the application's node and edge types. In code:
  `viewChild.required<VflowComponent<MyNode>>(VflowComponent)`. In a template, the `of`
  option types `ctx`: `let ctx; of: nodes`.
- `NodeDragEvent` carries `node`, `nodes` (every node the gesture moves) and `sourceEvent`.

### Change events

| v2                                                                                           | v3                                                   |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `NodeAddChange`, `NodeRemoveChange`, `EdgeAddChange`, `EdgeRemoveChange`                     | Remove. React where the application edits its arrays |
| `(nodesChanges.add)`, `(nodesChanges.remove)`, `(edgesChanges.add)`, `(edgesChanges.remove)` | Remove                                               |
| `EdgeSelectChange`                                                                           | `EdgeSelectedChange`                                 |

Rules:

- `NodeChange` is `position | size | select`. `EdgeChange` is `detached | select`.
- All changes of one tick arrive in one array. v2 emitted one array per node during a multi-node drag. A handler
  that reads only `changes[0]` must iterate the array.
- `NodeSizeChange` carries `mode: { width, height }`, each `'auto' | 'explicit'`. Persist only `explicit` axes;
  writing back an `auto` axis freezes the node at its measured size.

### Selection

- A click on a node presentation selects the node. `[selectable]` is removed. Add `vNoSelect` to an embedded
  control to keep its clicks from selecting. A press that becomes a drag, resize, pan or selection box does not
  select.
- The `selectable` field of `Node` and `Edge`, `[nodesSelectable]` and `[edgesSelectable]` decide whether an entity can
  be selected.
- The host of a selected or preselected entity has `data-v-selected`. `ctx.preselected()` tells them apart.
- `elevateNodesOnSelect` and `elevateEdgesOnSelect` raise an entity when it becomes selected by any means.

{% raw %}

```html
<div *vNode="let ctx" class="card">
  {{ ctx.data().title }}
  <button vNoSelect (click)="open(ctx.node)">Open</button>
</div>
```

{% endraw %}

### Resizer

- Put `[vResizable]` on an HTML element, the root element of the node template. SVG elements are not supported.
- `resizerColor` → `--v-resize-control` and `--v-resize-control-border` CSS tokens.
- The `[vResizable]` element is the sizing box: the library sets its `width` / `height` inline for each explicit
  axis, with `box-sizing: border-box`. Remove size bindings from that element.

### Minimap

- `<mini-map>` → `<v-minimap>`. `position` → `vPanel="bottom-right"` (or another `PanelPosition`) on the element.
- `maskColor` → `--v-minimap-mask` (full color including alpha). `strokeColor` → `--v-minimap-viewport`.
- `scaleOnHover` → remove.
- The element is the minimap box: it has no frame and defaults to `clamp(120px, 20%, 240px)` wide at 4:3. Add
  border, radius and size in CSS.
- Nodes are filled with `--v-minimap-node`. Per-node styles: `withMinimap()`, see
  [Minimap](/docs/viewport/minimap#style-the-nodes). Selection is not shown.

### Node toolbar

- `<node-toolbar>` → `<v-node-toolbar>`. The element is rendered inside the node, not in a separate layer above the
  graph. A node presentation with `overflow: hidden` clips it.
- The element carries `data-v-node-toolbar="<side>"` and is centered with the `translate` property; `transform`
  stays free.

### Virtualization

- Off-screen views are hidden with `display: none`; component instances are kept. Canvas previews and hiding all
  edges at low zoom are removed, with `virtualizationZoomThreshold`, `NodePreview` and the `preview` field of `Node`.
- With virtualization on, every node is loaded and measured once even off-screen, overriding
  `lazyLoadTrigger: 'viewport'`.

### Gestures

- Pan, zoom, drag, resize, connection and selection box use Pointer Events. Tests that dispatch mouse or touch
  events must dispatch `pointerdown`, `pointermove`, `pointerup` with `pointerId` and `pointerType`. Wheel and
  `dblclick` are unchanged.
- A press that starts a library gesture does not propagate to ancestors (`pointerdown`, `mousedown`, `touchstart`).
- A node drag starts after 3 px of movement (`nodeDragThreshold`, default `3`). Set `[nodeDragThreshold]="0"` for
  v2 behavior.
- During a pan the pane captures the pointer; nodes under the cursor receive no hover events.
- The pane and draggable nodes set CSS `touch-action`. See [Viewport gestures](/docs/viewport/viewport-gestures).
- Exclude an element from library gestures with `vNoDrag`, `vNoPan`, `vNoWheel`, `vNoKeyboard`.

### Styling and DOM

- Colors are CSS tokens with built-in defaults, set on `vflow` or an ancestor: `--v-background`,
  `--v-background-pattern`, `--v-selection-box`, `--v-resize-control`, `--v-resize-control-border`,
  `--v-alignment-guides`, `--v-connection`, `--v-focus`, `--v-focus-halo`, `--v-focus-radius`, `--v-minimap-*`.
- Node templates render as HTML in a CSS-transformed viewport. Edges and the connection preview are SVG.
- `vflow` is a stacking context. Set `z-index` on it or its container to order it against page elements.
- The flow no longer sets `box-sizing: border-box` on every descendant. Set it in application CSS if templates
  relied on it.
- Under `forced-colors: active`, core maps its tokens to system colors.

### Accessibility

New defaults, no v2 equivalent:

- Nodes and edges are focusable and have a role and a name (`ariaLabel` on the node or edge).
- Keyboard commands report their outcome in a live region of the flow.
- Labels are configured with `provideVflow(withAccessibility(labels))`.

See [Accessibility](/docs/interactions/accessibility).

### Testing

- `ngx-vflow/testing` is removed: `VflowMocks`, every mock component and directive, `provideCustomNodeMocks()`.
- Tests render the real `Vflow` in jsdom or happy-dom. Remove `overrideComponent()` calls that swapped in mocks.
  Render a component node in a flow of one node.
- Without layout (jsdom, happy-dom) nothing is measured: `(initialized)` is not emitted and `fitView()` resolves
  to `false`. Test geometry in a real browser.

## Migration from v1 to v2

| v1                                                                                      | v2                                                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `DynamicNode`                                                                           | `Node` with signal fields; create with `createNode(s)()` |
| Plain `Edge` objects                                                                    | `Edge` with signal fields; create with `createEdge(s)()` |
| `(onConnect)`                                                                           | `(connect)`                                              |
| `(onNodesChange)`                                                                       | `(nodesChanges)`                                         |
| `(onComponentNodeEvent)`                                                                | `(componentNodeEvent)`                                   |
| `(onNodesChange.<type>.single)`, `(onNodesChange.<type>.many)` and the edge equivalents | Remove; filter in the handler                            |
| `CustomDynamicNodeComponent`                                                            | `CustomNodeComponent`                                    |
| `isStaticNode`, `isDynamicNode`                                                         | Remove                                                   |
| `isComponentStaticNode`, `isComponentDynamicNode`                                       | `isComponentNode`                                        |
| `isTemplateStaticNode`, `isTemplateDynamicNode`                                         | `isTemplateNode`                                         |
| `isSvgTemplateStaticNode`, `isSvgTemplateDynamicNode`                                   | `isSvgTemplateNode`                                      |
| `isTemplateStaticGroupNode`, `isTemplateDynamicGroupNode`                               | `isTemplateGroupNode`                                    |

## Migration from v0 to v1

| v0                                      | v1                                                                    |
| --------------------------------------- | --------------------------------------------------------------------- |
| `VflowModule`                           | `Vflow` in `imports`; spread it in an NgModule: `imports: [...Vflow]` |
| `computeLayersOnInit` of `Optimization` | Remove                                                                |
| `[handlePositions]`                     | Remove                                                                |
| `this.node` in `CustomNodeComponent`    | `this.node()`                                                         |
