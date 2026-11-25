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
export class CurvesDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'request', point: { x: 0, y: 55 }, data: { text: 'Request' } },
    { id: 'cache', point: { x: 240, y: 0 }, data: { text: 'Cache' } },
    { id: 'database', point: { x: 240, y: 110 }, data: { text: 'Database' } },
    { id: 'event', point: { x: 0, y: 235 }, data: { text: 'Event' } },
    { id: 'search', point: { x: 240, y: 180 }, data: { text: 'Search' } },
    { id: 'queue', point: { x: 240, y: 290 }, data: { text: 'Queue' } },
    { id: 'response', point: { x: 480, y: 145 }, data: { text: 'Response' } },
  ]);

  // Each edge is labeled with the name of its curve.
  protected readonly edges = signal(
    createEdges([
      { id: 'request-cache', source: 'request', target: 'cache', curve: 'smooth-step', data: { label: 'smooth-step' } },
      { id: 'request-database', source: 'request', target: 'database', curve: 'bezier', data: { label: 'bezier' } },
      { id: 'event-search', source: 'event', target: 'search', curve: 'straight', data: { label: 'straight' } },
      { id: 'event-queue', source: 'event', target: 'queue', curve: 'step', data: { label: 'step' } },
    ]),
  );

  /** The line that follows the pointer while a connection is dragged. */
  protected readonly connection: ConnectionSettings = { curve: 'smooth-step' };

  // The new edge takes the curve of the connection line, so the line does not change shape on release.
  protected connect(connection: Connection): void {
    const edge = createEdge({
      id: crypto.randomUUID(),
      ...connection,
      curve: 'smooth-step',
      data: { label: 'smooth-step' },
    });

    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }
}
