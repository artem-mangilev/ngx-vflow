import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import { Connection, ConnectionSettings, Edge, Node, Vflow, addEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    [connection]="conectionSettings"
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
export class ConnectionValidationDemoComponent {
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

  public conectionSettings: ConnectionSettings = {
    validator: (connection) => connection.source === '1' && connection.target === '2',
  };

  public createEdge(connection: Connection) {
    this.edges = addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges: this.edges });
  }
}
