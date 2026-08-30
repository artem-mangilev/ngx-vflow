## Migration to >= v3.0

Version 3 renders node-facing templates as native HTML in a CSS-transformed viewport. Edges and connection overlays still use SVG. The existing `groupNode`, handle `[template]`, and `[resizable]` names are unchanged, but SVG content passed to these APIs is no longer supported. The library does not inspect template roots or provide a compatibility fallback, so these templates must be rewritten explicitly.

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
| Type guards / helpers          | `isDefaultStaticNode` and `isDefaultDynamicNode` → `isDefaultNode`.                       | Replace both old checks with `isDefaultNode`.                                                                                                               | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Type guards / helpers (groups) | `isDefaultStaticGroupNode` and `isDefaultDynamicGroupNode` → `isDefaultGroupNode`.        | Replace both old checks with `isDefaultGroupNode`.                                                                                                          | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Type guards / helpers (groups) | `isTemplateStaticGroupNode` and `isTemplateDynamicGroupNode` → `isTemplateGroupNode`.     | Replace both old checks with `isTemplateGroupNode`.                                                                                                         | One unified type guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Migration to >= v1.0

- remove imports of `VflowModule` and use `Vflow` instead (`Vflow` contains all public standalone components and directives).
  - for standalone components, simply add `Vflow` to the `imports` array.
  - for modules, you need to spread `...Vflow` into the `imports` array; otherwise, you will get a type error.
- remove usage of the `computeLayersOnInit` setting from the `Optimization` interface.
- remove usage of the `handlePositions` input in the `VflowComponent`.
- for classes extending `CustomNodeComponent` and `CustomDynamicNodeComponent`:
  - replace `this.node` to `this.node()` due to signal input internal migration.
