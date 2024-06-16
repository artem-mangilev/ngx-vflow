import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { HotToastModule, HotToastService, provideHotToastConfig } from '@ngneat/hot-toast';
import { Connection, Edge, EdgeChange, Node, NodeAddChange, NodeChange, NodePositionChange, NodeSelectedChange, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './handling-changes-filtered-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule],
})
export class HandlingChangesFilteredDemoComponent {
  private toast = inject(HotToastService);

  @ViewChild('toast')
  public toastTemplate!: TemplateRef<unknown>;

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'default',
      text: `1`,
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: 'default',
      text: `2`
    },
  ]

  public edges: Edge[] = []

  public createEdge({ source, target }: Connection) {
    this.edges = [...this.edges, {
      id: `${source} -> ${target}`,
      source,
      target
    }]
  }

  public handleNodePositionChange(change: NodePositionChange) {
    this.toast.info(this.toastTemplate, {
      data: {
        title: '(onNodesChange.position.single)',
        json: JSON.stringify(change, null, 2)
      },
    })
  }

  public handleNodeSelectChange(change: NodeSelectedChange) {
    this.toast.info(this.toastTemplate, {
      data: {
        title: '(onNodesChange.select.single)',
        json: JSON.stringify(change, null, 2)
      },
    })
  }

  public handleNodesAddChange(changes: NodeAddChange[]) {
    this.toast.info(this.toastTemplate, {
      data: {
        title: '(onNodesChange.add.many)',
        json: JSON.stringify(changes, null, 2)
      },
    })
  }

  public handleEdgesAddChange(changes: EdgeChange[]) {
    this.toast.info(this.toastTemplate, {
      data: {
        title: '(onEdgesChange.add)',
        json: JSON.stringify(changes, null, 2)
      },
    })
  }

  public addNodes() {
    this.nodes = [...this.nodes,
    {
      id: crypto.randomUUID(),
      point: { x: 0, y: 0 },
      type: 'default',
      text: `random`,
    },
    {
      id: crypto.randomUUID(),
      point: { x: 300, y: 300 },
      type: 'default',
      text: `random`
    },
    ]
  }
}
