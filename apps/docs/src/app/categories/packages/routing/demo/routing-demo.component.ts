import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { avoidNodesCurve } from '@vflow/routing';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots' }" [snapGrid]="[10, 10]">
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
  imports: [DocsPresentations, Vflow],
})
export class RoutingDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'input', point: { x: 20, y: 110 }, data: { text: 'Input' } },
    { id: 'a', point: { x: 260, y: 110 }, data: { text: 'A' } },
    { id: 'b', point: { x: 500, y: 110 }, data: { text: 'B' } },
    { id: 'output', point: { x: 740, y: 110 }, data: { text: 'Output' } },
    { id: 'group', point: { x: 20, y: 260 }, width: 460, height: 170, data: { text: 'Group', type: 'group' } },
    { id: 'c', point: { x: 30, y: 70 }, parentId: 'group', data: { text: 'C' } },
    { id: 'd', point: { x: 320, y: 70 }, parentId: 'group', data: { text: 'D' } },
  ]);

  // Every edge routes around the nodes between its ends; drag any node to see the paths update.
  protected readonly edges = createEdges(
    [
      { id: 'input -> output', source: 'input', target: 'output' },
      { id: 'a -> b', source: 'a', target: 'b' },
      { id: 'b -> d', source: 'b', target: 'd' },
      { id: 'c -> d', source: 'c', target: 'd' },
    ].map((edge) => ({ ...edge, curve: avoidNodesCurve, markers: { end: { type: 'arrow-closed' as const } } })),
  );
}
