import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Connection, Edge, Node, Vflow, addEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" (connect)="createEdge($event)" /> `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class DefaultConnectionDemoComponent {
  public nodes: Node[] = createNodes([
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
      text: `2`,
    },
  ]);

  public edges: Edge[] = [];

  public createEdge(connection: Connection) {
    this.edges = addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges: this.edges });
  }
}
