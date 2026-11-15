import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

interface TaskData {
  title: string;
  due: string;
}

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <article *vNode="let ctx of nodes" vuiNode class="w-48 text-[13px]">
      <!-- Only the header drags the card. The checkbox inside it opts out, so a press on it never starts a drag. -->
      <header vuiNodeHeader vDragHandle class="cursor-grab active:cursor-grabbing">
        <input
          vNoDrag
          vNoSelect
          type="checkbox"
          class="m-0 self-center cursor-pointer"
          [attr.aria-label]="'Done: ' + ctx.data().title" />
        <span vuiTitle>{{ ctx.data().title }}</span>
      </header>
      <div vuiRow>
        <span vuiMeta>Due {{ ctx.data().due }}</span>
      </div>
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>
    </article>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class DragHandleDemoComponent {
  protected readonly nodes = createNodes<TaskData>([
    { id: 'draft', point: { x: 0, y: 55 }, data: { title: 'Write the draft', due: 'Monday' } },
    { id: 'review', point: { x: 270, y: 0 }, data: { title: 'Review the text', due: 'Wednesday' } },
    { id: 'figures', point: { x: 270, y: 110 }, data: { title: 'Draw the figures', due: 'Thursday' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'draft-review', source: 'draft', target: 'review' },
    { id: 'draft-figures', source: 'draft', target: 'figures' },
  ]);
}
