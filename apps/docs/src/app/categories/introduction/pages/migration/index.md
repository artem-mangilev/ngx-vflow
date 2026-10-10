## Migration to >= v3.0

Angular 20 is now the minimum supported version. Upgrade Angular before installing ngx-vflow v3.

### Headless core: default presentations removed

Core no longer ships ready-made node, group, edge or label presentations. It keeps geometry, hit targets,
accessibility, focus, selection feedback, the connection preview, basic handles and resize controls. Every
graph needs templates. There are two working paths:

**Path A: your own templates on the headless core**

{% raw %}

<!-- prettier-ignore -->
```html
<vflow [nodes]="nodes" [edges]="edges">
  <ng-template let-ctx vNode>
    @if (ctx.data().type === 'group') {
      <div class="frame" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
    } @else {
      <div class="card">
        {{ ctx.data().title }}
        <span vHandle handleType="target" position="left" class="dot"></span>
        <span vHandle handleType="source" position="right" class="dot"></span>
      </div>
    }
  </ng-template>
  <ng-template let-ctx vEdge>
    <svg:g vEdgeInteraction>
      <svg:path class="line" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
    </svg:g>
    <span *vEdgeLabel>{{ ctx.data().label }}</span>
  </ng-template>
</vflow>
```

{% endraw %}

**Path B: presentations from `@vflow/ui`**

{% raw %}

```html
<section vuiTheme="light">
  <vflow [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx vNode>
      <article vuiNode [vuiSelected]="ctx.selected() || ctx.preselected()">
        <header vuiNodeHeader><span vuiTitle>{{ ctx.data().title }}</span></header>
        <span vuiPort handleType="target" position="left"></span>
        <span vuiPort handleType="source" position="right"></span>
      </article>
    </ng-template>
    <ng-template let-ctx vEdge>
      <svg:g vEdgeInteraction>
        <svg:path vuiEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" [vuiSelected]="ctx.selected()" />
      </svg:g>
      <span *vEdgeLabel vuiEdgeLabel>{{ ctx.data().label }}</span>
    </ng-template>
  </vflow>
</section>
```

{% endraw %}

Include `@vflow/ui/styles.css` in your global styles for path B. See the Design system section for the parts.

| Removed                                                                  | Replacement                                                                                                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node `type: 'default'`, `text`                                           | A node without `type`, with `data` and a `vNode` template; standard handles become `[vHandle]` elements in the template. Use `ariaLabel` for the accessible name               |
| Node `type: 'default-group'`, `color`, `resizable`                       | A node with `width`, `height` and a group marker in `data`, drawn by a branch of the `vNode` template; put `vResizable` on the template's element                              |
| `DefaultNode`, `DefaultGroupNode`, `isDefaultNode`, `isDefaultGroupNode` | `Node`; the application tells its node kinds apart by `data`                                                                                                                   |
| Edge `type` (`'default'` / `'template'`)                                 | Removed; every edge renders through the `vEdge` template or its `component`                                                                                                    |
| `EdgeLabel` `type: 'default'`, `text`, `style`                           | A label declared inside the edge presentation with the `vEdgeLabel` directive; see Edge labels below                                                                           |
| `color` and `markerUnits` fields of `Marker`                             | Markers follow the edge stroke (`context-stroke`); `strokeWidth` is now in flow units (default `2`), whatever the marker size                                                  |
| Connection `type: 'default'` preview                                     | Unchanged: the default connection line and the `vConnection` template both remain                                                                                              |
| `mode: 'loose'` in `ConnectionSettings`                                  | `handleType="any"` on the handles that connect in either direction; `loose` no longer exists and handle ids are not required                                                   |
| `type` in `ConnectionSettings`                                           | Removed: the preview renders `ng-template[vConnection]` when it is declared, the default line otherwise                                                                        |
| `floating` in `Edge`                                                     | `position="auto"` on a handle of the node: the edge meets the node on the side facing the other end                                                                            |
| `id` input of the handle                                                 | `handleId`; a static `id` attribute used to become the DOM id of the element                                                                                                   |
| `<handle>`, `[template]`, `ng-template[handle]`, `HandleContext`         | `[vHandle]` on your own element; state via the `data-v-handle-state` attribute and its siblings or the directive's signals; `vuiPort` from `@vflow/ui` for the old default dot |

### Appearance inputs removed

Colors are CSS. Core reads the tokens `--v-background`, `--v-surface`, `--v-foreground`,
`--v-muted`, `--v-border`, `--v-selection` and `--v-focus`, each with a built-in default.
The focus ring geometry is `--v-focus-width`, `--v-focus-offset` and `--v-focus-radius`.
Set them on the `vflow` element or any ancestor; a `vuiTheme` scope from `@vflow/ui` maps its theme onto them.
Under `forced-colors: active` core maps its tokens to system colors and keeps the feedback parts visible.

| Removed input                                        | Replacement                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `[background]="'#fff'"` / `{ type: 'solid', color }` | `--v-background` token; `[background]` now takes only `dots`, `grid` or `image` patterns |
| Dots/grid `color`, `backgroundColor`                 | `--v-muted` and `--v-background`; the `.v-background-pattern` class                      |
| `resizerColor`, resize control `color`               | `--v-selection`, `--v-surface`; `.v-resize-control--handle` / `.v-resize-control--line`  |
| `mini-map` `maskColor`, `strokeColor`                | `--v-muted` (mask) and `--v-border` (frame); the minimap samples the resolved tokens     |
| `lineColor` in `alignmentHelper` settings            | `--v-foreground`; `.v-alignment-guides`. `tolerance` stays                               |
| `color` in `selectionBox` settings                   | `--v-selection`; `.v-selection-box`. `mode` stays                                        |

Behavior parameters are untouched: node points, sizes, `extent`, resize constraints, drag thresholds,
snap grid, zoom limits, curves and connection validation keep their APIs. Handle `offsetX` and `offsetY` keep their
names, but a positive value now moves the handle right and down; version 2 moved it the other way.

Version 3 renders node-facing templates as native HTML in a CSS-transformed viewport. Edges and connection overlays still use SVG. SVG content passed to the node template or to `[vResizable]` is no longer supported. The library does not inspect template roots or provide a compatibility fallback, so these templates must be rewritten explicitly.

### Selector and class prefixes

Core selectors, CSS classes, CSS tokens and data attributes use the `v` prefix and `@vflow/ui` the `vui` prefix,
so short names such as `selectable` or `resizable` no longer collide with other libraries. The `vflow` element keeps
its name. Public core classes are `Vflow*Directive` / `Vflow*Component`; `@vflow/ui` classes and types are `Vui*`.
Old names have no aliases.

| Before                                                                                                                                                                                                                             | After                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ng-template[node]`, `NodeTemplateDirective`                                                                                                                                                                                       | `ng-template[vNode]`, `VflowNodeTemplateDirective`                                                                                                                                                                                                          |
| `ng-template[edge]`, `EdgeTemplateDirective`                                                                                                                                                                                       | `ng-template[vEdge]`, `VflowEdgeTemplateDirective`                                                                                                                                                                                                          |
| `ng-template[connection]`, `ConnectionTemplateDirective`                                                                                                                                                                           | `ng-template[vConnection]`, `VflowConnectionTemplateDirective`                                                                                                                                                                                              |
| `ng-template[marker]`, `MarkerTemplateDirective`                                                                                                                                                                                   | `ng-template[vMarker]`, `VflowMarkerTemplateDirective`                                                                                                                                                                                                      |
| `edgeLabel` (structural and long form), `edgeLabelOrient`, `EdgeLabelTemplateDirective`                                                                                                                                            | `vEdgeLabel`, `vEdgeLabelOrient`, `VflowEdgeLabelTemplateDirective`                                                                                                                                                                                         |
| `[vflowHandle]`, `#h="vflowHandle"`                                                                                                                                                                                                | `[vHandle]`, `#h="vHandle"`; the class stays `VflowHandleDirective`                                                                                                                                                                                         |
| `[vflowNoDrag]`, `[vflowNoPan]`, `[vflowNoWheel]`, `[vflowNoKeyboard]`, `NoDragDirective` …                                                                                                                                        | `[vNoDrag]`, `[vNoPan]`, `[vNoWheel]`, `[vNoKeyboard]`, `VflowNoDragDirective` …                                                                                                                                                                            |
| `[dragHandle]`, `DragHandleDirective`                                                                                                                                                                                              | `[vDragHandle]`, `VflowDragHandleDirective`                                                                                                                                                                                                                 |
| `g[edgeInteraction]`, `EdgeInteractionDirective`                                                                                                                                                                                   | `g[vEdgeInteraction]`, `VflowEdgeInteractionDirective`                                                                                                                                                                                                      |
| `[resizable]`, `ResizableComponent`                                                                                                                                                                                                | `[vResizable]`, `VflowResizableComponent`                                                                                                                                                                                                                   |
| `<mini-map>`, `MiniMapComponent`, `MiniMapPosition`                                                                                                                                                                                | `<v-minimap>`, `VflowMinimapComponent`, `MinimapPosition`                                                                                                                                                                                                   |
| `<node-toolbar>`, `NodeToolbarComponent`                                                                                                                                                                                           | `<v-node-toolbar>`, `VflowNodeToolbarComponent`                                                                                                                                                                                                             |
| `@vflow/ui`: `[vflowNode]`, `<vflow-controls>`, `VflowNode`, `VflowUi`, `VflowBpmn` …                                                                                                                                              | `[vuiNode]`, `<vui-controls>`, `VuiNode`, `Vui`, `VuiBpmn` …                                                                                                                                                                                                |
| `.vflow-*` classes, for example `.vflow-node`, `.vflow-handle`, `.vflow-root`                                                                                                                                                      | `.v-*`, for example `.v-node`, `.v-handle`, `.v-root`                                                                                                                                                                                                       |
| `--vflow-*` tokens, for example `--vflow-background`, `--vflow-focus`                                                                                                                                                              | `--v-*`, for example `--v-background`, `--v-focus`                                                                                                                                                                                                          |
| `data-vflow-*` attributes, for example `data-vflow-handle-state`, `data-vflow-no-drag`                                                                                                                                             | `data-v-*`, for example `data-v-handle-state`, `data-v-no-drag`                                                                                                                                                                                             |
| Unprefixed classes `.resize-control` (with `.handle`, `.line`, `.top`, `.right`, `.bottom`, `.left`), `.selection-box`, `.reconnect-handle`, `.interactive-edge`, `.focus-indicator`, `.edge-label-wrapper`, `.wrapper`, `.magnet` | `.v-resize-control` (with `.v-resize-control--handle`, `--line`, `--top`, `--right`, `--bottom`, `--left`), `.v-selection-box`, `.v-reconnect-handle`, `.v-interactive-edge`, `.v-focus-indicator`, `.v-edge-label-wrapper`, `.v-node-wrapper`, `.v-magnet` |
| `@vflow/ui` attributes `data-tone`, `data-busy`, `data-state`, `data-connected`, `data-event`, `data-gateway`, `data-flow`                                                                                                         | `data-vui-tone`, `data-vui-busy`, `data-vui-state`, `data-vui-connected`, `data-vui-event`, `data-vui-gateway`, `data-vui-flow`                                                                                                                             |

`ng-template[vMarker]` takes the marker type as its value, `<ng-template vMarker="diamond" inset="8">`, and
the structural `vEdgeLabel` keeps its microsyntax, with `'end'; orient: 'path'` as the value.

### Reparenting identity

The optional `parentId` field may still be omitted from `Node` and `StaticNode`. The `NodeWithDefaults` values returned by ordinary `createNode()` and `createNodes()` calls always contain a `parentId` signal initialized to `null` when no parent is supplied.

`reparentNodes()` now updates the existing `point` and `parentId` signals, preserving the node object reference. If an optional `parentId` signal is absent, it is added to that same object. A successful call returns a new array containing the same node objects; a full no-op returns the original array.

### One node model

`Node` is one interface instead of a union discriminated by `type`. The `type` field is gone: a node with `component` renders that component, any other node renders the `node` template. `createNode()` and `createNodes()` no longer accept `type`.

| Removed                                                                     | Replacement                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `type: 'html-template'`                                                     | Remove the field                                                                                  |
| `type: 'template-group'`                                                    | Remove the field, keep `width` and `height`; mark the group in `data` if its presentation differs |
| `type: YourNodeComponent` or a lazy import function                         | `component: YourNodeComponent` or the same function                                               |
| `HtmlTemplateNode`, `TemplateGroupNode`, `ComponentNode`                    | `Node`                                                                                            |
| `isTemplateNode`, `isTemplateGroupNode`                                     | Check `component` or your own `data`                                                              |
| `<ng-template nodeHtml>`, `NodeHtmlTemplateDirective`                       | `<ng-template vNode>`, `VflowNodeTemplateDirective`                                               |
| `<ng-template groupNode>`, `GroupNodeTemplateDirective`, `GroupNodeContext` | A branch of the `vNode` template; every node context has `width` and `height`                     |

The library does not read a node kind. Keep your own discriminator in `data` and branch on it in the template. A group is any node with a size and children that reference it through `parentId`; assistive technology reads it as a `group` while it has children.

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
    <div class="group-node" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
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
      <div class="group-node" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
    } @else {
      <div class="card">{{ ctx.data().title }}</div>
    }
  </ng-template>
</vflow>
```

{% endraw %}

SVG group content from version 2 becomes a native HTML element in that branch:

```css
.group-node {
  box-sizing: border-box;
  border: 1px solid red;
  background: transparent;
}
```

### Component nodes

A component node no longer extends a base class. Any standalone component works, and it reads its node through `injectNode()`, which returns the same object a `node` template receives as `let-ctx`. The `node` input is no longer set on the component.

| Removed                                                 | Replacement                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `CustomNodeComponent`, `extends CustomNodeComponent<T>` | A plain component with `injectNode<T>()`                                              |
| `this.node()` input                                     | `injectNode()`; the node object is its `node` field, the data signal its `data` field |
| Fields on the base class (`selected`, `preselected`, …) | The same signals on the object returned by `injectNode()`                             |

Before:

{% raw %}

```ts
@Component({ template: `<div>{{ data()?.title }}</div>` })
export class TaskNodeComponent extends CustomNodeComponent<TaskData> {
  readonly done = output<string>();
}
```

{% endraw %}

After:

{% raw %}

```ts
@Component({ template: `<div [class.selected]="ctx.selected()">{{ ctx.data().title }}</div>` })
export class TaskNodeComponent {
  protected readonly ctx = injectNode<TaskData>();
  readonly done = output<string>();
}
```

{% endraw %}

`(componentNodeEvent)` stays. It now collects every declared output of the component, including `@Output()`, `output()` and `outputFromObservable()`, and `eventName` is the property name of the output. `ComponentNodeEvent<[A, B]>` infers events from those outputs.

### Selection by click

A click on a node presentation selects the node; the `[selectable]` directive and `SelectableDirective` are removed. Edges already worked this way. A press that becomes a drag, a resize, a pan or a selection box does not select. Mark an embedded control with `vNoSelect` to keep its clicks from selecting the entity, as `vNoDrag` keeps them from dragging. `Node.selectable`, `Edge.selectable`, `[nodesSelectable]` and `[edgesSelectable]` still decide whether an entity may be selected at all.

`elevateNodesOnSelect` and `elevateEdgesOnSelect` now raise an entity when it becomes selected, from a click, the keyboard, the selection box or the application. Before, a node was raised by any click on it and an edge by any press on it.

{% raw %}

Before:

```html
<ng-template let-ctx node>
  <div class="card" selectable>{{ ctx.node.data.title }}</div>
</ng-template>
```

After:

```html
<ng-template let-ctx vNode>
  <div class="card">
    {{ ctx.data().title }}
    <button vNoSelect (click)="open(ctx.node)">Open</button>
  </div>
</ng-template>
```

{% endraw %}

### Edge presentations

The `customTemplateEdge` selector and `CustomTemplateEdgeComponent` are removed. The flow draws a transparent interaction stroke of `interactionWidth` (20 by default) in the edge host, so a click near the line selects the edge. Wrap the path in `<svg:g vEdgeInteraction>` to move the stroke into the group as its first child, where the group's CSS `:hover` and listeners see it.

Before:

```html
<ng-template let-ctx edge>
  <svg:g customTemplateEdge>
    <svg:path [attr.d]="ctx.path()" />
  </svg:g>
</ng-template>
```

After:

```html
<ng-template let-ctx vEdge>
  <svg:g vEdgeInteraction>
    <svg:path [attr.d]="ctx.path()" />
  </svg:g>
</ng-template>
```

An edge can now be drawn by a component instead of the template: set `component` on the edge. The flow creates the component on an SVG group inside the edge, reads the edge through `injectEdge()`, and forwards its outputs to the new `(componentEdgeEvent)` output of `vflow`, typed with `ComponentEdgeEvent<[A, B]>`. Add `VflowEdgeInteractionDirective` to the component's `hostDirectives` to move the interaction stroke into the component host.

### Edge labels

Labels are no longer edge data rendered by one global template. The `edgeLabels` field of `Edge`, the `EdgeLabel` and `HtmlTemplateEdgeLabel` types, `<ng-template edgeLabelHtml>`, `EdgeLabelHtmlTemplateDirective` and `HtmlEdgeLabelContext` are removed. Declare labels inside the edge presentation with the `vEdgeLabel` directive and keep their text in edge `data`. `EdgeLabelPosition` stays.

Before:

{% raw %}

```ts
const edges = createEdges([{ id: '1 -> 2', source: '1', target: '2', edgeLabels: { center: { type: 'html-template', data: { text: 'Approve' } } } }]);
```

```html
<vflow [nodes]="nodes" [edges]="edges">
  <ng-template let-ctx edgeLabelHtml>
    <span class="label">{{ ctx.label.data.text }}</span>
  </ng-template>
</vflow>
```

{% endraw %}

After:

{% raw %}

```ts
const edges = createEdges([{ id: '1 -> 2', source: '1', target: '2', data: { label: 'Approve' } }]);
```

<!-- prettier-ignore -->
```html
<vflow [nodes]="nodes" [edges]="edges">
  <ng-template let-ctx vEdge>
    <svg:g vEdgeInteraction>
      <svg:path [attr.d]="ctx.path()" />
    </svg:g>
    @if (ctx.data()?.label; as label) {
      <span *vEdgeLabel class="label">{{ label }}</span>
    }
  </ng-template>
</vflow>
```

{% endraw %}

Place a label next to the SVG elements of the edge, not inside `svg:g`: Angular compiles HTML inside SVG in the SVG namespace and such a label does not render. The label value picks `start`, `center` (default) or `end` and is an expression, so write it with quotes. See the Edge labels page.

### Testing mocks

The `ngx-vflow/testing` entry point is removed, with `VflowMocks`, every mock component and directive, and `provideCustomNodeMocks()`. `vflow` renders in jsdom and happy-dom, so tests use the real `Vflow`:

- Remove the `overrideComponent()` call that swapped `Vflow` for `VflowMocks`. `viewChild(VflowComponent)` works in tests again.
- Instead of `provideCustomNodeMocks()`, render the component node in a flow of one node.

A DOM without layout measures nothing: `initialized()` stays `false` and `fitView()` resolves to `false` there. Tests of geometry run in a browser, `ng test --browsers=chromiumHeadless`. See the Unit testing page.

### Custom handle templates

Custom handles are now your own native HTML elements with the `vHandle` directive, which positions them on the node side. The former SVG placement coordinate `ctx.point` and the handle template context have been removed; the validation state is exposed as the `data-v-handle-state` attribute and as the `state` signal of `VflowHandleDirective`. The handle type is the `handleType` input (`handleType="target"`),
not `type`, so it never reaches the native `type` attribute of the element. See the Custom handles page.

Before:

```html
<ng-template #handleTemplate let-ctx>
  <svg:circle r="6" [attr.cx]="ctx.point().x" [attr.cy]="ctx.point().y" [class.handle_valid]="ctx.state() === 'valid'" />
</ng-template>
```

After:

```html
<span vHandle handleType="source" position="right" class="port"></span>
```

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

Do not calculate a replacement coordinate in the template: placement belongs to the directive.

### Resizable templates

Apply `[vResizable]` (formerly `[resizable]`) to a native HTML element instead of an SVG shape. Its sizing inputs are unchanged.

Before:

```html
<ng-template let-ctx groupNode>
  <svg:rect [resizable]="ctx.selected()" [attr.width]="ctx.width()" [attr.height]="ctx.height()" />
</ng-template>
```

After:

```html
<ng-template let-ctx vNode>
  <div [vResizable]="ctx.selected()"></div>
</ng-template>
```

The `[vResizable]` element is now the node's sizing box: for each explicitly sized axis the library sets its `width` or `height` inline, with `box-sizing: border-box`, so size bindings on that element are no longer needed. The node wrapper no longer receives an inline size when a `[vResizable]` element exists, so put the directive on the top-level element of the node template. Content-sized nodes stay unsized until the first resize, as described in Node size modes above.

### Node size modes

`createNodes` / `createNode` no longer give nodes a default `width` / `height` of 100 x 50. Each axis has its own mode. An axis without its signal in the node data is content-sized (`auto`): the library measures it and writes no inline size. An axis is explicitly sized (`explicit`) when the data carries its signal, or after a resize gesture changes it; a node with only `width` has a fixed width and a content-sized height. `NodeWithDefaults` reflects this: `width` and `height` are optional, so read them with optional chaining, for example `width?.()`.

The `width` / `height` signals now hold only the size the application asks for. The library no longer writes the measured size into them: only a resize gesture does. Read the rendered size with `ctx.width()` / `ctx.height()` in a presentation, or with `getNodeRect(id)` / `getNodesBounds(ids?)` on the flow component, for example to feed a layout library.

`nodesChanges.size` now carries `mode: { width, height }`, each `'auto' | 'explicit'`. Persist an axis only when it is `explicit`; an `auto` axis is a measurement of the node's content and must not be written back as data, or the node would stop following its content.

### Accessibility defaults

Handles are no longer exposed to assistive technology: the handle inputs `ariaLabel` and `ariaDescription` and the label keys `handleLabel`, `connectionStartUnavailable`, `connectionAcceptUnavailable`, `connectionValid` and `connectionInvalid` are removed. A handle gets no role, name or description; its content keeps its own semantics and `domAttributes` still applies `data-*`. Keyboard commands on focused nodes and edges now report their outcome in the flow's live region, `Delete` and `Backspace` emit `(deleteRequest)` for the focused entity or, when it is selected, for the whole selection, and a key bound through `keyboardShortcuts` is reserved for its action. See [Accessibility](../../interactions/accessibility).

### Keyboard shortcut configuration

`keyboardShortcuts` now has two sections instead of one flat object, and an empty list replaces `null` as the way to
disable an entry. `selection`, `multiSelection`, `pan` and `zoom` are held modifiers; everything else is a command that
runs on a press. `select`, `clearSelection` and the arrow keys for node movement and viewport panning became commands
too, so they can be remapped or disabled like the rest. The types `KeyboardAction` and `KeyboardCommand` are gone;
`KeyboardShortcuts` and the new `KeyboardCommandName` remain. See [Keyboard shortcuts](../../interactions/keyboard-shortcuts).

| Before                           | After                                            |
| -------------------------------- | ------------------------------------------------ |
| `{ selection: ['ShiftLeft'] }`   | `{ modifiers: { selection: ['Shift'] } }`        |
| `{ multiSelection: [...] }`      | `{ modifiers: { multiSelection: [...] } }`       |
| `{ pan: ['Space'] }`             | `{ modifiers: { panActivation: ['Space'] } }`    |
| `{ zoom: ['ControlLeft'] }`      | `{ modifiers: { zoomActivation: ['Control'] } }` |
| `{ delete: ['KeyX'] }`           | `{ commands: { delete: ['x'] } }`                |
| `{ zoomIn, zoomOut, fitView }`   | `{ commands: { zoomIn, zoomOut, fitView } }`     |
| `{ selection: null }` to disable | `{ modifiers: { selection: [] } }`               |

Keys gained spellings rather than losing them. A binding is optional modifiers and one key joined by `+`, and the key
may name a `KeyboardEvent.code` as before, or the `KeyboardEvent.key` character a layout produces; the event matches
when either of its values equals the binding. Existing code names such as `ShiftLeft` or `NumpadAdd` therefore keep
working, and the shorter spellings below are an option rather than a migration. `Mod` stands for Meta on macOS and
Control elsewhere, which one binding could not express before.

| Before                               | After                                   |
| ------------------------------------ | --------------------------------------- |
| `['ShiftLeft', 'ShiftRight']`        | `['Shift']`                             |
| `['MetaLeft', 'ControlLeft']`        | `['Mod']`                               |
| `['Equal', 'NumpadAdd']` for zoom in | `['+', '=', 'NumpadAdd']`               |
| `['Digit0', 'Numpad0']` for fit view | `['0', 'Numpad0']`                      |
| `['KeyX']`                           | `['x']` to follow the character instead |

What did change is how modifiers are read. Control, Meta and Alt must now match exactly, so a command bound without
them no longer runs while one of them is held: browser shortcuts such as `Ctrl+0` keep working, and a binding may name
a modifier itself, as in `Mod+0`. Shift is checked only when a binding names it, so accelerated movement with
`Shift` and characters such as `+` still reach their commands.

### Alignment helper

The alignment helper snaps while the node is dragged instead of moving it once the pointer is released, so `(nodeDragEnd)` and the position change report where the node ends up. `tolerance` in `AlignmentHelperSettings` is now measured in screen pixels rather than flow units: at zoom 1 the default of `10` behaves as before, at other zooms the snapping distance on screen no longer changes. A dragged selection snaps as a whole, a child aligns with the center of its parent but not with its border, and nodes also snap to equal gaps and to straight edges. Holding `Alt` (the new `alignmentBypass` modifier) moves freely. See [Alignment helper](../../viewport/alignment-helper).

### Gestures without d3

ngx-vflow no longer depends on `d3-zoom`, `d3-drag` and `d3-selection`. Pan, zoom, node dragging, resizing, connections and the selection box run on Pointer Events with the same settings, formulas and animations as before.

- Remove `d3-zoom`, `d3-drag`, `d3-selection` and their `@types` packages from your dependencies unless your application uses them itself.
- The `shouldResize` callback receives `ResizeDragEvent`, now `{ sourceEvent: PointerEvent }` instead of a d3 drag event.
- Tests that dispatch synthetic mouse or touch events to pan, drag, resize, connect or draw a selection box must dispatch `pointerdown`, `pointermove` and `pointerup` with `pointerId` and `pointerType`. Moves and the release may target `window` or `document`. Handles react to `pointerenter` and `pointerleave`. Wheel and `dblclick` events are unchanged.
- A press that starts a library gesture does not propagate to ancestors, neither as `pointerdown` nor as its compatibility `mousedown` or `touchstart`.
- The pane and draggable nodes set CSS `touch-action`; see [Viewport gestures](../../interactions/viewport-gestures) for how touch scrolling follows the settings.
- Once a pan moves, the pane captures the pointer until release, so nodes under the cursor do not receive hover events during a pan.
- A pinch that may zoom but not pan scales around the point where the fingers started, instead of drifting with them.

### Viewport methods

The programmatic viewport methods are `setViewport`, `setCenter`, `fitView`, `zoomTo`, `zoomIn` and `zoomOut`:

- Each one takes `duration` in its options and animates over that many milliseconds; before, only `fitView` could animate.
- Each one returns `Promise<boolean>`, which settles when the change ends: `true` when the viewport reached the target, `false` when there was nothing to change (`fitView` without nodes to fit) or another call or a gesture interrupted it first. Calls that ignore the result keep working.
- `setCenter(point, { zoom })` puts a flow-space point in the center of the flow.
- `zoomIn()` and `zoomOut()` zoom around the center by the step of the zoom keys.
- `FitViewOptions` gains `minZoom` and `maxZoom`, which narrow the flow limits for that call: `fitView({ nodes: [id], maxZoom: 1 })` focuses a node without zooming in past 100 %.
- Every method keeps the zoom within `minZoom` and `maxZoom`; `setViewport` keeps `x` and `y` as given.
- The methods apply at once and in order, each from where the previous call leads. Consecutive calls such as `fitView()` followed by `zoomTo(1)` compose instead of the last one replacing the others.
- `vui-controls` zooms through `zoomIn()` and `zoomOut()`; its `step` input is removed.

### Connections without a subscription

`vflow` now always handles the connection gesture. In v2 a handle started a connection only when `<vflow>` bound at least one of `(connectStart)`, `(connect)`, `(connectEnd)`, `(reconnectStart)`, `(reconnect)` or `(reconnectEnd)`, and only when the `Vflow` array was imported rather than `VflowComponent` alone. In v3 these six are outputs of `vflow` itself and the gesture works with none of them bound: without a `(connect)` handler it ends with no new edge.

A flow that relied on a missing handler to keep its handles inert sets `[canStart]="false"` and `[canAccept]="false"` on them instead.

`ConnectionControllerDirective` is no longer a public export or part of the `Vflow` array.

### Change notifications

- `(nodesChanges)` and `(edgesChanges)` are outputs of `vflow` itself. Code subscribes through a reference to the flow: `flow.nodesChanges.subscribe(...)`, or `outputToObservable(flow.nodesChanges)` for RxJS operators. The `nodesChange$` / `edgesChange$` observables and the `nodesChange` / `edgesChange` signals are removed.
- Every change of one tick comes in a single array. In v2 each moved, resized or selected node came in an array of its own, so dragging several selected nodes called the handler once per node on every move. A handler that reads only `changes[0]` must go through the whole array.
- A filtered output such as `(nodesChanges.position)` follows the same rule with the changes of its type.
- `viewportChange$` and `initialized$` are removed: `viewport` and `initialized` are state, and the signals are the way to read them.

### Removed APIs

| Removed in v3                                               | Migration                                                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Node type `svg-template`                                    | Remove `type` and provide native HTML through `<ng-template vNode>`.                                               |
| `NodeSvgTemplateDirective` and `nodeSvgTemplate`            | Remove these imports/usages and use `VflowNodeTemplateDirective` / `vNode`.                                        |
| `scaleOnHover` input on `MiniMapComponent`                  | Remove the input binding. The minimap remains at its default scale and does not capture pointer input.             |
| `documentPointToFlowPoint()`                                | Rename to `clientToFlowPosition()`. Use `flowToClientPosition()` for the inverse conversion.                       |
| `{ spaces: true }`, `SpacePoint`, `getSpacePoints`          | Convert with `clientToFlowPosition()`, then call `getNodesAtPoint()` on the flow component.                        |
| VflowComponent.toNodeSpace()                                | Use the pure `getNodePositionInSpace()` utility.                                                                   |
| getIntesectingNodes()                                       | Rename to `getIntersectingNodes()`.                                                                                |
| `viewportTo(state)`                                         | Rename to `setViewport(state)`.                                                                                    |
| `panTo({ x, y })`                                           | `setViewport({ ...flow.viewport(), x, y })`; to center on a flow-space point, `setCenter(point)`.                  |
| `step` input on `vui-controls`                              | Remove the binding. The buttons zoom by the step of the zoom keys.                                                 |
| `useDefaults` option of the `create*` factories             | Remove it. The factories always create the default signals; write a literal for a bare object.                     |
| `ConnectionControllerDirective`                             | Remove the import. The connection outputs belong to `vflow`.                                                       |
| `[selectable]`, `SelectableDirective`                       | Remove them. A click on the presentation selects the node; `vNoSelect` excludes an embedded control.               |
| `ngx-vflow/testing`: `VflowMocks`, `provideCustomNodeMocks` | Test with the real `Vflow`. See Testing mocks above.                                                               |
| `nodesChange$` and `edgesChange$`                           | `flow.nodesChanges.subscribe(...)` and `flow.edgesChanges.subscribe(...)`, or `outputToObservable()`.              |
| `nodesChange` and `edgesChange` signals                     | Subscribe to the `nodesChanges` and `edgesChanges` outputs. A signal kept only the last array.                     |
| `viewportChange$`                                           | Read the `viewport` signal, or `toObservable(flow.viewport)` with `skip(1)` to drop the current value.             |
| `initialized$`                                              | Read the `initialized` signal, or `toObservable(flow.initialized)`.                                                |
| `ChangesControllerDirective`, `NodeDragControllerDirective` | Remove the imports. They are host directives of `vflow`; their outputs are bound on `<vflow>`.                     |
| `NodeDragStartEvent`, `NodeDragEndEvent`                    | Use `NodeDragEvent`: the three node drag outputs emit the same `{ node }`.                                         |
| `isComponentNode()`                                         | Check the `component` field of the node.                                                                           |
| `NODE_DEFAULTS`, `EDGE_DEFAULTS`, `DEFAULT_OPTIMIZATION`    | Remove the imports. Omitted fields and settings keep their defaults; write a literal where the code needs a value. |

### DOM compatibility

Documented Angular APIs, CSS classes, and observable behavior remain supported contracts. Exact private DOM elements, nesting, and layer structure are not public contracts; avoid selectors or application logic that depend on them.

The `vflow` element is now its own stacking context. The minimap no longer paints above application overlays, and positioned elements placed after the flow no longer need a `z-index` to appear above its pane. To keep the flow above or below other page elements, set `z-index` on the `vflow` element or its container.

`<v-minimap>` is projected into the flow by its selector, and the `v-minimap` element is now the overlay layer itself. A minimap inside a wrapper component is no longer rendered: mark the wrapper with `ngProjectAs="v-minimap"`. A minimap inside `@if` or `@for` keeps working while the block has the minimap as its single root element. In dev mode, a minimap that the flow does not render logs a warning.

## Migration to >= v2.0

| Area                           | Change in v2.0                                                                            | What you need to do                                                                                                                                         | Notes / Examples                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nodes                          | `DynamicNode` was removed. Only `Node` remains.                                           | Replace any `DynamicNode` usage with `Node`.                                                                                                                | If your code depended on `DynamicNode`, you now always use `Node`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Nodes (reactivity)             | In `Node`, fields that are expected to be reactive are now **signals**.                   | If you previously used plain `Node` objects, wrap reactive fields into signals, **or** use `createNode()` / `createNodes()` so signals are created for you. | Recommended: use `createNode()` / `createNodes()` to avoid manual signal wrapping.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Edges (reactivity)             | `Edge` now also contains **signal fields**.                                               | Wrap existing edges using `createEdge()` / `createEdges()` during migration.                                                                                | Usually the quickest migration path: `createEdges(existingEdges)`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Connections API                | `onConnect` was renamed to `connect`.                                                     | Rename `onConnect` handlers/usages to `connect`.                                                                                                            | Applies to event bindings and any code referencing the API name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Nodes change events            | `onNodesChange` was renamed to `nodesChanges`.                                            | Rename `onNodesChange` to `nodesChanges`.                                                                                                                   | Adjust subscriptions/bindings accordingly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Event filters                  | A set of granular event filter keys was removed.                                          | Remove these filters from your code and handle filtering in your own logic if needed.                                                                       | Removed filters: `onNodesChange.position.single`, `onNodesChange.position.many`, `onNodesChange.size.single`, `onNodesChange.size.many`, `onNodesChange.add.single`, `onNodesChange.add.many`, `onNodesChange.remove.single`, `onNodesChange.remove.many`, `onNodesChange.select.single`, `onNodesChange.select.many`, `onEdgesChange.detached.single`, `onEdgesChange.detached.many`, `onEdgesChange.add.single`, `onEdgesChange.add.many`, `onEdgesChange.remove.single`, `onEdgesChange.remove.many`, `onEdgesChange.select.single`, `onEdgesChange.select.many`. |
| Custom nodes                   | `CustomDynamicNodeComponent` → `CustomNodeComponent` (because `DynamicNode` was removed). | Update your custom node components to extend `CustomNodeComponent`.                                                                                         | Also update any imports and docs referring to `CustomDynamicNodeComponent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Component node events          | `onComponentNodeEvent` was renamed to `componentNodeEvent`.                               | Rename `onComponentNodeEvent` to `componentNodeEvent`.                                                                                                      | Applies to bindings and code references.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Type guards / helpers          | `isStaticNode` removed.                                                                   | Remove usages; use the new unified node checks where applicable.                                                                                            | Prefer the unified `...Node` type guards listed below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Type guards / helpers          | `isDynamicNode` removed.                                                                  | Remove usages; use the new unified node checks where applicable.                                                                                            | `DynamicNode` no longer exists.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Type guards / helpers          | `isComponentStaticNode` and `isComponentDynamicNode` → `isComponentNode`.                 | Replace both old checks with `isComponentNode`.                                                                                                             | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Type guards / helpers          | `isTemplateStaticNode` and `isTemplateDynamicNode` → `isTemplateNode`.                    | Replace both old checks with `isTemplateNode`.                                                                                                              | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Type guards / helpers          | `isSvgTemplateStaticNode` and `isSvgTemplateDynamicNode` → `isSvgTemplateNode`.           | Replace both old checks with `isSvgTemplateNode`.                                                                                                           | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Type guards / helpers          | `isDefaultStaticNode` and `isDefaultDynamicNode` → removed with default nodes.            | Use `isTemplateNode` for template nodes.                                                                                                                    | Default nodes no longer exist.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Type guards / helpers (groups) | `isDefaultStaticGroupNode` and `isDefaultDynamicGroupNode` → removed with default groups. | Use `isTemplateGroupNode`.                                                                                                                                  | Default groups no longer exist.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Type guards / helpers (groups) | `isTemplateStaticGroupNode` and `isTemplateDynamicGroupNode` → `isTemplateGroupNode`.     | Replace both old checks with `isTemplateGroupNode`.                                                                                                         | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Migration to >= v1.0

- remove imports of `VflowModule` and use `Vflow` instead (`Vflow` contains all public standalone components and directives).
  - for standalone components, simply add `Vflow` to the `imports` array.
  - for modules, you need to spread `...Vflow` into the `imports` array; otherwise, you will get a type error.
- remove usage of the `computeLayersOnInit` setting from the `Optimization` interface.
- remove usage of the `handlePositions` input in the `VflowComponent`.
- for classes extending `CustomNodeComponent` and `CustomDynamicNodeComponent`:
  - replace `this.node` to `this.node()` due to signal input internal migration.

## Viewport virtualization

Virtualization now hides offscreen views using `display: none`, retaining their Angular component instances. It no longer replaces nodes with canvas previews or hides all edges at low zoom. `virtualizationZoomThreshold`, `NodePreview` and the node’s `preview` property have been removed. Remove these options and type imports from application code.

Nodes are initially loaded and measured even offscreen, overriding `lazyLoadTrigger: 'viewport'` when virtualization is enabled. Component effects and subscriptions continue while CSS-hidden. Focused entities and active node gestures stay in layout; merely selected entities can be culled.
