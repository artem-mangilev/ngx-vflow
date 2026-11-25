import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { VxAutoSize } from '@vflow/auto-size';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <label>
        <input type="checkbox" [checked]="shrink()" (change)="shrink.set(!shrink())" />
        Shrink parents to fit (<code>vxAutoSizeShrink</code>)
      </label>
    </div>

    <vflow
      #flow
      vxAutoSize
      [vxAutoSizePadding]="padding"
      [vxAutoSizeShrink]="shrink()"
      [nodes]="nodes"
      [edges]="edges"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, VxAutoSize],
})
export class AutoSizeDemoComponent {
  protected readonly shrink = signal(true);

  // The top side keeps the group header clear when a parent shrinks.
  protected readonly padding = { top: 56, right: 24, bottom: 24, left: 24 };

  // Parents size themselves through `width` and `height`; children may leave them, so their extent is `null`.
  protected readonly nodes = createNodes([
    { id: 'team', point: { x: 0, y: 0 }, width: 496, height: 270, data: { text: 'Team', type: 'group' } },
    { id: 'lead', point: { x: 24, y: 126 }, parentId: 'team', extent: null, data: { text: 'Lead' } },
    {
      id: 'squad',
      point: { x: 184, y: 56 },
      parentId: 'team',
      extent: null,
      width: 288,
      height: 190,
      data: { text: 'Squad', type: 'group' },
    },
    { id: 'backend', point: { x: 24, y: 56 }, parentId: 'squad', extent: null, data: { text: 'Backend' } },
    { id: 'frontend', point: { x: 164, y: 116 }, parentId: 'squad', extent: null, data: { text: 'Frontend' } },
    { id: 'client', point: { x: 580, y: 172 }, data: { text: 'Client' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'lead-backend', source: 'lead', target: 'backend' },
    { id: 'lead-frontend', source: 'lead', target: 'frontend' },
    { id: 'frontend-client', source: 'frontend', target: 'client' },
  ]);
}
