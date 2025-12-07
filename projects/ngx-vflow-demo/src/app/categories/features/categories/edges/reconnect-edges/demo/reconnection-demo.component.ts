import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, ReconnectionEvent, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" (reconnect)="reconnect($event)" /> `,
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
export class ReconnectionDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'default',
      text: signal(`1`),
    },
    {
      id: '2',
      point: signal({ x: 600, y: 100 }),
      type: 'default',
      text: signal(`2`),
    },
    {
      id: '3',
      point: signal({ x: 100, y: 300 }),
      type: 'default',
      text: signal(`3`),
    },
    {
      id: '4',
      point: signal({ x: 600, y: 300 }),
      type: 'default',
      text: signal(`4`),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      type: 'default',
      reconnectable: signal(true),
      edgeLabels: signal({
        center: {
          type: 'default',
          text: 'Reconnectable from both sides',
          style: {
            color: 'black',
            lineHeight: '80%',
            borderRadius: '5px',
          },
        },
      }),
    },
    {
      id: '3 -> 4',
      source: '3',
      target: '4',
      type: 'default',
      reconnectable: signal('source'),
      edgeLabels: signal({
        center: {
          type: 'default',
          text: 'Reconnectable only from source side',
          style: {
            color: 'black',
            lineHeight: '80%',
            borderRadius: '5px',
          },
        },
      }),
    },
  ];

  public reconnect({ oldEdge, connection: { source, target } }: ReconnectionEvent) {
    this.edges = [
      ...this.edges.filter((edge) => edge !== oldEdge),
      {
        ...oldEdge,
        id: `${source} -> ${target}`,
        source,
        target,
      },
    ];
  }
}
