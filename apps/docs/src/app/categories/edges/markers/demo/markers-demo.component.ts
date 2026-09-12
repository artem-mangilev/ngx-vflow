import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import { Connection, ConnectionSettings, Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    [connection]="connectionSettings"
    (connect)="createEdge($event)">
    <ng-template let-ctx nodeHtml><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx groupNode><docs-group [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edgeLabelHtml><docs-edge-label [ctx]="ctx" /></ng-template>
  </vflow> `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class MarkersDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'html-template',
      data: { text: `1` },
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: 'html-template',
      data: { text: `2` },
    },
  ]);

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
