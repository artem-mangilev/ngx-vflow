import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { elkLayout } from '@vflow/layout/elk';
import { Vflow } from 'ngx-vflow';
import { pipelineEdges, pipelineNodes } from './graph';

type Direction = 'right' | 'down' | 'left' | 'up';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Direction</p>
      <div role="group" aria-label="Direction" class="inline-flex gap-1">
        @for (option of directions; track option) {
          <button
            type="button"
            [docsButton]="direction() === option ? 'secondary' : 'plain'"
            [attr.aria-pressed]="direction() === option"
            (click)="direction.set(option)">
            {{ option }}
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
      <!-- One floating handle per card: an edge meets the side that faces its other end, whichever way the graph is laid out. -->
      <docs-node *vNode="let ctx" floating [ctx]="ctx" [connectable]="false" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, VxLayout, VxLayoutAnimate],
})
export class LayoutElkDemoComponent {
  // The first layout ends before the flow paints: fit it at once, and animate the fits that follow.
  protected painted = false;

  protected readonly directions: Direction[] = ['right', 'down', 'left', 'up'];
  protected readonly direction = signal<Direction>('right');
  // A new algorithm per direction: the host lays the graph out again when it changes.
  protected readonly layout = computed(() =>
    elkLayout({ algorithm: 'layered', direction: this.direction(), nodeSpacing: 30, layerSpacing: 40 }),
  );

  protected readonly nodes = pipelineNodes();
  protected readonly edges = pipelineEdges();
}
