import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Connection, ConnectionSettings, Edge, Node, Vflow, addEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    data-vui-theme="light"
    [nodes]="nodes"
    [edges]="edges"
    [connection]="conectionSettings"
    (connect)="createEdge($event)"
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
export class ConnectionValidationDemoComponent {
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
      point: { x: 200, y: 200 },
      type: VflowCardNode,
      data: { text: `2` },
      ariaLabel: `2`,
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
