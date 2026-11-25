import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Connection, Edge, Vflow, addEdges, createEdge, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges()"
    (connect)="connect($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class DefaultConnectionDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'sender', point: { x: 0, y: 0 }, data: { text: 'Sender' } },
    { id: 'receiver', point: { x: 220, y: 90 }, data: { text: 'Receiver' } },
  ]);

  protected readonly edges = signal<Edge[]>([]);

  // The arrow shows the direction of the edge: from the source handle to the target handle, whichever was pressed.
  protected connect(connection: Connection): void {
    const edge = createEdge({ id: crypto.randomUUID(), ...connection, markers: { end: 'arrow-closed' } });

    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }
}
