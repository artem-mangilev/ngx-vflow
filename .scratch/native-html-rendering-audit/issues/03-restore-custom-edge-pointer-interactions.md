# Restore custom-edge pointer interactions

Status: ready-for-agent
Priority: P1

## Problem

The new per-edge SVG host sets `pointer-events: none`. Default edges opt their interaction path back into pointer handling, but custom template edges do not. Runtime hit-testing returns `.vflow-pane`, so custom edges cannot be selected, elevated, clicked, or used by mouse/touch behaviors.

Relevant code:

- `projects/ngx-vflow-lib/src/lib/vflow/components/edge/edge.component.scss`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/custom-template-edge/custom-template-edge.component.scss`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/custom-template-edge/custom-template-edge.component.ts`
- `projects/ngx-vflow-demo/src/app/categories/cookbook/delete-selected/demo/delete-selected-demo.component.html`

## Required behavior

- The intended visible/interaction stroke of a custom edge receives pointer input.
- Empty areas of the edge SVG continue to pass events to nodes and the pane.
- Mouse and touch selection/elevation behavior matches default edges.
- Consumer-authored edge templates have a documented way to opt an interaction path into pointer events.

## Acceptance

- The custom-edges and delete-selected demos can select and act on a custom edge.
- Hit-testing on the interaction stroke returns the edge path; hit-testing outside it returns the underlying pane or node.
- Canvas pan is not blocked by the full bounds of an edge SVG.
- Add focused browser coverage for custom edge selection and click behavior.

## Comments
