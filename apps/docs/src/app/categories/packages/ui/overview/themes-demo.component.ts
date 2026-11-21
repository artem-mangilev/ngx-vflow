import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

/**
 * Two editors with different themes on one page: each follows its own `data-vui-theme` ancestor, whatever the theme
 * of the page around them. The flow runs from the top left to the bottom right, so the minimap takes the top right
 * corner, which the nodes leave free.
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
          Editor A in the dark theme
        </label>
        <p>Themes are scoped: each editor, its markers and its minimap follow its own ancestor.</p>
      </div>

      <div class="grid grid-cols-2 gap-2.5 p-2.5">
        @for (editor of editors; track editor.id) {
          <div
            class="min-w-0 overflow-hidden rounded-vui-surface border border-solid border-vui-border bg-canvas"
            [attr.data-testid]="'editor-' + editor.id"
            [attr.data-vui-theme]="editor.theme()">
            <p class="m-0 px-vui-3 pt-vui-2 text-xs text-vui-muted">Editor {{ editor.name }}: {{ editor.theme() }}</p>
            <div class="h-55">
              <vflow
                #flow
                [nodes]="editor.nodes"
                [edges]="editor.edges"
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
                <svg:g *vEdge="let ctx" vEdgeInteractionArea>
                  <svg:path vuiEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
                </svg:g>
                <v-minimap vPanel="top-right" />
              </vflow>
            </div>
          </div>
        }
      </div>
    </docs-demo>
  `,
})
export class ThemesDemoComponent {
  protected readonly dark = signal(false);
  protected readonly background = SCENE_BACKGROUND;

  /** Editor A follows the checkbox, editor B is always dark. Each flow has its own graph. */
  protected readonly editors = [
    { id: 'a', name: 'A', theme: computed(() => (this.dark() ? 'dark' : 'light')), ...createGraph() },
    { id: 'b', name: 'B', theme: signal('dark'), ...createGraph() },
  ];
}

function createGraph() {
  return {
    nodes: createNodes([
      { id: 'source', point: { x: 0, y: 0 }, data: { title: 'Source', dataset: 'orders.csv' } },
      { id: 'target', point: { x: 180, y: 70 }, data: { title: 'Target', dataset: 'warehouse' } },
    ]),
    edges: createEdges([
      { id: 'source-target', source: 'source', target: 'target', curve: 'smooth-step', markers: { end: {} } },
    ]),
  };
}
