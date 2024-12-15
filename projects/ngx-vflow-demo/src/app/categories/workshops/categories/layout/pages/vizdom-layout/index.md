# {{ NgDocPage.title }}

> **Alert**
> The interactive example is temporarily unavailable due to issues arising from the migration of `ng-doc` from `Webpack` to `Vite`.

This is an example of using the [vizdom](https://github.com/vizdom-dev/vizdom-ts) library for computing layout.

```ts
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { DirectedGraph, VertexRef } from '@vizdom/vizdom-ts-esm';
import { Edge, Node, VflowComponent, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vizdom-layout-demo.component.html',
  styleUrls: ['./vizdom-layout-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class VizdomLayoutDemoComponent implements OnInit {
  @ViewChild(VflowComponent)
  vflow!: VflowComponent

  public nodes: Node[] = []

  public edges: Edge[] = []

  ngOnInit(): void {
    // default layout with one node
    this.layout(
      [
        {
          id: crypto.randomUUID(),
          point: { x: 0, y: 0 },
          type: 'html-template',
          data: {
            color: randomHex()
          },
          draggable: false
        }
      ]
    )
  }

  onNodeClick(node: Node) {
    const newNodeId = crypto.randomUUID()

    const nodes: Node[] = [...this.nodes, {
      id: newNodeId,
      point: { x: 0, y: 0 },
      type: 'html-template',
      draggable: false,
      data: {
        color: randomHex()
      }
    }]

    const edges: Edge[] = [...this.edges, {
      source: node.id,
      target: newNodeId,
      id: `${node.id} -> ${newNodeId}`
    }]

    this.layout(nodes, edges)
  }

  protected fitView() {
    // do not fit when there is initial node
    if (this.nodes.length > 1) {
      this.vflow.fitView({ duration: 750 })
    }
  }

  /**
   * Method that responsible to layout and render passed nodes and edges
   */
  private layout(nodesToLayout: Node[], edgesToLayout: Edge[] = []) {
    const graph = new DirectedGraph({
      layout: {
        margin_x: 75
      }
    })

    // DirectedGraph not provide VErtexRef ids so we need to store it somewhere
    // for later access
    const vertices = new Map<string, VertexRef>()
    const nodes = new Map<string, Node>()

    nodesToLayout.forEach(n => {
      const v = graph.new_vertex({
        // For now we only can use static sized nodes
        layout: {
          shape_w: 150,
          shape_h: 100
        },
        render: {
          id: n.id
        },
      }, {
        compute_bounding_box: false
      })

      vertices.set(n.id, v)
      nodes.set(n.id, n)
    })

    edgesToLayout.forEach(e => {
      graph.new_edge(
        vertices.get(e.source)!,
        vertices.get(e.target)!,
      )
    })

    // Compute layout with vizdom internal algorythm
    const layout = graph.layout().to_json().to_obj()

    // Render nodes and edges based on this layout
    this.nodes = layout.nodes.map(n => {
      return {
        ...nodes.get(n.id)!,
        id: n.id,
        point: {
          x: n.x,
          y: n.y
        },
      }
    })
    this.edges = edgesToLayout
  }
}

function randomHex() {
  const hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length)
    hex += hexValues[index];
  }

  return hex
}
```

```html
<vflow view="auto" [minZoom]="0.1" [nodes]="nodes" [edges]="edges" (onNodesChange.add)="fitView()">
  <ng-template nodeHtml let-ctx>
    <div (click)="onNodeClick(ctx.node)" [style.background-color]="ctx.node.data.color" class="custom-node">
      {{ ctx.node.data.color }}

      <handle type="source" position="bottom" />
      <handle type="target" position="top" />
    </div>
  </ng-template>
</vflow>
```

```scss
:host {
  width: 100%;
  height: 100%;
}

.custom-node {
  width: 100px;
  height: 50px;
  background: #bbe1fa;
  border: 1px solid gray;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```
