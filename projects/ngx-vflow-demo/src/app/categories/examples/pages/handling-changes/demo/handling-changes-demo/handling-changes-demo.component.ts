import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { Connection, Edge, EdgeChange, Node, NodeChange, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './handling-changes-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule],
})
export class HandlingChangesDemoComponent {
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

  public handleNodeChanges(changes: NodeChange[]) {
    this.toast.info(this.toastTemplate, {
      data: {
        title: '(onNodesChange)',
        json: JSON.stringify(changes, null, 2)
      },
    })
  }

  public handleEdgeChanges(changes: EdgeChange[]) {
    this.toast.info(this.toastTemplate, {
      data: {
        title: '(onEdgesChange)',
        json: JSON.stringify(changes, null, 2)
      },
    })
  }
}
