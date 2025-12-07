import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  standalone: true,
  imports: [Vflow],
})
export class FloatingEdgesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: FloatingEdgesNodeComponent,
      data: signal({
        text: 'Node 1',
      }),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 200 }),
      type: FloatingEdgesNodeComponent,
      data: signal({
        text: 'Node 2',
      }),
    },
    {
      id: '3',
      point: signal({ x: 100, y: 300 }),
      type: FloatingEdgesNodeComponent,
      data: signal({
        text: 'Node 3',
      }),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      markers: signal({
        end: {
          type: 'arrow-closed',
        },
      }),
      floating: signal(true),
    },
    {
      id: '2 -> 3',
      source: '2',
      target: '3',
      markers: signal({
        end: {
          type: 'arrow-closed',
        },
      }),
      floating: signal(true),
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
        width: signal(100px;)
        height: signal(50px;)
        border: 1.5px solid #1b262c;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: signal(black;)
        background-color: white;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class FloatingEdgesNodeComponent extends CustomNodeComponent<FloatingEdgesNodeData> {}
