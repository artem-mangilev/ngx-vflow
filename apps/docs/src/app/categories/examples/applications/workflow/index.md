Cards, headers, footers, status badges, edge labels and a node toolbar all use consumer DOM. Approve is an
ordinary native button inside a node: the decision updates the statuses and shows on the graph, where the approved
branch is taken and the other one is ruled out. This recipe displays application state and does not execute a
workflow.

{{ NgDocActions.demo("WorkflowDemoComponent", { container: false }) }}

```typescript file="./workflow-demo.component.ts"

```

## What the example shows

- Cards with header, body and footer; status and selection shown at the same time.
- Branching with one exit per branch: `handleId` on the source handles keeps the branches apart from the start, so each condition label sits at the start of its edge.
- Edge labels at the start, center and end of an edge follow its geometry.
- Process state is the application's own: utilities on the edge path, keyed on its `data-state` attribute, draw taken and ruled-out edges, and a selected edge keeps the library color.
- A display-only graph needs no visible ports: plain `vHandle` elements anchor the edges.

See [@vflow/ui](/packages/ui/overview) for setup and the shared token contract.
