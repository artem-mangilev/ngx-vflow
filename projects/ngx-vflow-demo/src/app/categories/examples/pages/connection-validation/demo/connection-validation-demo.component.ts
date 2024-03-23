import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Connection, ConnectionSettings, Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges"
    [connection]="conectionSettings"
    (onConnect)="createEdge($event)"/>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class ConnectionValidationDemoComponent {
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

  public conectionSettings: ConnectionSettings = {
    validator: (connection) => connection.source === '1' && connection.target === '2'
  }

  public createEdge({ source, target }: Connection) {
    this.edges = [...this.edges, {
      id: `${source} -> ${target}`,
      source,
      target
    }]
  }
}
