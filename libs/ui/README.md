# @vflow/ui

Optional Angular presentation primitives for ngx-vflow. Applications own content and graph
state; core owns geometry and interaction. Import `VflowUi` or individual exports, alongside
`Vflow`. Import BPMN separately through `@vflow/ui/bpmn`.

Choose one global CSS entry: `@vflow/ui/styles.css` (compiled) or
`@vflow/ui/styles.source.css` (standard CSS for your bundler). Neither requires Tailwind at
runtime or in a consumer build. The source entry contains no monorepo paths or generator directives.
Both entries come from one source and preserve the same rules; source consumption does not
promise unused-rule removal.

Apply `[vflowTheme]="'light'"` or `[vflowTheme]="'dark'"` around the editor. Importing CSS alone
does not activate a theme. Override general `--vui-*` / `--vflow-*` tokens or public `.vui-*`
part selectors using application CSS. See the Design system section of the documentation for
all selectors, tokens, five runnable compositions and canvas theme synchronization.

Viewport controls: `<vflow-controls [flow]="editor" />`, where `editor` is a `VflowComponent`.
Native buttons projected into it remain application-owned. Activity, diagnosis, selection and
available actions are independent states; `vflowStatusActive` never disables an action.
