import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

/**
 * One editor whose theme follows a switch: the `data-vui-theme` ancestor reaches the nodes, the SVG edges and their
 * markers, and the minimap, whatever the theme of the page around it. The flow runs from the top left to the bottom
 * right, so the minimap takes the top right corner, which the nodes leave free.
 */
@Component({
  imports: [DocsKit, Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <docs-demo framed>
      <div docsDemoBar>
        <label>
          <input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" />
          Dark theme
        </label>
      </div>

      <div class="h-60 bg-canvas" data-testid="editor" [attr.data-vui-theme]="dark() ? 'dark' : 'light'">
        <vflow
          #flow
          [nodes]="nodes"
          [edges]="edges"
          [background]="background"
          (initialized)="flow.fitView({ maxZoom: 1 })">
          <article *vNode="let ctx" vuiNode class="w-32 text-[13px]">
            <header vuiNodeHeader>
              <span vuiTitle>{{ ctx.data().title }}</span>
            </header>
            <div vuiRow>
              <span vuiMeta>{{ ctx.data().dataset }}</span>
            </div>
            <span vuiPort handleType="target" position="left"></span>
            <span vuiPort handleType="source" position="right"></span>
          </article>
          <svg:g *vEdge>
            <svg:path vuiEdge />
          </svg:g>
          <v-minimap vPanel="top-right" />
        </vflow>
      </div>
    </docs-demo>
  `,
})
export class ThemesDemoComponent {
  protected readonly dark = signal(false);
  protected readonly background = SCENE_BACKGROUND;

  protected readonly nodes = createNodes([
    { id: 'source', point: { x: 0, y: 0 }, data: { title: 'Source', dataset: 'orders.csv' } },
    { id: 'target', point: { x: 180, y: 70 }, data: { title: 'Target', dataset: 'warehouse' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'source-target', source: 'source', target: 'target', curve: 'smooth-step', markers: { end: {} } },
  ]);
}
