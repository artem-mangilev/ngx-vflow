import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { ConnectEndEvent, Connection, Edge, Vflow, addEdges, addNodes, createNodes } from 'ngx-vflow';

/** The size of a `docs-node` card, to put the handle of the new node under the pointer. */
const CARD = { width: 100, height: 50 };

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes()"
    [edges]="edges()"
    (initialized)="flow.fitView({ maxZoom: 1 })"
    (connect)="connect($event)"
    (connectEnd)="addOnDrop($event)">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class AddNodeOnDropDemoComponent {
  protected readonly nodes = signal(
    createNodes([
      { id: 'start', point: { x: 0, y: 0 }, data: { text: 'Start' } },
      { id: 'end', point: { x: 360, y: 120 }, data: { text: 'End' } },
    ]),
  );
  protected readonly edges = signal<Edge[]>([]);
  private count = 0;

  protected connect(connection: Connection): void {
    this.edges.update((edges) =>
      addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes(), edges }),
    );
  }

  /** A connection released on a handle is a `(connect)`; released over the canvas, `to` is `null`. */
  protected addOnDrop(event: ConnectEndEvent): void {
    if (event.to) return;

    // Dragged out of a source handle, the new node is the target and its left handle lands under the pointer;
    // dragged out of a target handle, it is the source and its right handle does.
    const fromSource = event.from.handle.type === 'source';
    const id = crypto.randomUUID();
    const [node] = createNodes([
      {
        id,
        point: { x: event.point.x - (fromSource ? 0 : CARD.width), y: event.point.y - CARD.height / 2 },
        data: { text: `Step ${++this.count}` },
      },
    ]);
    const connection: Connection = fromSource
      ? { source: event.from.node.id, sourceHandle: event.from.handle.id, target: id }
      : { source: id, target: event.from.node.id, targetHandle: event.from.handle.id };

    this.nodes.update((nodes) => addNodes([node], nodes));
    this.connect(connection);
  }
}
