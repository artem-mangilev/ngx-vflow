In this tutorial we build a small flow: three nodes drawn with our own HTML, an edge between two of them, and
handles that let the user connect the rest. It takes about ten minutes and ends with this:

{{ NgDocActions.demoPane("FirstFlowComponent") }}

## Install

`ngx-vflow` needs Angular 20 or later:

```bash
npm i ngx-vflow
```

The library needs no module, no global stylesheet and no `zone.js`.

## Render the first nodes

We start with a standalone component that imports `Vflow`, the set of components and directives of the library, and
passes an array of nodes to the `vflow` element. `createNodes()` turns plain objects into nodes: each needs an `id`
and a `point`, and carries our own fields in `data`.

Core draws nothing of a node itself, so we give it a template with the `vNode` directive:

{% raw %}

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createNodes, Vflow } from 'ngx-vflow';

@Component({
  selector: 'app-first-flow',
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vflow [nodes]="nodes">
      <div *vNode="let ctx of nodes" class="step">{{ ctx.data().label }}</div>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 320px;
    }

    .step {
      padding: 10px 16px;
      border: 1px solid GrayText;
      border-radius: 8px;
      background: Canvas;
      color: CanvasText;
      font-size: 14px;
    }
  `,
})
export class FirstFlowComponent {
  protected readonly nodes = createNodes([
    { id: 'fetch', point: { x: 40, y: 120 }, data: { label: 'Fetch orders' } },
    { id: 'filter', point: { x: 280, y: 60 }, data: { label: 'Keep unpaid' } },
    { id: 'remind', point: { x: 280, y: 180 }, data: { label: 'Send reminder' } },
  ]);
}
```

{% endraw %}

Three cards appear. We can already drag them, pan the canvas by dragging its empty space, and zoom with the mouse
wheel. The flow fills its parent, which is why the host of the component has a size: it fills its own parent and is never shorter than 320 pixels. `of nodes` in the template
changes nothing on the screen: it tells the type checker which nodes the template draws, so `ctx.data()` has the
type of our `data`.

## Connect two nodes

An edge names the nodes it connects. We add an array with one edge and bind it:

```ts
import { signal } from '@angular/core';
import { Edge } from 'ngx-vflow';

protected readonly edges = signal<Edge[]>([{ id: 'fetch-filter', source: 'fetch', target: 'filter' }]);
```

Nothing is drawn yet, for two reasons: an edge attaches to handles, and core draws no line of its own. We put a
target handle and a source handle into the node, and add a template for edges that binds the path core computes:

{% raw %}

```html
<vflow [nodes]="nodes" [edges]="edges()">
  <div *vNode="let ctx of nodes" class="step">
    <span vHandle handleType="target" position="left" class="port"></span>
    {{ ctx.data().label }}
    <span vHandle handleType="source" position="right" class="port"></span>
  </div>

  <svg:g *vEdge="let ctx">
    <svg:path class="link" [attr.d]="ctx.path()" />
  </svg:g>
</vflow>
```

{% endraw %}

```css
.port {
  width: 10px;
  height: 10px;
  border: 1px solid GrayText;
  border-radius: 50%;
  background: Canvas;
}

.link {
  fill: none;
  stroke: GrayText;
  stroke-width: 2;
}
```

A line now runs from "Fetch orders" to "Keep unpaid" and follows the nodes when we drag them.

## Let the user connect nodes

Dragging from a source handle to a target handle already shows a preview line, but it leaves no edge behind: the
graph belongs to our component, so the flow only reports the connection. We handle the `(connect)` event and add the
edge ourselves with `addEdges()`:

```html
<vflow [nodes]="nodes" [edges]="edges()" (connect)="connect($event)">…</vflow>
```

```ts
import { addEdges, Connection } from 'ngx-vflow';

protected connect(connection: Connection): void {
  this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
}
```

Now a drag from "Fetch orders" to "Send reminder" creates the second edge.

While the dragged line can end at a handle, core sets `data-v-handle-state="valid"` on that handle. We fill the
port in that state, so the user sees where the edge will land:

```css
.port[data-v-handle-state='valid'] {
  background: Highlight;
}
```

## Show the selection

A click selects a node or an edge, and their templates learn it from `ctx.selected()`. We bind a class to it:

```html
<div *vNode="let ctx of nodes" class="step" [class.step--selected]="ctx.selected()">…</div>

<svg:path class="link" [class.link--selected]="ctx.selected()" [attr.d]="ctx.path()" />
```

```css
.step--selected {
  border-color: Highlight;
  box-shadow: 0 0 0 1px Highlight;
}

.link--selected {
  stroke: Highlight;
}
```

## Fit the graph into the view

The nodes sit where their `point` puts them, whatever the size of the flow. To start with the whole graph in view,
we call `fitView()` when the flow reports its first layout; `maxZoom: 1` keeps a small graph at its real size:

```html
<vflow #flow [nodes]="nodes" [edges]="edges()" (connect)="connect($event)" (initialized)="flow.fitView({ maxZoom: 1 })"> … </vflow>
```

## The whole component

```typescript file="./demo/first-flow.component.ts"

```

## Where to go next

- [Controlling the viewport](/docs/viewport/viewport-control) has the other viewport methods.
- [Rendering nodes](/docs/nodes/rendering) draws nodes with components instead of one template.
- [Connections](/docs/handles/connections) validates connections and reconnects edges.
- [@vflow/ui](/packages/ui/overview) has ready node cards, ports and edges if you would rather not draw your own.
