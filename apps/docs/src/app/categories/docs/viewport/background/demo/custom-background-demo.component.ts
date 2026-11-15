import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  // The two tokens are plain CSS on the flow, written here as utilities; both colors are mixed from the theme.
  template: `<vflow
    #flow
    class="[--v-background-pattern:color-mix(in_oklab,var(--vui-accent)_60%,transparent)] [--v-background:color-mix(in_oklab,var(--vui-accent)_8%,var(--vui-surface))]"
    [nodes]="nodes"
    [edges]="edges"
    [background]="{ type: 'dots' }"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class CustomBackgroundDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'source', point: { x: 0, y: 0 }, data: { text: 'Source' } },
    { id: 'target', point: { x: 220, y: 90 }, data: { text: 'Target' } },
  ]);

  protected readonly edges = createEdges([{ id: 'source-target', source: 'source', target: 'target' }]);
}
