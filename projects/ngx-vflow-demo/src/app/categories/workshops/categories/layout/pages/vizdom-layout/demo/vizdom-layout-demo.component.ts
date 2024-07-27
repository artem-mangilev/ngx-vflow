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

  public nodes: Node[] = [
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

  public edges: Edge[] = []

  ngOnInit(): void {
    this.layout()
  }

  onNodeClick(node: Node) {
    const newNodeId = crypto.randomUUID()

    this.nodes = [...this.nodes, {
      id: newNodeId,
      point: { x: 0, y: 0 },
      type: 'html-template',
      draggable: false,
      data: {
        color: randomHex()
      }
    }]

    this.edges = [...this.edges, {
      source: node.id,
      target: newNodeId,
      id: `${node.id} -> ${newNodeId}`
    }]

    this.layout()
  }

  protected fitView() {
    this.vflow.fitView({ duration: 750 })
  }

  private layout() {
    const graph = new DirectedGraph({
      layout: {
        margin_x: 75
      }
    })

    const vertices = new Map<string, VertexRef>()
    const nodes = new Map<string, Node>()

    this.nodes.forEach(n => {
      const v = graph.new_vertex({
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

    this.edges.forEach(e => {
      graph.new_edge(
        vertices.get(e.source)!,
        vertices.get(e.target)!,
      )
    })

    const layout = graph.layout().to_json().to_obj()

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

    graph.free()
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

declare module '@vizdom/vizdom-ts-esm' {
  type FontSize = any;
  type PenWidth = any;
}
