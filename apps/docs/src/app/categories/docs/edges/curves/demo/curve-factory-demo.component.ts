import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { CurveFactory, Vflow, createEdges, createNodes } from 'ngx-vflow';

/** An arc that rises above the straight line between its ends by a quarter of their distance. */
const arcCurve: CurveFactory = ({ sourcePoint, targetPoint }) => {
  const rise = Math.hypot(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y) / 4;
  const middle = { x: (sourcePoint.x + targetPoint.x) / 2, y: (sourcePoint.y + targetPoint.y) / 2 };

  return {
    path: `M ${sourcePoint.x},${sourcePoint.y} Q ${middle.x},${middle.y - rise} ${targetPoint.x},${targetPoint.y}`,
    // A quadratic curve passes halfway between its chord and its control point. Without a label point the edge
    // would render no label.
    labelPoints: { center: { x: middle.x, y: middle.y - rise / 2 } },
  };
};

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class CurveFactoryDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'lisbon', point: { x: 0, y: 0 }, data: { text: 'Lisbon' } },
    { id: 'madrid', point: { x: 220, y: 0 }, data: { text: 'Madrid' } },
    { id: 'rome', point: { x: 560, y: 0 }, data: { text: 'Rome' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'lisbon-madrid', source: 'lisbon', target: 'madrid', curve: arcCurve, data: { label: '1 h 20 min' } },
    { id: 'madrid-rome', source: 'madrid', target: 'rome', curve: arcCurve, data: { label: '2 h 30 min' } },
  ]);
}
