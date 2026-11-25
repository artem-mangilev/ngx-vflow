import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Connection, Vflow, addEdges, createEdge, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Drag from any port to any port of another device: the arrow keeps the direction of the drag.</p>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges()"
      (connect)="connect($event)"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <div *vNode="let ctx" vuiNode class="grid h-12.5 w-25 place-items-center text-[13px]">
        {{ ctx.data().text }}

        <span vuiPort handleType="any" position="top" handleId="top"></span>
        <span vuiPort handleType="any" position="right" handleId="right"></span>
        <span vuiPort handleType="any" position="bottom" handleId="bottom"></span>
        <span vuiPort handleType="any" position="left" handleId="left"></span>
      </div>

      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui],
})
export class LooseConnectionDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'laptop', point: { x: 0, y: 0 }, data: { text: 'Laptop' } },
    { id: 'tablet', point: { x: 280, y: 0 }, data: { text: 'Tablet' } },
    { id: 'phone', point: { x: 140, y: 130 }, data: { text: 'Phone' } },
  ]);

  protected readonly edges = signal(
    createEdges([
      {
        id: 'laptop:right-tablet:left',
        source: 'laptop',
        sourceHandle: 'right',
        target: 'tablet',
        targetHandle: 'left',
        markers: { end: 'arrow-closed' },
      },
    ]),
  );

  // The handle ids are part of the edge id: two devices may be connected through several pairs of ports.
  protected connect(connection: Connection): void {
    const { source, sourceHandle, target, targetHandle } = connection;
    const edge = createEdge({
      id: `${source}:${sourceHandle}-${target}:${targetHandle}`,
      ...connection,
      markers: { end: 'arrow-closed' },
    });

    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }
}
