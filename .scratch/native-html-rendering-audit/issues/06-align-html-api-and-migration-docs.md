# Align the HTML-only API, testing entrypoint, and migration documentation

Status: ready-for-agent
Priority: P1

## Problem

The implementation moved group nodes, handles, and resize controls from SVG to HTML while retaining their public API names, but the contracts, testing entrypoint, and documentation remain inconsistent:

- Existing docs require SVG content for `groupNode`, custom handle `[template]`, and template-group `[resizable]`.
- Custom handle `ctx.point` changed from local placement coordinates to an absolute flow point, although placement now belongs to the library wrapper.
- `ngx-vflow/testing` still exports `NodeSvgTemplateMockDirective`, whose production directive was intentionally removed.
- The public migration page has no v3 native-HTML section.
- Architecture and performance documentation still refers to SVG nodes or the old SVG layer.

Relevant code and docs:

- `projects/ngx-vflow-lib/src/lib/vflow/models/handle.model.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/directives/template.directive.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/interfaces/template-context.interface.ts`
- `projects/ngx-vflow-lib/testing/src/directive-mocks/template-mock.directive.ts`
- `projects/ngx-vflow-lib/testing/src/public-api.ts`
- `projects/ngx-vflow-demo/src/app/categories/introduction/pages/migration/index.md`
- `projects/ngx-vflow-demo/src/app/categories/handles/pages/custom-handles/index.md`
- `projects/ngx-vflow-demo/src/app/categories/nodes/subflows/index.md`
- `projects/ngx-vflow-demo/src/app/categories/nodes/resizer/index.md`

## Agreed migration contract

- Keep the names `groupNode`, handle `[template]`, and `[resizable]`.
- Do not add runtime heuristics that inspect template roots for SVG content.
- These APIs accept native HTML content in v3; the migration guide explains the required rewrite with before/after examples.
- Remove `ctx.point` from the HTML handle template context. Keep `state` and `node`; do not add a replacement coordinate unless a separate use case establishes one.
- Remove the stale `NodeSvgTemplateMockDirective` export in lockstep with the intentional production removal.
- Document the intentional removal of `svg-template`, `NodeSvgTemplateDirective`, and `nodeSvgTemplate`.
- Document the intentional removal of `MiniMapComponent.scaleOnHover`.
- Describe exact private DOM structure as non-contractual while retaining documented classes and observable behavior as supported contracts.

## Acceptance

- Public API and testing builds contain no production or mock SVG-node directive.
- Handle template typing and examples no longer expose or use `ctx.point`.
- Group-node, custom-handle, and resizer examples contain native HTML rather than instructions to project standalone SVG shapes.
- The migration page has a v3 section covering all intentional and silent template-contract changes.
- `rg -n "foreignObject|nodeSvg|SVG nodes|made with SVG|SVG element" projects/ngx-vflow-demo projects/ngx-vflow-lib/README.md README.md` returns only deliberate historical/migration references.
- Library, testing entrypoint, demo build, and relevant tests pass.

## Comments
