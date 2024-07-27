import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { DirectedGraph, VertexRef } from '@vizdom/vizdom-ts-esm';
import { Edge, Node, VflowComponent, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './workflow-builder-demo.component.html',
  styleUrls: ['./workflow-builder-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class WorkflowBuilderDemoComponent implements OnInit {
  @ViewChild(VflowComponent)
  vflow!: VflowComponent

  public nodes: Node[] = [
    {
      id: crypto.randomUUID(),
      point: { x: 0, y: 0 },
      type: 'html-template',
    }
  ]

  public edges: Edge[] = []

  ngOnInit(): void {
    this.layout()
  }

  onNodeClick(node: Node) {
    const newNodeId = crypto.randomUUID()

    this.nodes.push({
      id: newNodeId,
      point: { x: 0, y: 0 },
      type: 'html-template',
    })

    this.edges = [...this.edges, {
      source: node.id,
      target: newNodeId,
      id: `${node.id} -> ${newNodeId}`
    }]

    this.layout()

    setTimeout(() => {
      this.vflow.fitView({ duration: 750 })
    });
  }

  private layout() {
    const graph = new DirectedGraph()

    const vertices = new Map<string, VertexRef>()

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
        id: n.id,
        point: {
          x: n.x,
          y: n.y
        },
        type: 'html-template'
      }
    })

    graph.free()
  }
}

declare module '@vizdom/vizdom-ts-esm' {
  type FontSize = any;
  type PenWidth = any;
}