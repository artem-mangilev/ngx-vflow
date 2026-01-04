import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConnectionSettings, CustomNodeComponent, Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: ` <vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connection" /> `,
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
export class FloatingEdgesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: FloatingEdgesNodeComponent,
      data: {
        text: 'Node 1',
      },
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: FloatingEdgesNodeComponent,
      data: {
        text: 'Node 2',
      },
    },
    {
      id: '3',
      point: { x: 100, y: 300 },
      type: FloatingEdgesNodeComponent,
      data: {
        text: 'Node 3',
      },
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      markers: {
        end: {
          type: 'arrow-closed',
        },
      },
      floating: true,
    },
    {
      id: '2 -> 3',
      source: '2',
      target: '3',
      markers: {
        end: {
          type: 'arrow-closed',
        },
      },
      floating: true,
    },
  ];

  public connection: ConnectionSettings = {
    mode: 'loose',
  };
}

interface FloatingEdgesNodeData {
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
export class FloatingEdgesNodeComponent extends CustomNodeComponent<FloatingEdgesNodeData> {}
