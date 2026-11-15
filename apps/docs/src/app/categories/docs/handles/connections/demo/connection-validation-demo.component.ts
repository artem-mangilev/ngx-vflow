import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Connection, ConnectionSettings, Edge, Vflow, addEdges, createNodes } from 'ngx-vflow';

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
export class ConnectionValidationDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'text-out', point: { x: 0, y: 0 }, data: { text: 'Text out', value: 'text' } },
    { id: 'number-out', point: { x: 0, y: 90 }, data: { text: 'Number out', value: 'number' } },
    { id: 'text-in', point: { x: 240, y: 0 }, data: { text: 'Text in', value: 'text' } },
    { id: 'number-in', point: { x: 240, y: 90 }, data: { text: 'Number in', value: 'number' } },
  ]);

  protected readonly edges = signal<Edge[]>([]);

  protected readonly connection: ConnectionSettings = {
    // A connection is valid when both of its ends carry the same type of value.
    validator: ({ source, target }) => this.valueOf(source) === this.valueOf(target),
  };

  // Runs for valid connections only.
  protected connect(connection: Connection): void {
    this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
  }

  private valueOf(nodeId: string): string | undefined {
    return this.nodes.find((node) => node.id === nodeId)?.data().value;
  }
}
