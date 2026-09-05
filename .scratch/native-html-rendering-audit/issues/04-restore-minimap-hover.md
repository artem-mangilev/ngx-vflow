# Remove minimap hover scaling

Status: ready-for-agent
Priority: P1

## Decision

`MiniMapComponent.scaleOnHover` is no longer needed. Instead of making the fixed minimap SVG receive pointer input solely to restore this feature, remove hover scaling from the v3 API.

Relevant code:

- `projects/ngx-vflow-lib/src/lib/vflow/components/vflow/vflow.component.scss`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/minimap/minimap.component.html`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/minimap/minimap.component.ts`

## Required change

- Remove the `scaleOnHover` input from `MiniMapComponent` and its testing mock.
- Remove the hover event handlers and reactive scaling state.
- Keep the minimap at its existing default scale.
- Remove `scaleOnHover` usage from the demo and mock compilation fixture.
- Keep the fixed minimap SVG transparent to pointer input so the underlying pane remains interactive.

## Acceptance

- Production and testing public APIs no longer expose `scaleOnHover`.
- The minimap demo and testing fixture compile without the removed input.
- The minimap remains visible at its default scale.
- Pane pan/zoom is not blocked by the full-size minimap SVG.

## Comments
