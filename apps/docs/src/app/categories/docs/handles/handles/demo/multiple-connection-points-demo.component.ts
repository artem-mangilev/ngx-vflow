import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Connection, Edge, Vflow, addEdges, createEdges, createNodes } from 'ngx-vflow';

interface Field {
  /** The `handleId` of the handle in the row of the field. */
  id: string;
  label: string;
}

/** A card with one row per field. `handles` says which way its fields connect. */
interface CardData {
  title: string;
  handles: 'source' | 'target';
  fields: Field[];
}

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges()"
    (connect)="connect($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <article *vNode="let ctx of nodes" vuiNode class="w-44 text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>{{ ctx.data().title }}</span>
      </header>

      @for (field of ctx.data().fields; track field.id) {
        <!-- A handle sits on the side of its parent element, so each one lines up with its row. -->
        <div vuiRow>
          {{ field.label }}

          @if (ctx.data().handles === 'source') {
            <span vuiPort handleType="source" position="right" [handleId]="field.id"></span>
          } @else {
            <span vuiPort handleType="target" position="left" [handleId]="field.id"></span>
          }
        </div>
      }
    </article>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class MultipleConnectionPointsDemoComponent {
  protected readonly nodes = createNodes<CardData>([
    {
      id: 'customer',
      point: { x: 0, y: 0 },
      data: {
        title: 'Customer',
        handles: 'source',
        fields: [
          { id: 'email', label: 'Email' },
          { id: 'name', label: 'Name' },
        ],
      },
    },
    {
      id: 'welcome-email',
      point: { x: 320, y: 40 },
      data: {
        title: 'Welcome email',
        handles: 'target',
        fields: [
          { id: 'recipient', label: 'Recipient' },
          { id: 'greeting', label: 'Greeting' },
        ],
      },
    },
  ]);

  // `sourceHandle` and `targetHandle` name the handles of the two fields an edge connects.
  protected readonly edges = signal<Edge[]>(
    createEdges([
      {
        id: 'email-recipient',
        source: 'customer',
        sourceHandle: 'email',
        target: 'welcome-email',
        targetHandle: 'recipient',
      },
    ]),
  );

  // The connection of a new edge carries the handle ids as well.
  protected connect(connection: Connection): void {
    this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
  }
}
