---
name: ngx-vflow
description: Builds node-based UIs in Angular with ngx-vflow 3 (flows, nodes, edges, handles, connections, viewport, minimap, @vflow/ui). Use whenever code imports from 'ngx-vflow' or '@vflow/*', or the task is a graph editor, workflow builder or diagram in Angular.
---

# ngx-vflow

These docs match the installed version of `ngx-vflow`. Prefer them over what you remember: most published code and
model knowledge is about v2, and v3 renamed or removed much of it with no aliases.

## Before writing code

1. Find the topic in the index below and read that reference. Each page has the full code of its demos.
2. If the project already uses ngx-vflow, check its version in `package.json`. Code with `nodeHtml`, `<handle>`,
   node `type`, `ngx-vflow/testing` or `d3-*` is v2: read [Migration](references/docs/getting-started/migration.md)
   before changing it.

## What v3 looks like

- Core is headless: it renders no node, edge or handle look. Every node and edge needs a template (`*vNode`,
  `*vEdge`) or a `component`, written by the application or taken from `@vflow/ui` (`npx @vflow/cli ui`).
- Selectors, directives and CSS tokens of core use the `v` prefix (`vNode`, `vHandle`, `--v-*`); `@vflow/ui` uses
  `vui`. Import the `Vflow` array to get every public directive.
- Nodes and edges are created with `createNodes()` / `createEdges()`; a node has `id`, `point` and the
  application's own `data`, read as `ctx.data()` in the template.
- Settings go to `provideVflow(with*())` or to `vflow` inputs; see Configuration.

## Demo code

The demos import `@docs/shared`, which belongs to the docs site, not to a package:

- `DocsPresentations` (`<docs-node>`, `<docs-edge>`) are plain `@vflow/ui` presentations, listed in
  [docs-shared](references/docs-shared.md). Copy them or write your own templates.
- `DocsKit` and `DemoIconComponent` are the buttons and toolbars of the demo frame. Use the application's own
  controls.
