import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Position, Vflow, createEdges, createNodes, removeElements } from 'ngx-vflow';

interface StepData {
  title: string;
  /** The side of the node its toolbar sits at. */
  toolbar: Position;
}

@Component({
  template: `<vflow #flow [nodes]="nodes()" [edges]="edges()" (initialized)="flow.fitView({ maxZoom: 1 })">
    <article *vNode="let ctx of nodes()" vuiNode class="w-40 text-[13px]">
      <div vuiRow>
        <span vuiTitle>{{ ctx.data().title }}</span>
      </div>
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>

      <!-- Directly inside the node box, which is the positioned element the toolbar is placed against. -->
      <v-node-toolbar [position]="ctx.data().toolbar">
        <div vuiToolbar>
          <button docsButton="plain" small type="button" (click)="remove(ctx.node.id)">Delete</button>
        </div>
      </v-node-toolbar>
    </article>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui],
})
export class NodeToolbarDemoComponent {
  protected readonly nodes = signal(
    createNodes<StepData>([
      { id: 'fetch', point: { x: 0, y: 0 }, data: { title: 'Fetch orders', toolbar: 'top' } },
      { id: 'remind', point: { x: 240, y: 70 }, data: { title: 'Send reminder', toolbar: 'bottom' } },
    ]),
  );

  protected readonly edges = signal(createEdges([{ id: 'fetch-remind', source: 'fetch', target: 'remind' }]));

  /** Removes the node together with the edges attached to it. */
  protected remove(nodeId: string): void {
    const { nodes, edges } = removeElements({ nodeIds: [nodeId] }, { nodes: this.nodes(), edges: this.edges() });

    this.nodes.set(nodes);
    this.edges.set(edges);
  }
}
