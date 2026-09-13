---
keyword: 'FeaturesDefaultNodes'
---

Core is headless: it owns geometry, interaction and accessibility, and renders a node through the
template you provide. Pass a `nodes` array and an `<ng-template nodeHtml>` to `vflow`. Nodes of type
`html-template` carry your `data`; the template receives it through `ctx.data()` together with
`ctx.selected()` and `ctx.preselected()`.

The documentation demos share a few small presentation components built on `@vflow/ui`
(`docs-node`, `docs-group`, `docs-edge`, `docs-edge-label`), so each feature page can focus on its feature.
Copy them or write your own; see `*FeaturesCustomNodes` for templates and components.

{{ NgDocActions.demoPane("DefaultNodesDemoComponent") }}

## Name and size

- `ariaLabel` gives the node its accessible name; without it core uses `Node {id}`.
- `width` and `height` are optional initial dimensions; the rendered template is measured afterwards.
- Handles are part of your template: place `<handle>` elements where connections should attach.
