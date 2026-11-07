import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VxAutoSize } from '@vflow/auto-size';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow vxAutoSize view="auto" [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots' }">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VxAutoSize],
})
export class AutoSizeDemoComponent {
  // Parents size themselves through `width` and `height`; children may leave them, so their extent is `null`.
  protected readonly nodes = createNodes([
    { id: 'team', point: { x: 40, y: 40 }, width: 560, height: 300, data: { text: 'Team', type: 'group' } },
    { id: 'lead', point: { x: 40, y: 60 }, parentId: 'team', extent: null, data: { text: 'Lead' } },
    {
      id: 'squad',
      point: { x: 220, y: 40 },
      parentId: 'team',
      extent: null,
      width: 300,
      height: 220,
      data: { text: 'Squad', type: 'group' },
    },
    { id: 'dev-1', point: { x: 30, y: 60 }, parentId: 'squad', extent: null, data: { text: 'Dev 1' } },
    { id: 'dev-2', point: { x: 170, y: 120 }, parentId: 'squad', extent: null, data: { text: 'Dev 2' } },
    { id: 'client', point: { x: 700, y: 160 }, data: { text: 'Client' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'lead -> dev-1', source: 'lead', target: 'dev-1' },
    { id: 'lead -> dev-2', source: 'lead', target: 'dev-2' },
    { id: 'dev-2 -> client', source: 'dev-2', target: 'client' },
  ]);
}
