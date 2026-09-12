## Migration to >= v3.0

Angular 20 is now the minimum supported version. Upgrade Angular before installing ngx-vflow v3.

### Headless core: default presentations removed

Core no longer ships ready-made node, group, edge or label presentations. It keeps geometry, hit targets,
accessibility, focus, selection feedback, the connection preview, basic handles and resize controls. Every
graph needs templates. There are two working paths:

**Path A: your own templates on the headless core**

{% raw %}

```html
<vflow [nodes]="nodes" [edges]="edges">
  <ng-template let-ctx nodeHtml>
    <div class="card" selectable>
      {{ ctx.data().title }}
      <handle type="target" position="left" />
      <handle type="source" position="right" />
    </div>
  </ng-template>
  <ng-template let-ctx groupNode>
    <div class="frame" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
  </ng-template>
  <ng-template let-ctx edge>
    <svg:g customTemplateEdge selectable>
      <svg:path class="line" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
    </svg:g>
  </ng-template>
  <ng-template let-ctx edgeLabelHtml><span>{{ ctx.label.data }}</span></ng-template>
</vflow>
```

{% endraw %}

**Path B: presentations from `@vflow/ui`**

{% raw %}

```html
<section vflowTheme="light">
  <vflow [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx nodeHtml>
      <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
        <header vflowNodeHeader><span vflowTitle>{{ ctx.data().title }}</span></header>
        <handle type="target" position="left" [template]="port" />
        <handle type="source" position="right" [template]="port" />
      </article>
    </ng-template>
    <ng-template let-ctx edge>
      <svg:g customTemplateEdge selectable>
        <svg:path vflowEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" [vflowSelected]="ctx.selected()" />
      </svg:g>
    </ng-template>
    <ng-template let-ctx edgeLabelHtml><span vflowEdgeLabel>{{ ctx.label.data }}</span></ng-template>
  </vflow>
  <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
</section>
```

{% endraw %}

Include `@vflow/ui/styles.css` in your global styles for path B. See the Design system section for the parts.

| Removed                                                                  | Replacement                                                                                                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node `type: 'default'`, `text`                                           | `type: 'html-template'` with `data` and a `nodeHtml` template; standard handles become `<handle>` elements in the template. Use `ariaLabel` for the accessible name |
| Node `type: 'default-group'`, `color`, `resizable`                       | `type: 'template-group'` with a `groupNode` template; put `resizable` on the template's element                                                                     |
| `DefaultNode`, `DefaultGroupNode`, `isDefaultNode`, `isDefaultGroupNode` | `HtmlTemplateNode`, `TemplateGroupNode`, `isTemplateNode`, `isTemplateGroupNode`                                                                                    |
| Edge `type` (`'default'` / `'template'`)                                 | Removed; every edge renders through the `edge` template                                                                                                             |
| `EdgeLabel` `type: 'default'`, `text`, `style`                           | `type: 'html-template'` with `data` and an `edgeLabelHtml` template                                                                                                 |
| `color` and `strokeWidth` fields of `Marker`                             | Markers follow the edge stroke (`context-stroke`); style `.vflow-marker` or define your own marker                                                                  |
| Connection `type: 'default'` preview                                     | Unchanged: the default connection line and the `connection` template both remain                                                                                    |

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
snap grid, zoom limits, curves, handle offsets and connection validation keep their APIs.

Version 3 renders node-facing templates as native HTML in a CSS-transformed viewport. Edges and connection overlays still use SVG. The existing `groupNode`, handle `[template]`, and `[resizable]` names are unchanged, but SVG content passed to these APIs is no longer supported. The library does not inspect template roots or provide a compatibility fallback, so these templates must be rewritten explicitly.

### Reparenting identity

The optional `parentId` field may still be omitted from `Node` and `StaticNode`. The `NodeWithDefaults` values returned by ordinary `createNode()` and `createNodes()` calls always contain a `parentId` signal initialized to `null` when no parent is supplied.

`reparentNodes()` now updates the existing `point` and `parentId` signals, preserving the node object reference. If an optional `parentId` signal is absent, it is added to that same object. A successful call returns a new array containing the same node objects; a full no-op returns the original array.

### Group-node templates

Replace SVG group-node content with a native HTML element. Continue to use the reactive `ctx.width()` and `ctx.height()` values.

Before:

```html
<ng-template let-ctx groupNode>
  <svg:rect [attr.width]="ctx.width()" [attr.height]="ctx.height()" [style.stroke]="'red'" [style.fill]="'transparent'" />
</ng-template>
```

After:

```html
<ng-template let-ctx groupNode>
  <div class="group-node" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
</ng-template>
```

```css
.group-node {
  box-sizing: border-box;
  border: 1px solid red;
  background: transparent;
}
```

### Custom handle templates

Custom handles now render as native HTML, and the library-owned wrapper positions them. The former SVG placement coordinate `ctx.point` has been removed. The template context still exposes `ctx.state()` and `ctx.node`.

Before:

```html
<ng-template #handleTemplate let-ctx>
  <svg:circle r="6" [attr.cx]="ctx.point().x" [attr.cy]="ctx.point().y" [class.handle_valid]="ctx.state() === 'valid'" />
</ng-template>
```

After:

```html
<ng-template #handleTemplate let-ctx handle>
  <div class="handle" [class.handle_valid]="ctx.state() === 'valid'"></div>
</ng-template>
```

```css
.handle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
```

Do not calculate a replacement coordinate in the template: placement belongs to the handle wrapper.

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
<ng-template let-ctx groupNode>
  <div [resizable]="ctx.selected()" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
</ng-template>
```

### Removed APIs

| Removed in v3                                      | Migration                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Node type `svg-template`                           | Use `html-template` and provide native HTML through `<ng-template nodeHtml>`.                          |
| `NodeSvgTemplateDirective` and `nodeSvgTemplate`   | Remove these imports/usages and use `NodeHtmlTemplateDirective` / `nodeHtml`.                          |
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
