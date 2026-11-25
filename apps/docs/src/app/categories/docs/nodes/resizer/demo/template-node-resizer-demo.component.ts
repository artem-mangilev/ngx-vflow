import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <!-- The minimum size is plain CSS: the resizer stops there. -->
    <article
      *vNode="let ctx of nodes"
      vuiNode
      vResizable
      class="min-w-44 min-h-24 text-[13px]"
      data-testid="resizable-card">
      <header vuiNodeHeader>
        <span vuiTitle>{{ ctx.data().title }}</span>
      </header>
      <div vuiRow>
        <span vuiMeta>Size</span>
        <span class="ms-auto tabular-nums">
          {{ ctx.width() | number: '1.0-0' }} × {{ ctx.height() | number: '1.0-0' }}
        </span>
      </div>
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>
    </article>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DocsPresentations, Vflow, Vui],
})
export class TemplateNodeResizerDemoComponent {
  protected readonly nodes = createNodes([
    // No size in the data: the card follows its content until a resize fixes an axis.
    { id: 'content', point: { x: 0, y: 22 }, data: { title: 'Content-sized' } },
    // A size in the data: the card starts with it, and a resize writes the new one into these signals.
    { id: 'fixed', point: { x: 260, y: 0 }, width: 240, height: 140, data: { title: 'Fixed size' } },
  ]);

  protected readonly edges = createEdges([{ id: 'content-fixed', source: 'content', target: 'fixed' }]);
}
