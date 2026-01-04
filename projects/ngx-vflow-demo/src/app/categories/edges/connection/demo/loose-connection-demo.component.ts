import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Connection, ConnectionSettings, CustomNodeComponent, Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `
    <vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connection" (connect)="createEdge($event)" />
  `,
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
export class LooseConnectionDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: LooseConnectionNodeComponent,
      data: {
        text: 'Node 1',
      },
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: LooseConnectionNodeComponent,
      data: {
        text: 'Node 2',
      },
    },
  ];

  public edges: Edge[] = [];

  public connection: ConnectionSettings = {
    mode: 'loose',
  };

  public createEdge(connection: Connection) {
    const { source, target, sourceHandle, targetHandle } = connection;

    this.edges = [
      ...this.edges,
      {
        id: `${source}${sourceHandle} -> ${target}${targetHandle}`,
        ...connection,
        markers: {
          end: {
            type: 'arrow-closed',
          },
        },
      },
    ];
  }
}

interface LooseConnectionNodeData {
  text: string;
}

@Component({
  template: `<div class="node">
    {{ data()?.text }}

    <handle type="source" position="top" id="a" />
    <handle type="source" position="right" id="b" />
    <handle type="source" position="bottom" id="c" />
    <handle type="source" position="left" id="d" />
  </div>`,
  styles: [
    `
      .node {
        width: 100px;
        height: 50px;
        border: 1.5px solid #1b262c;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        background-color: white;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class LooseConnectionNodeComponent extends CustomNodeComponent<LooseConnectionNodeData> {}
