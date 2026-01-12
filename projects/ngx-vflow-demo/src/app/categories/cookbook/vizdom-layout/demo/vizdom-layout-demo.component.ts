import { ChangeDetectionStrategy, Component, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
import init, { DirectedGraph, VertexWeakRef } from '@vizdom/vizdom-ts-web';
import { Node, Edge, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  templateUrl: './vizdom-layout-demo.component.html',
  styleUrls: ['./vizdom-layout-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class VizdomLayoutDemoComponent implements OnInit {
  public vflow = viewChild.required(VflowComponent);

  public nodes: WritableSignal<Node[]> = signal([]);

  public edges: WritableSignal<Edge[]> = signal([]);

  async ngOnInit(): Promise<void> {
    try {
      await init('assets/vizdom/vizdom_ts_bg.wasm');
    } catch (error) {
      console.error('Failed to initialize WebAssembly:', error);
    }

    // default layout with one node
    this.layout([
      {
        id: crypto.randomUUID(),
        point: signal({ x: 0, y: 0 }),
        type: 'html-template',
        data: signal({
          color: randomHex(),
        }),
        draggable: signal(false),
      },
    ]);
  }

  onNodeClick(node: Node) {
    const newNodeId = crypto.randomUUID();

    const nodes: Node[] = [
      ...this.nodes(),
      {
        id: newNodeId,
        point: signal({ x: 0, y: 0 }),
        type: 'html-template',
        draggable: signal(false),
        data: signal({
          color: randomHex(),
        }),
      },
    ];

    const edges: Edge[] = [
      ...this.edges(),
      {
        source: node.id,
        target: newNodeId,
        id: `${node.id} -> ${newNodeId}`,
        curve: signal('smooth-step'),
      },
    ];

    this.layout(nodes, edges);
  }

  protected fitView() {
    // do not fit when there is initial node
    if (this.nodes().length > 1) {
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

    // DirectedGraph not provide VertexWeakRef ids so we need to store it somewhere
    // for later access
    const vertices = new Map<string, VertexWeakRef>();
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
    layout.nodes.forEach((n) => {
      const node = nodes.get(n.id!)!;

      node.point.set({ x: n.x, y: n.y });
    });

    this.nodes.set(nodesToLayout);
    this.edges.set(edgesToLayout);
  }
}

function randomHex() {
  const hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length);
    hex += hexValues[index];
  }

  return hex;
}
