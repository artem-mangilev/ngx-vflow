import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowPort } from '@vflow/ui';
import { Connection, Edge, Node, Vflow, addEdges, createNodes, injectNode } from 'ngx-vflow';

@Component({
  template: `
    <vflow view="auto" [nodes]="nodes" [edges]="edges" (connect)="createEdge($event)">
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
export class LooseConnectionDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      component: LooseConnectionNodeComponent,
      data: {
        text: 'Node 1',
      },
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      component: LooseConnectionNodeComponent,
      data: {
        text: 'Node 2',
      },
    },
  ]);

  public edges: Edge[] = [];

  public createEdge(connection: Connection) {
    const { source, target, sourceHandle, targetHandle } = connection;

    this.edges = addEdges(
      [
        {
          id: `${source}${sourceHandle} -> ${target}${targetHandle}`,
          ...connection,
          markers: signal({
            end: {
              type: 'arrow-closed',
            },
          }),
        },
      ],
      { nodes: this.nodes, edges: this.edges },
    );
  }
}

interface LooseConnectionNodeData {
  text: string;
}

@Component({
  template: `<div class="node">
    {{ ctx.data().text }}

    <span vflowPort handleType="any" position="top" handleId="a"></span>
    <span vflowPort handleType="any" position="right" handleId="b"></span>
    <span vflowPort handleType="any" position="bottom" handleId="c"></span>
    <span vflowPort handleType="any" position="left" handleId="d"></span>
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
export class LooseConnectionNodeComponent {
  protected readonly ctx = injectNode<LooseConnectionNodeData>();
}
