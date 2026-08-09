# Restore minimap hover interaction

Status: ready-for-agent
Priority: P1

## Problem

`.vflow-minimap-svg` has `pointer-events: none`, so the nested minimap never receives its `mouseover` and `mouseleave` events. `MiniMapComponent.scaleOnHover` therefore cannot change the minimap scale.

Relevant code:

- `projects/ngx-vflow-lib/src/lib/vflow/components/vflow/vflow.component.scss`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/minimap/minimap.component.html`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/minimap/minimap.component.ts`

## Required behavior

- The visible minimap interaction area receives pointer input when hover scaling or minimap interaction needs it.
- Transparent space in the fixed full-size minimap SVG does not block the underlying pane.
- Existing minimap pan/zoom options remain functional.

## Acceptance

- With `scaleOnHover` enabled, entering and leaving the minimap visibly changes and restores its size.
- Hit-testing outside the minimap content still reaches `.vflow-pane`.
- Add focused browser coverage for hover and at least one minimap interaction mode.

## Comments
