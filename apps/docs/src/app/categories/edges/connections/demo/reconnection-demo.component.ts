import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
    data-vui-theme="light"
    [nodes]="nodes"
    [edges]="edges"
    (reconnectStart)="onReconnectStart()"
    (reconnectEnd)="onReconnectEnd($event)"
    (reconnect)="reconnect($event)"
    ><ng-template let-ctx edge
      ><svg:g customTemplateEdge selectable>
        <svg:path
          class="vui-edge"
          [attr.d]="ctx.path()"
          [attr.marker-start]="ctx.markerStart()"
          [attr.marker-end]="ctx.markerEnd()"
          [attr.data-vui-selected]="ctx.selected() || ctx.preselected()" /></svg:g></ng-template
    ><ng-template let-ctx edgeLabelHtml
      ><span class="vui-edge-label">{{ ctx.label.data }}</span></ng-template
    ></vflow
  > `,
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
export class ReconnectionDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: VflowCardNode,
      data: { text: `1` },
      ariaLabel: `1`,
    },
    {
      id: '2',
      point: { x: 600, y: 100 },
      type: VflowCardNode,
      data: { text: `2` },
      ariaLabel: `2`,
    },
    {
      id: '3',
      point: { x: 100, y: 300 },
      type: VflowCardNode,
      data: { text: `3` },
      ariaLabel: `3`,
    },
    {
      id: '4',
      point: { x: 600, y: 300 },
      type: VflowCardNode,
      data: { text: `4` },
      ariaLabel: `4`,
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      type: 'template',
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
      type: 'template',
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
