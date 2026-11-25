import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Connection, ConnectionSettings, Edge, NodeWithDefaults, Vflow, addEdges, createNodes } from 'ngx-vflow';

type ValueNode = NodeWithDefaults<{ text: string; value: string }>;

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

  protected readonly connection: ConnectionSettings<ValueNode> = {
    // A connection is valid when both of its ends carry the same type of value. Each end comes with its node.
    validator: ({ source, target }) => source.node.data().value === target.node.data().value,
  };

  // Runs for valid connections only.
  protected connect(connection: Connection): void {
    this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
  }
}
