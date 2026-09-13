import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

@Component({
  selector: 'app-root',
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }
    .line {
      fill: none;
      stroke: var(--vflow-muted, rgb(177, 177, 183));
      stroke-width: 2;
    }
    .card {
      width: 160px;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #fff;
    }
  `,
  template: `
    <vflow view="auto" data-testid="core-flow" [nodes]="nodes" [edges]="edges">
      <ng-template let-ctx nodeHtml>
        <div class="card" selectable>
          {{ ctx.data().title }}
          <handle type="target" position="left" />
          <handle type="source" position="right" />
        </div>
      </ng-template>
      <mini-map />
    </vflow>
  `,
})
export class CoreAppComponent {
  readonly nodes = createNodes([
    { id: 'a', type: 'html-template', point: { x: 40, y: 60 }, data: { title: 'Own template' } },
    { id: 'b', type: 'html-template', point: { x: 320, y: 160 }, data: { title: 'No UI package' } },
    { id: 'c', type: 'html-template', point: { x: 320, y: 20 }, data: { title: 'Third card' } },
  ]);
  readonly edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b', markers: { end: {} } },
    { id: 'a-c', source: 'a', target: 'c' },
  ]);
}
