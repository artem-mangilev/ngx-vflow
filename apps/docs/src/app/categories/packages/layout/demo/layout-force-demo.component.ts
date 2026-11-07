import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VxLayout } from '@vflow/layout';
import { forceLayout } from '@vflow/layout/d3-force';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `
    <label class="toolbar">
      <span>Link distance {{ distance() }}</span>
      <input
        type="range"
        min="40"
        max="240"
        step="10"
        [value]="distance()"
        (input)="distance.set(+$any($event.target).value)" />
    </label>
    <vflow view="auto" [vxLayout]="layout()" [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots' }">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .toolbar {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 1;
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VxLayout],
})
export class LayoutForceDemoComponent {
  protected readonly distance = signal(120);
  // A continuous layout: every tick of the simulation moves the nodes, until it settles.
  protected readonly layout = computed(() =>
    forceLayout({ linkDistance: this.distance(), chargeStrength: -500, center: { x: 400, y: 250 } }),
  );
  protected readonly nodes = createNodes(
    Array.from({ length: 12 }, (_, i) => ({
      id: `n${i}`,
      point: { x: 300 + (i % 4) * 60, y: 200 + Math.floor(i / 4) * 60 },
      data: { text: `N${i}` },
    })),
  );
  protected readonly edges = createEdges(
    Array.from({ length: 11 }, (_, i) => ({ id: `e${i}`, source: 'n0', target: `n${i + 1}` })).concat(
      Array.from({ length: 5 }, (_, i) => ({ id: `r${i}`, source: `n${i + 1}`, target: `n${i + 6}` })),
    ),
  );
}
