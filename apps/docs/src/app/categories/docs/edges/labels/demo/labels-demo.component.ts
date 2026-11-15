import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Edge, EdgeLabelOrient, Vflow, createEdges, createNodes, removeEdges } from 'ngx-vflow';

/** A relation of a data model: what it means, and how many records stand at each of its ends. */
interface RelationData {
  start?: string;
  center: string;
  end?: string;
  /** How the center label sits on the path; horizontal without it. */
  orient?: EdgeLabelOrient;
  removable?: boolean;
}

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges()" (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />

    <ng-template let-ctx vEdge [vEdgeOf]="edges()">
      @let data = ctx.data();

      <svg:g vEdgeInteractionArea>
        <svg:path vuiEdge [attr.d]="ctx.path()" />
      </svg:g>

      @if (data.start; as text) {
        <span *vEdgeLabel="'start'" vuiEdgeLabel>{{ text }}</span>
      }
      <span *vEdgeLabel="'center'; orient: data.orient" vuiEdgeLabel>{{ data.center }}</span>
      @if (data.end; as text) {
        <span *vEdgeLabel="'end'" vuiEdgeLabel>{{ text }}</span>
      }
      @if (data.removable) {
        <!-- A label is HTML, so it can be a control of the edge. -->
        <!-- The neutral button is translucent; an opaque surface with a border keeps the line from showing through. -->
        <button
          *vEdgeLabel="'end'"
          docsButton
          small
          type="button"
          class="border-vui-border! bg-vui-surface!"
          (click)="remove(ctx.edge)">
          Remove
        </button>
      }
    </ng-template>
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui],
})
export class LabelsDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'customer', point: { x: 0, y: 75 }, data: { text: 'Customer' } },
    { id: 'order', point: { x: 440, y: 0 }, data: { text: 'Order' } },
    { id: 'review', point: { x: 440, y: 150 }, data: { text: 'Review' } },
  ]);

  protected readonly edges = signal(
    createEdges<RelationData>([
      {
        id: 'customer-order',
        source: 'customer',
        target: 'order',
        curve: 'smooth-step',
        data: { start: '1', center: 'places', end: 'many' },
      },
      {
        id: 'customer-review',
        source: 'customer',
        target: 'review',
        data: { center: 'writes', orient: 'path', removable: true },
      },
    ]),
  );

  protected remove(edge: Edge<RelationData>): void {
    this.edges.update((edges) => removeEdges([edge.id], edges));
  }
}
