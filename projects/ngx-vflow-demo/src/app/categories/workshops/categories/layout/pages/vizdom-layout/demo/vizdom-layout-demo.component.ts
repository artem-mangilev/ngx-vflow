import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  viewChild,
} from '@angular/core';
import { DirectedGraph, VertexRef } from '@vizdom/vizdom-ts-esm';
import {
  Edge,
  Node,
  VflowComponent,
  VflowModule,
} from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vizdom-layout-demo.component.html',
  styleUrls: ['./vizdom-layout-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule],
})
export class VizdomLayoutDemoComponent implements OnInit {
  vflow = viewChild(VflowComponent);

  public nodes: Node[] = [];

  public edges: Edge[] = [];

  ngOnInit(): void {
    // default layout with one node
    this.layout([
      {
        id: crypto.randomUUID(),
        point: { x: 0, y: 0 },
        type: 'html-template',
        data: {
          color: randomHex(),
        },
        draggable: false,
      },
    ]);
  }

  onNodeClick(node: Node) {
    const newNodeId = crypto.randomUUID();

    const nodes: Node[] = [
      ...this.nodes,
      {
        id: newNodeId,
        point: { x: 0, y: 0 },
        type: 'html-template',
        draggable: false,
        data: {
          color: randomHex(),
        },
      },
    ];

    const edges: Edge[] = [
      ...this.edges,
      {
        source: node.id,
        target: newNodeId,
        id: `${node.id} -> ${newNodeId}`,
      },
    ];

    this.layout(nodes, edges);
  }

  protected fitView() {
    // do not fit when there is initial node
    if (this.nodes.length > 1) {
      this.vflow().fitView({ duration: 750 });
    }
  }

  /**
   * Method that responsible to layout and render passed nodes and edges
   */
  private layout(nodesToLayout: Node[], edgesToLayout: Edge[] = []) {
    const graph = new DirectedGraph({
      layout: {
        margin_x: 75,
      },
    });

    // DirectedGraph not provide VErtexRef ids so we need to store it somewhere
    // for later access
    const vertices = new Map<string, VertexRef>();
    const nodes = new Map<string, Node>();

    nodesToLayout.forEach((n) => {
      const v = graph.new_vertex(
        {
          // For now we only can use static sized nodes
          layout: {
            shape_w: 150,
            shape_h: 100,
          },
          render: {
            id: n.id,
          },
        },
        {
          compute_bounding_box: false,
        },
      );

      vertices.set(n.id, v);
      nodes.set(n.id, n);
    });

    edgesToLayout.forEach((e) => {
      graph.new_edge(vertices.get(e.source)!, vertices.get(e.target)!);
    });

    // Compute layout with vizdom internal algorythm
    const layout = graph.layout().to_json().to_obj();

    // Render nodes and edges based on this layout
    this.nodes = layout.nodes.map((n) => {
      return {
        ...nodes.get(n.id)!,
        id: n.id,
        point: {
          x: n.x,
          y: n.y,
        },
      };
    });
    this.edges = edgesToLayout;
  }
}

function randomHex() {
  const hexValues = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length);
    hex += hexValues[index];
  }

  return hex;
}
