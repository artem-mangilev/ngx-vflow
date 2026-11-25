import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { radialTreeLayout, treeLayout } from '@vflow/layout/d3-hierarchy';
import { Vflow } from 'ngx-vflow';
import { orgChartEdges, orgChartNodes } from './graph';

type Shape = 'down' | 'right' | 'radial';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Shape</p>
      <div role="group" aria-label="Shape" class="inline-flex gap-1">
        @for (shape of shapes; track shape) {
          <button
            type="button"
            [docsButton]="selected() === shape ? 'secondary' : 'plain'"
            [attr.aria-pressed]="selected() === shape"
            (click)="selected.set(shape)">
            {{ shape }}
          </button>
        }
      </div>
    </div>

    <vflow
      #flow
      vxLayoutAnimate
      [vxLayout]="layout()"
      [nodes]="nodes"
      [edges]="edges"
      (vxLayoutEnd)="flow.fitView({ maxZoom: 1, duration: painted ? 300 : 0 })"
      (initialized)="painted = true">
      <!-- One floating handle per card: an edge meets the side that faces its other end, whichever way the tree grows. -->
      <docs-node *vNode="let ctx" floating [ctx]="ctx" [connectable]="false" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, VxLayout, VxLayoutAnimate],
})
export class LayoutTreeDemoComponent {
  // The first layout ends before the flow paints: fit it at once, and animate the fits that follow.
  protected painted = false;

  protected readonly shapes: Shape[] = ['down', 'right', 'radial'];
  protected readonly selected = signal<Shape>('down');
  protected readonly layout = computed(() => {
    const shape = this.selected();

    return shape === 'radial'
      ? radialTreeLayout({ levelSpacing: 120 })
      : treeLayout({ direction: shape, nodeSpacing: 20, levelSpacing: 40 });
  });

  protected readonly nodes = orgChartNodes();
  protected readonly edges = orgChartEdges();
}
