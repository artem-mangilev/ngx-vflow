import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges"
    [background]="{ type: 'image', src: 'assets/floor-plan.svg', scale: 1, repeat: false }"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class ImageCustomBackgroundDemoComponent {
  // The image lies at the origin of the flow at its natural size (`scale: 1`), so node positions are positions on the plan.
  protected readonly nodes = createNodes([
    { id: 'printer', point: { x: 40, y: 60 }, data: { text: 'Printer' } },
    { id: 'sensor', point: { x: 200, y: 240 }, data: { text: 'Sensor' } },
    { id: 'router', point: { x: 460, y: 60 }, data: { text: 'Router' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'printer-router', source: 'printer', target: 'router' },
    { id: 'sensor-router', source: 'sensor', target: 'router' },
  ]);
}
