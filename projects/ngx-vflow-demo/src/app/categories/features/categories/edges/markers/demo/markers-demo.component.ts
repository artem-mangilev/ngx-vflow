import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Connection, ConnectionSettings, Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    [connection]="connectionSettings"
    (connect)="createEdge($event)" /> `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class MarkersDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'default',
      text: signal(`1`),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 200 }),
      type: 'default',
      text: signal(`2`),
    },
  ];

  public edges: Edge[] = [];

  public connectionSettings: ConnectionSettings = {
    marker: {
      type: 'arrow',
    },
  };

  public createEdge(connection: Connection) {
    this.edges = [
      ...this.edges,
      {
        ...connection,
        id: `${connection.source} -> ${connection.target}`,
        markers: signal({
          start: {
            type: 'arrow-closed',
          },
          end: {
            type: 'arrow',
          },
        }),
      },
    ];
  }
}
