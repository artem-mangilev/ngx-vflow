import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Connection, ConnectionSettings, Vflow, addEdges, createEdge, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges()"
    [connection]="connection"
    (connect)="connect($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class MarkersDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'web', point: { x: 0, y: 0 }, data: { text: 'Web' } },
    { id: 'mobile', point: { x: 0, y: 90 }, data: { text: 'Mobile' } },
    { id: 'desktop', point: { x: 0, y: 180 }, data: { text: 'Desktop' } },
    { id: 'api', point: { x: 340, y: 0 }, data: { text: 'API' } },
    { id: 'auth', point: { x: 340, y: 90 }, data: { text: 'Auth' } },
    { id: 'sync', point: { x: 340, y: 180 }, data: { text: 'Sync' } },
  ]);

  // Each edge is labeled with its markers. The nodes of different rows are left for you to connect.
  protected readonly edges = signal(
    createEdges<{ label?: string }>([
      { id: 'web-api', source: 'web', target: 'api', markers: { end: 'arrow' }, data: { label: 'arrow' } },
      {
        id: 'mobile-auth',
        source: 'mobile',
        target: 'auth',
        markers: { end: { type: 'arrow-closed', width: 26 } },
        data: { label: 'arrow-closed, 26 wide' },
      },
      {
        id: 'desktop-sync',
        source: 'desktop',
        target: 'sync',
        markers: { start: 'arrow-closed', end: 'arrow-closed' },
        data: { label: 'start and end' },
      },
    ]),
  );

  /** The marker of the line that follows the pointer while a connection is dragged. */
  protected readonly connection: ConnectionSettings = { markerEnd: 'arrow' };

  // The new edge takes the marker of the connection line.
  protected connect(connection: Connection): void {
    const edge = createEdge<{ label?: string }>({
      id: crypto.randomUUID(),
      ...connection,
      markers: { end: 'arrow' },
    });

    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }
}
