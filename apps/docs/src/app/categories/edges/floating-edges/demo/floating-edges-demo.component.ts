import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowPort } from '@vflow/ui';
import { ConnectionSettings, Edge, Node, Vflow, createNodes, injectNode } from 'ngx-vflow';

@Component({
  template: `
    <vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connection">
      <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>
      <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
    </vflow>
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
  imports: [DocsPresentations, Vflow],
})
export class FloatingEdgesDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      component: FloatingEdgesNodeComponent,
      data: {
        text: 'Node 1',
      },
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      component: FloatingEdgesNodeComponent,
      data: {
        text: 'Node 2',
      },
    },
    {
      id: '3',
      point: { x: 100, y: 300 },
      component: FloatingEdgesNodeComponent,
      data: {
        text: 'Node 3',
      },
    },
  ]);

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
    {{ ctx.data().text }}

    <span vflowPort type="source" position="top" id="a"></span>
    <span vflowPort type="source" position="right" id="b"></span>
    <span vflowPort type="source" position="bottom" id="c"></span>
    <span vflowPort type="source" position="left" id="d"></span>
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
  imports: [Vflow, VflowPort],
})
export class FloatingEdgesNodeComponent {
  protected readonly ctx = injectNode<FloatingEdgesNodeData>();
}
