# @vflow/ui

Optional, directive-first design-system primitives for ngx-vflow. Requires Angular 20 or 21.
This package is developed locally and will first be published with the next ngx-vflow major release.

Import individual directives or the `VflowUi` array from `@vflow/ui` into your standalone
component. They style your own HTML/SVG, without adding wrappers or depending on ngx-vflow.

```html
<section vflowTheme="light">
  <article vflowNode>
    <header vflowNodeHeader>
      <span vflowNodeIcon aria-hidden="true">✓</span>
      <span vflowNodeTitle>Review invoice</span>
    </header>
    <div vflowNodeBody>Your content and controls</div>
    <footer vflowNodeFooter>
      <span vflowStatus="warning">Waiting for approval</span>
      <span vflowDiagnostic="danger">Missing PO</span>
      <span vflowNodeActions><button vflowButton type="button">Approve</button></span>
    </footer>
  </article>
</section>
```

Include `@vflow/ui/styles.css` in your application's global styles. CSS is built with Tailwind 4,
with `vui:`-prefixed utilities, and includes no Preflight. Consumers need no Tailwind build step.
Presentation rules use the `vui` cascade layer; unlayered application styles override them.

The package includes card anatomy, field rows, port visuals, status and diagnostic indicators,
SVG edge strokes, HTML labels, toolbar surfaces, external labels, container frames,
BPMN event/gateway outlines, theme and selection directives.
For flow interaction compose them with core `selectable`, `handle`, `customTemplateEdge`
and gesture-exclusion directives. Bind `vflowSelected` to selection/preselection and put
`vflowPort` inside a handle template. UI never changes roles, focus or graph state.

Use `vflowTheme="light"` or `vflowTheme="dark"` on the editor ancestor and override semantic CSS variables such as
`--vui-surface`, `--vui-foreground`, `--vui-border`, `--vui-accent`, `--vui-on-accent`,
`--vui-padding` and `--vui-field-height` to match your application. States retain text/icons
alongside their colors. Internal row scrolling/collapse and a full BPMN modeler are outside this MVP.

See the **Design system** ng-doc section for the complete directive/token reference
and interactive workflow, ERD/mapping and BPMN recipes. Existing core defaults remain available;
removing them is a separate major-release migration.

Versions and releases are shared with ngx-vflow. See `docs/releasing.md` in the repository.
