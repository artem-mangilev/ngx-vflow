Cards, headers, footers, status badges, edge labels and a node toolbar all use consumer DOM. Approve is an
ordinary native button inside a node: the decision updates the statuses and shows on the graph, where the approved
branch is taken and the other one is ruled out. This recipe displays application state and does not execute a
workflow.

{{ NgDocActions.demo("WorkflowDemoComponent", { container: false }) }}

```typescript file="./workflow-demo.component.ts"

```

## What this page proves

- Cards with header, body and footer; status and selection shown at the same time.
- Branching with one exit per branch: `handleId` on the source handles keeps the branches apart from the start, so each condition label sits at the start of its edge.
- Edge labels at the start, center and end of an edge follow its geometry.
- Process state is application CSS on the public selectors: taken and ruled-out edges, with selection keeping the library color.
- A display-only graph needs no visible ports: plain `vHandle` elements anchor the edges.

See the `Overview` page for setup and the shared token contract.
