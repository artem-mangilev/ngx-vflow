# @vflow/ui

Optional, directive-first design-system primitives for ngx-vflow. Requires Angular 20 or 21.
This package is developed locally and will first be published with the next ngx-vflow major release.

Import individual directives or the `VflowUi` array from `@vflow/ui` into your standalone
component. They style your own HTML/SVG, without adding wrappers or depending on ngx-vflow.

```html
<section vflowTheme="light">
  <article vflowNode>
    <header vflowNodeHeader>
      <span vflowIcon aria-hidden="true">✓</span>
      <span vflowTitle>Review invoice</span>
    </header>
    <div vflowNodeBody>Your content and controls</div>
    <footer vflowNodeFooter>
      <span vflowStatus="warning">Waiting for approval</span>
      <span vflowStatus="danger">Missing PO</span>
      <span vflowActions><button vflowButton type="button">Approve</button></span>
    </footer>
  </article>
</section>
```

Include `@vflow/ui/styles.css` in your application's global styles: it is compiled with Tailwind 4
(`vui:`-prefixed utilities, no Preflight) and needs no Tailwind on your side. If you run Tailwind v4
yourself, import `@vflow/ui/styles.source.css` as a separate global stylesheet instead and let your
pipeline compile it. Rules live in cascade layers; unlayered application styles override them.

The package includes card, field-row and container shells, text roles (title, meta, icon, actions),
port visuals, status indicators, SVG edge strokes, HTML labels, toolbar surfaces, external labels,
theme and selection directives, and `vflow-controls` (zoom in/out, fit view, custom buttons) for a
flow instance. The BPMN subset lives in the `@vflow/ui/bpmn` entry point.
For flow interaction compose them with core `selectable`, `handle`, `customTemplateEdge`
and gesture-exclusion directives. Bind `vflowSelected` to selection/preselection and put
`vflowPort` inside a handle template. UI never changes roles, focus or graph state.

Use `vflowTheme="light"` or `vflowTheme="dark"` on the editor ancestor and override the shared tokens
`--vui-surface`, `--vui-surface-muted`, `--vui-foreground`, `--vui-muted`, `--vui-border`, `--vui-accent`,
`--vui-on-accent`, `--vui-font-family`, `--vui-font-size`, `--vui-line-height`, `--vui-space` and
`--vui-radius` to match your application. Part details are ordinary CSS on the `.vui-*` selectors.
A theme scope also maps core feedback (`--vflow-*`) to the same values; a flow outside a theme scope
keeps core defaults. States retain text/icons alongside their colors.

See the **Design system** ng-doc section for the complete directive/token reference
and interactive workflow, ERD/mapping and BPMN recipes. Existing core defaults remain available;
removing them is a separate major-release migration.

Versions and releases are shared with ngx-vflow. See `docs/releasing.md` in the repository.
