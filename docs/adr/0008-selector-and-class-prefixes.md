# One prefix per package

Every public selector of core starts with `v`, and every selector of `@vflow/ui` with `vui`: `[vHandle]`, `[vSelectable]`, `[vDragHandle]`, `g[vEdgeInteraction]`, `[vResizable]`, `[vNoDrag]`, `<v-minimap>`, `<v-node-toolbar>`, `ng-template[vNode|vEdge|vConnection|vMarker]` and `*vEdgeLabel` in core; `[vuiNode]`, `[vuiPort]`, `<vui-controls>` in UI. The `vflow` element keeps its name. Short unprefixed names such as `selectable` or `resizable` could collide with other libraries in the same template, and a single prefix per package tells the reader which package an attribute belongs to.

Public core classes are `Vflow*Directive` / `Vflow*Component`, including the template directives and the `ngx-vflow/testing` mocks; UI classes and types are `Vui*` without a suffix. The minimap is spelled as one word everywhere (`VflowMinimapComponent`, `MinimapPosition`). A directive input that shares its selector's name is renamed with it (`vResizable`, `vEdgeLabelOrient`, `vMarker`). Old selectors get no aliases: the change ships in the 3.0 major with a migration table.

The same prefixes apply to the DOM and CSS contract: core CSS classes `.v-*` (internal ones included, with BEM modifiers such as `.v-resize-control--handle`), tokens `--v-*` and data attributes `data-v-*` (`data-v-handle-state`, `data-v-no-drag`); UI classes `.vui-*`, tokens `--vui-*` and data attributes `data-vui-*` (`data-vui-tone`, `data-vui-state`).

This supersedes the part of ADR-0001 that retained the `[resizable]` name and the `data-vflow-handle-*` attribute names of ADR-0007.

Considered and rejected: `vflow*` selectors for core, because they are long in every template and `@vflow/ui` already used `vflowNode`, `vflowEdge` and `vflowEdgeLabel`; keeping the template slots unprefixed because they only match on `ng-template`, since the prefix rule is easier to follow without exceptions; suffix-less core classes, because `Vflow` is already the imports array and `VflowComponent` would become an exception.
