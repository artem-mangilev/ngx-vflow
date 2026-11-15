import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { dagreLayout } from '@vflow/layout/dagre';
import { Vflow } from 'ngx-vflow';
import { pipelineEdges, pipelineNodes } from './graph';

type RankDirection = 'LR' | 'TB' | 'RL' | 'BT';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Direction</p>
      <div role="group" aria-label="Direction" class="inline-flex gap-1">
        @for (direction of directions; track direction) {
          <button
            type="button"
            [docsButton]="rankdir() === direction ? 'secondary' : 'plain'"
            [attr.aria-pressed]="rankdir() === direction"
            (click)="rankdir.set(direction)">
            {{ direction }}
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
export class LayoutDagreDemoComponent {
  // The first layout ends before the flow paints: fit it at once, and animate the fits that follow.
  protected painted = false;

  protected readonly directions: RankDirection[] = ['LR', 'TB', 'RL', 'BT'];
  protected readonly rankdir = signal<RankDirection>('LR');
  // A new algorithm per direction: the host lays the graph out again when it changes.
  protected readonly layout = computed(() => dagreLayout({ rankdir: this.rankdir(), nodesep: 30, ranksep: 40 }));

  protected readonly nodes = pipelineNodes();
  protected readonly edges = pipelineEdges();
}
