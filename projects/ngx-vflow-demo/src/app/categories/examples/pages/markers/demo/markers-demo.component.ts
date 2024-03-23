import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Connection, ConnectionSettings, Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges"
    [connection]="connectionSettings"
    (onConnect)="createEdge($event)"/>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class MarkersDemoComponent {
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

  public connectionSettings: ConnectionSettings = {
    marker: {
      type: 'arrow'
    }
  }

  public createEdge(connection: Connection) {
    this.edges = [...this.edges, {
      ...connection,
      id: `${connection.source} -> ${connection.target}`,
      markers: {
        start: {
          type: 'arrow-closed'
        },
        end: {
          type: 'arrow'
        }
      }
    }]
  }
}
