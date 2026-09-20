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
  <ng-template let-ctx node>
    @if (ctx.data().type === 'group') {
      <div class="frame" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
    } @else {
      <div class="card" selectable>
        {{ ctx.data().title }}
        <span vflowHandle handleType="target" position="left" class="dot"></span>
        <span vflowHandle handleType="source" position="right" class="dot"></span>
      </div>
    }
  </ng-template>
  <ng-template let-ctx edge>
    <svg:g edgeInteraction>
      <svg:path class="line" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
    </svg:g>
    <span *edgeLabel>{{ ctx.data().label }}</span>
  </ng-template>
</vflow>
```

{% endraw %}

**Path B: presentations from `@vflow/ui`**

{% raw %}

```html
<section vflowTheme="light">
  <vflow [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx node>
      <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
        <header vflowNodeHeader><span vflowTitle>{{ ctx.data().title }}</span></header>
        <span vflowPort handleType="target" position="left"></span>
        <span vflowPort handleType="source" position="right"></span>
      </article>
    </ng-template>
    <ng-template let-ctx edge>
      <svg:g edgeInteraction>
        <svg:path vflowEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" [vflowSelected]="ctx.selected()" />
      </svg:g>
      <span *edgeLabel vflowEdgeLabel>{{ ctx.data().label }}</span>
    </ng-template>
  </vflow>
</section>
```

{% endraw %}

Include `@vflow/ui/styles.css` in your global styles for path B. See the Design system section for the parts.

| Removed                                                                  | Replacement                                                                                                                                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node `type: 'default'`, `text`                                           | A node without `type`, with `data` and a `node` template; standard handles become `[vflowHandle]` elements in the template. Use `ariaLabel` for the accessible name                      |
| Node `type: 'default-group'`, `color`, `resizable`                       | A node with `width`, `height` and a group marker in `data`, drawn by a branch of the `node` template; put `resizable` on the template's element                                          |
| `DefaultNode`, `DefaultGroupNode`, `isDefaultNode`, `isDefaultGroupNode` | `Node`; the application tells its node kinds apart by `data`                                                                                                                             |
| Edge `type` (`'default'` / `'template'`)                                 | Removed; every edge renders through the `edge` template or its `component`                                                                                                               |
| `EdgeLabel` `type: 'default'`, `text`, `style`                           | A label declared inside the edge presentation with the `edgeLabel` directive; see Edge labels below                                                                                      |
| `color` and `strokeWidth` fields of `Marker`                             | Markers follow the edge stroke (`context-stroke`); style `.vflow-marker` or define your own marker                                                                                       |
| Connection `type: 'default'` preview                                     | Unchanged: the default connection line and the `connection` template both remain                                                                                                         |
| `mode: 'loose'` in `ConnectionSettings`                                  | `handleType="any"` on the handles that connect in either direction; `loose` no longer exists and handle ids are not required                                                             |
| `type` in `ConnectionSettings`                                           | Removed: the preview renders `ng-template[connection]` when it is declared, the default line otherwise                                                                                   |
| `floating` in `Edge`                                                     | `position="auto"` on a handle of the node: the edge meets the node on the side facing the other end                                                                                      |
| `id` input of the handle                                                 | `handleId`; a static `id` attribute used to become the DOM id of the element                                                                                                             |
| `<handle>`, `[template]`, `ng-template[handle]`, `HandleContext`         | `[vflowHandle]` on your own element; state via the `data-vflow-handle-state` attribute and its siblings or the directive's signals; `vflowPort` from `@vflow/ui` for the old default dot |

### Appearance inputs removed

Colors are CSS. Core reads the tokens `--vflow-background`, `--vflow-surface`, `--vflow-foreground`,
`--vflow-muted`, `--vflow-border`, `--vflow-selection` and `--vflow-focus`, each with a built-in default.
Set them on the `vflow` element or any ancestor; a `vflowTheme` scope from `@vflow/ui` maps its theme onto them.

| Removed input                                        | Replacement                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `[background]="'#fff'"` / `{ type: 'solid', color }` | `--vflow-background` token; `[background]` now takes only `dots`, `grid` or `image` patterns |
| Dots/grid `color`, `backgroundColor`                 | `--vflow-muted` and `--vflow-background`; the `.vflow-background-pattern` class              |
| `resizerColor`, resize control `color`               | `--vflow-selection`, `--vflow-surface`; `.resize-control.handle` / `.resize-control.line`    |
| `mini-map` `maskColor`, `strokeColor`                | `--vflow-muted` (mask) and `--vflow-border` (frame); the minimap samples the resolved tokens |
| `lineColor` in `alignmentHelper` settings            | `--vflow-foreground`; `.vflow-alignment-line`. `tolerance` stays                             |
| `color` in `selectionBox` settings                   | `--vflow-selection`; `.selection-box`. `mode` stays                                          |

Behavior parameters are untouched: node points, sizes, `extent`, resize constraints, drag thresholds,
snap grid, zoom limits, curves and connection validation keep their APIs. Handle `offsetX` and `offsetY` keep their
names, but a positive value now moves the handle right and down; version 2 moved it the other way.

Version 3 renders node-facing templates as native HTML in a CSS-transformed viewport. Edges and connection overlays still use SVG. SVG content passed to the node template or to `[resizable]` is no longer supported. The library does not inspect template roots or provide a compatibility fallback, so these templates must be rewritten explicitly.

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
| `isTemplateNode`, `isTemplateGroupNode`                                     | Check `component` or your own `data`; `isComponentNode` stays                                     |
| `<ng-template nodeHtml>`, `NodeHtmlTemplateDirective`                       | `<ng-template node>`, `NodeTemplateDirective`                                                     |
| `<ng-template groupNode>`, `GroupNodeTemplateDirective`, `GroupNodeContext` | A branch of the `node` template; every node context has `width` and `height`                      |

The library does not read a node kind. Keep your own discriminator in `data` and branch on it in the template. A group is any node with a size and children that reference it through `parentId`; its accessible name still defaults to `Group {id}` when it has children.

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
  <ng-template let-ctx node>
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

`(componentNodeEvent)` stays. It now collects every declared output of the component, including `@Output()`, `output()` and `outputFromObservable()`, and `eventName` is the property name of the output. `ComponentNodeEvent<[A, B]>` infers events from those outputs. In a component unit test, `provideCustomNodeMocks()` also provides a mock for `injectNode()`.

### Edge presentations

The `customTemplateEdge` selector and `CustomTemplateEdgeComponent` are removed. Wrap the path in `<svg:g edgeInteraction>` instead: the directive draws a transparent interaction stroke of `interactionWidth` (20 by default) as the first child of the group, and a click near the line selects the edge. Without it the edge has no hit area.

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
<ng-template let-ctx edge>
  <svg:g edgeInteraction>
    <svg:path [attr.d]="ctx.path()" />
  </svg:g>
</ng-template>
```

An edge can now be drawn by a component instead of the template: set `component` on the edge. The flow creates the component on an SVG group inside the edge, reads the edge through `injectEdge()`, and forwards its outputs to the new `(componentEdgeEvent)` output of `vflow`, typed with `ComponentEdgeEvent<[A, B]>`. Add `EdgeInteractionDirective` to the component's `hostDirectives` to give it a hit area.

### Edge labels

Labels are no longer edge data rendered by one global template. The `edgeLabels` field of `Edge`, the `EdgeLabel` and `HtmlTemplateEdgeLabel` types, `<ng-template edgeLabelHtml>`, `EdgeLabelHtmlTemplateDirective` and `HtmlEdgeLabelContext` are removed. Declare labels inside the edge presentation with the `edgeLabel` directive and keep their text in edge `data`. `EdgeLabelPosition` stays.

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
  <ng-template let-ctx edge>
    <svg:g edgeInteraction>
      <svg:path [attr.d]="ctx.path()" />
    </svg:g>
    @if (ctx.data()?.label; as label) {
      <span *edgeLabel class="label">{{ label }}</span>
    }
  </ng-template>
</vflow>
```

{% endraw %}

Place a label next to the SVG elements of the edge, not inside `svg:g`: Angular compiles HTML inside SVG in the SVG namespace and such a label does not render. The label value picks `start`, `center` (default) or `end` and is an expression, so write it with quotes. See the Edge labels page.

### Testing mocks

`ngx-vflow/testing` follows the new API. `VflowMocks` declare `ng-template[node]`, `ng-template[edge]`, `ng-template[edgeLabel]` and `ng-template[connection]`, plus mocks for `vflowHandle` and `edgeInteraction`. The `nodeHtml`, `groupNode`, `edgeLabelHtml` and `handle` template mocks, `HandleMockComponent` and `CustomTemplateEdgeMockComponent` are removed. The `vflowHandle` mock provides itself as `VflowHandleDirective`, and `provideCustomNodeMocks()` provides the node object returned by `injectNode()`.

### Custom handle templates

Custom handles are now your own native HTML elements with the `vflowHandle` directive, which positions them on the node side. The former SVG placement coordinate `ctx.point` and the handle template context have been removed; the validation state is exposed as the `data-vflow-handle-state` attribute and as the `state` signal of `VflowHandleDirective`. The handle type is the `handleType` input (`handleType="target"`),
not `type`, so it never reaches the native `type` attribute of the element. See the Custom handles page.

Before:

```html
<ng-template #handleTemplate let-ctx>
  <svg:circle r="6" [attr.cx]="ctx.point().x" [attr.cy]="ctx.point().y" [class.handle_valid]="ctx.state() === 'valid'" />
</ng-template>
```

After:

```html
<span vflowHandle handleType="source" position="right" class="port"></span>
```

```css
.port {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.port[data-vflow-handle-state='valid'] {
  background: green;
}
```

Do not calculate a replacement coordinate in the template: placement belongs to the directive.

### Resizable templates

Apply `[resizable]` to a native HTML element instead of an SVG shape. The directive name and its sizing inputs are unchanged.

Before:

```html
<ng-template let-ctx groupNode>
  <svg:rect [resizable]="ctx.selected()" [attr.width]="ctx.width()" [attr.height]="ctx.height()" />
</ng-template>
```

After:

```html
<ng-template let-ctx node>
  <div [resizable]="ctx.selected()"></div>
</ng-template>
```

The `[resizable]` element is now the node's sizing box: for an explicitly sized node the library sets its `width`, `height` and `box-sizing: border-box` inline, so size bindings on that element are no longer needed. The node wrapper no longer receives an inline size when a `[resizable]` element exists, so put the directive on the top-level element of the node template. Content-sized nodes stay unsized until the first resize, as described in Node size modes above.

### Node size modes

`createNodes` / `createNode` no longer give nodes a default `width` / `height` of 100 x 50. A node without a size in its data is content-sized (`auto`): the library measures it and never writes inline dimensions. A node becomes explicitly sized (`explicit`) when its data carries both `width` and `height`, or after the first resize gesture. `NodeWithDefaults` reflects this: `width` and `height` are optional, so read them with optional chaining, for example `width?.()`.

`nodesChanges.size` now carries `mode: 'auto' | 'explicit'`. Persist a size only when it is `explicit`; an `auto` size is a measurement of the node's content and must not be written back as data, or the node would stop following its content.

### Removed APIs

| Removed in v3                                      | Migration                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Node type `svg-template`                           | Remove `type` and provide native HTML through `<ng-template node>`.                                    |
| `NodeSvgTemplateDirective` and `nodeSvgTemplate`   | Remove these imports/usages and use `NodeTemplateDirective` / `node`.                                  |
| `scaleOnHover` input on `MiniMapComponent`         | Remove the input binding. The minimap remains at its default scale and does not capture pointer input. |
| `documentPointToFlowPoint()`                       | Rename to `clientToFlowPosition()`. Use `flowToClientPosition()` for the inverse conversion.           |
| `{ spaces: true }`, `SpacePoint`, `getSpacePoints` | Convert with `clientToFlowPosition()`, then call `getNodesAtPoint()` on the flow component.            |
| VflowComponent.toNodeSpace()                       | Use the pure `getNodePositionInSpace()` utility.                                                       |
| getIntesectingNodes()                              | Rename to `getIntersectingNodes()`.                                                                    |

### DOM compatibility

Documented Angular APIs, CSS classes, and observable behavior remain supported contracts. Exact private DOM elements, nesting, and layer structure are not public contracts; avoid selectors or application logic that depend on them.

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
