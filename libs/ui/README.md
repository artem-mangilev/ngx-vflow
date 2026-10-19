# @vflow/ui

Optional, directive-first design-system primitives for ngx-vflow. Requires Angular 20, 21 or 22.
It is not published as a package: `@vflow/cli` copies these sources and their tokens into your workspace.

Import individual directives or the `Vui` array from `@vflow/ui` into your standalone
component. They style your own HTML/SVG without adding wrappers; `vuiPort` is itself a core handle.

```html
<section data-vui-theme="light">
  <article vuiNode>
    <header vuiNodeHeader>
      <span vuiIcon aria-hidden="true">✓</span>
      <span vuiTitle>Review invoice</span>
    </header>
    <div vuiNodeBody>Your content and controls</div>
    <footer vuiNodeFooter>
      <span vuiStatus="warning">Waiting for approval</span>
      <span vuiStatus="danger">Missing PO</span>
      <span vuiActions><button vuiButton="primary" type="button">Approve</button></span>
    </footer>
  </article>
</section>
```

## Styles

The application needs Tailwind CSS v4. `ng g @vflow/cli:ui` copies the tokens (`vflow-ui.css`) next to its global
stylesheet, imports them after Tailwind and copies the parts, whose utilities your Tailwind pipeline then generates. In this workspace `src/styles.css` compiles the parts for docs and e2e.

The parts use Tailwind utilities from the package's own `vui` theme keys (`bg-vui-surface`, `p-vui-3`,
`rounded-vui-surface`), without a Tailwind prefix, and the application's type utilities (`text-xs`, `text-sm`,
`font-medium`, `font-semibold`). A detail of one part is an arbitrary value in that part, not a key. Rules live in
cascade layers; unlayered application styles override them.

## Parts

| Area       | Parts                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Shells     | `vuiNode` with `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`; `vuiRow`; `vuiGroup` with `vuiGroupHeader` |
| Text roles | `vuiTitle`, `vuiMeta`, `vuiIcon`, `vuiActions`                                                             |
| Port       | `vuiPort`: a core handle with the port look                                                                |
| Edge       | `vuiEdge` on the SVG path, `vuiEdgeLabel` for HTML labels                                                  |
| Extras     | `vuiStatus`, `vuiToolbar`, `vuiButton` (`secondary` by default, `primary`, `plain`)                        |
| Viewport   | `<vui-controls [flow]="flow">`: zoom in/out, fit view and your own buttons for one flow                    |

Bind the `selected` input of `vuiNode`, `vuiGroup` and `vuiEdge` to `ctx.selected() || ctx.preselected()`. Put `vuiPort` with the handle inputs `handleType`,
`position`, `handleId`, `canStart` and `canAccept` on the element that is the connection point: it applies core
`vHandle` as a host directive and shows its connection feedback. For flow interaction compose the parts with core
gesture exclusions (`vNoDrag`, `vNoSelect`); a click on a presentation selects its node or edge, and
`vEdgeInteraction` keeps the edge hit area inside the group. UI never changes roles, focus or graph state.

## Theme

The light theme is the default on `:root`, like shadcn's. Put `data-vui-theme="dark"` on the editor ancestor (any element,
including `<html>`), or `data-vui-theme="light"` to force light inside a dark scope, and override the theme variables to
match your application:

- colors shared with core: `--v-background`, `--v-surface`, `--v-foreground`, `--v-muted`, `--v-border`,
  `--v-selection`, `--v-focus`;
- UI colors: `--vui-surface-muted`, `--vui-accent`, `--vui-on-accent`, and the tones `--vui-success`,
  `--vui-warning`, `--vui-danger`, `--vui-info`;
- scales: `--vui-space`, `--vui-radius`;
- elevation: `--vui-shadow-node`, `--vui-shadow-floating`.

Text (typeface, size, line height, letter spacing) and transition timing come from the application.

Every size, padding and radius of the parts derives from `--vui-space` and `--vui-radius`. Part details are ordinary
CSS on the `.vui-*` selectors. The parts read the core `--v-*` colors, so core feedback and the parts share one value;
an explicit `data-vui-theme` scope also sets `color-scheme` and `accent-color`. States retain text/icons alongside their
colors.

See the **Design system** ng-doc section for the complete directive/token reference and the workflow, pipeline,
ERD/mapping and relationships map recipes. Core is headless: it renders no presentation of its own, so every graph
uses these parts or your own templates.

Versions and releases are shared with ngx-vflow. See `docs/releasing.md` in the repository.
