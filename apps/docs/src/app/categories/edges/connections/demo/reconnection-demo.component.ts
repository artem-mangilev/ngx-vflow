import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import {
  Edge,
  Node,
  ReconnectEndEvent,
  ReconnectEvent,
  Vflow,
  reconnectEdges,
  removeEdges,
  createNodes,
} from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    (reconnectStart)="onReconnectStart()"
    (reconnectEnd)="onReconnectEnd($event)"
    (reconnect)="reconnect($event)">
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
export class ReconnectionDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'html-template',
      data: { text: `1` },
    },
    {
      id: '2',
      point: { x: 600, y: 100 },
      type: 'html-template',
      data: { text: `2` },
    },
    {
      id: '3',
      point: { x: 100, y: 300 },
      type: 'html-template',
      data: { text: `3` },
    },
    {
      id: '4',
      point: { x: 600, y: 300 },
      type: 'html-template',
      data: { text: `4` },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      reconnectable: signal(true),
      edgeLabels: signal({
        center: {
          type: 'html-template',
          data: 'Reconnectable from both sides',
        },
      }),
    },
    {
      id: '3 -> 4',
      source: '3',
      target: '4',
      reconnectable: signal('source'),
      edgeLabels: signal({
        center: {
          type: 'html-template',
          data: 'Reconnectable only from source side',
        },
      }),
    },
  ];

  private edgeReconnectSuccessful = signal(false);

  public onReconnectStart() {
    this.edgeReconnectSuccessful.set(false);
  }

  public onReconnectEnd(event: ReconnectEndEvent) {
    if (!this.edgeReconnectSuccessful()) {
      this.edges = removeEdges([event.edge.id], this.edges);
    }

    this.edgeReconnectSuccessful.set(true);
  }

  public reconnect({ oldEdge, connection }: ReconnectEvent) {
    this.edges = reconnectEdges([{ id: oldEdge.id, connection }], { nodes: this.nodes, edges: this.edges });

    this.edgeReconnectSuccessful.set(true);
  }
}
