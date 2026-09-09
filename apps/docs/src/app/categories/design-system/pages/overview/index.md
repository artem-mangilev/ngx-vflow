`@vflow/ui` supplies optional presentation parts for `ngx-vflow`. Applications own content,
statuses, actions and graph state. Core owns geometry, hit targets, focus and interaction eligibility.
The package is developed here and ships with the next major release.

## Setup

```typescript
import { Vflow } from 'ngx-vflow';
import { VflowUi } from '@vflow/ui';
import { VflowBpmn } from '@vflow/ui/bpmn'; // Only for BPMN compositions

// Standalone component: imports: [Vflow, VflowUi]
```

Choose **one** global stylesheet:

- `@vflow/ui/styles.css`: precompiled, with no Tailwind dependency or source scanning.
- `@vflow/ui/styles.source.css`: the same rules as standard CSS, for a bundler supporting
  CSS imports, cascade layers and minification. No generator directives, repository paths,
  Tailwind plugin or additional source files are required. This does not promise unused-rule removal.

The library compiles one source during its single Angular package build. Both CSS exports
are marked as side effects. Rules live in the `vui` layer; ordinary unlayered application CSS wins.

Apply `[vflowTheme]="'light'"` or `[vflowTheme]="'dark'"` to an ancestor of the **whole** editor.
Importing CSS alone does not activate a theme globally. Two themes and a core-only flow can coexist.

## Reference compositions

- [Workflow](../workflow): branching outputs, simultaneous status and diagnosis, actions and labels.
- [Data/media pipeline](../pipeline): typed named ports, rich content and native controls.
- [ERD/schema mapping](../entities): stable field IDs, rename/reorder/delete and scroll/collapse experiment.
- [Relationships/metrics](../relationships): connected container, metrics, note and view-only behavior.
- [BPMN](../bpmn): task, start/end, XOR/parallel, pool/lane and three link presentations.

Each page includes its working component source and limitations.

## Public parts

Directives add stable classes to consumer elements; passive parts do not insert wrappers.
Titles, descriptions, icons, metadata and actions are ordinary HTML inside those parts.

| Import / attribute                          | Public CSS selector                   | Composition                                                         |
| ------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| `VflowNode` / `vflowNode`                   | `.vui-node`                           | Card surface                                                        |
| `VflowNodeHeader` / `vflowNodeHeader`       | `.vui-node-header`                    | Title, icon, metadata, actions; also container heading              |
| `VflowNodeBody` / `vflowNodeBody`           | `.vui-node-body`                      | Arbitrary application content                                       |
| `VflowNodeFooter` / `vflowNodeFooter`       | `.vui-node-footer`                    | Secondary information/actions                                       |
| `VflowField` / `vflowField`                 | `.vui-field`                          | Field name, type, indicators and handles on either side             |
| `VflowPort` / `vflowPort`                   | `.vui-port[data-state]`               | Handle-template visual; bind `vflowPortState` to core `ctx.state()` |
| `VflowStatus` / `vflowStatus`               | `.vui-status[data-tone][data-active]` | neutral/info/success/warning/danger; projected text/icon            |
| `VflowSelected` / `vflowSelected`           | `[data-vui-selected]`                 | Bind core selected/preselected independently from status            |
| `VflowEdge` / `path[vflowEdge]`             | `.vui-edge`                           | Bind path and marker URLs from core edge context                    |
| `VflowEdgeLabel` / `vflowEdgeLabel`         | `.vui-edge-label`                     | Start/center/end label content, including actions                   |
| `VflowGroup` / `vflowGroup`                 | `.vui-group`                          | Container frame; graph data establishes parenthood                  |
| `VflowExternalLabel` / `vflowExternalLabel` | `.vui-external-label`                 | Label below an event or gateway                                     |
| `VflowToolbar` / `vflowToolbar`             | `.vui-toolbar`                        | Surface inside core `node-toolbar`                                  |
| `VflowButton` / `button[vflowButton]`       | `.vui-button`                         | Native button semantics and disabled/focus behavior                 |
| `VflowControls` / `vflow-controls`          | `.vui-controls`                       | Required `[flow]` instance; zoom in/out/fit and projected buttons   |

`vflowStatusActive` adds an activity indicator; it does not disable anything or impose live-region
semantics. Use meaningful text for diagnosis and application status, including when both are shown.
The animation stops under reduced motion. Embedded controls need accessible names and the
appropriate core gesture exclusions (`vflowNoDrag`, `vflowNoWheel`, `vflowNoPan`).

## Theme contract

| Owner            | Public tokens                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Core palette     | `--vflow-background`, `--vflow-surface`, `--vflow-foreground`, `--vflow-muted`, `--vflow-border`                             |
| Core feedback    | `--vflow-selection`, `--vflow-focus`                                                                                         |
| UI palette       | `--vui-surface`, `--vui-surface-muted`, `--vui-foreground`, `--vui-muted`, `--vui-border`, `--vui-accent`, `--vui-on-accent` |
| UI typography    | `--vui-font-family`, `--vui-font-size`, `--vui-line-height`                                                                  |
| UI spacing/shape | `--vui-space`, `--vui-radius`                                                                                                |

Core supplies fallback values at each use. The explicit UI scope maps these to its palette.
Application overrides take precedence. Set general values with tokens and part details with CSS:

```css
.my-editor {
  --vui-accent: #0f766e;
  --vui-radius: 6px;
}
.my-editor .vui-field {
  min-height: 30px;
  padding-block: 4px;
}
.my-editor .vui-port {
  width: 10px;
  height: 10px;
}
.my-editor .vui-edge {
  stroke-width: 3px;
}
```

Local node/edge overrides follow DOM inheritance. Markers, toolbar and minimap use their editor
scope; node-local values are not copied to separate layers. Core measures geometry when visible
node/port size changes; a color change alone does not alter graph state or coordinates.

Canvas minimap resolves the core palette into actual CSS colors. It observes `class`, `style`
and `data-vui-theme` changes on its mounted ancestors, including the flow and document root.
For a stylesheet-only or media-query theme change, dispatch `vflow-theme-change` on the flow
after applying the change. This refreshes the canvas without recreating the flow. Arbitrary
external stylesheet edits are not automatically observable. The minimap represents node bounds,
not a screenshot of local node styling.

Controls use the public flow instance, viewport signal, zoom limits, `zoomTo` and `fitView`.
They do not register editors or change editability. Their dependency on `ngx-vflow` is a peer dependency.
