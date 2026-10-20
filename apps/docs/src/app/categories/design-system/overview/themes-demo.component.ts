import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

/** Two editors with different themes on one page: each follows its own `data-vui-theme` ancestor. */
@Component({
  selector: 'app-ui-themes-demo',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .editors {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding: 10px;
    }
    .editor {
      min-width: 0;
      border: 1px solid var(--vui-border);
      border-radius: 10px;
      overflow: hidden;
      background: var(--vui-background, #fff);
    }
    .editor p {
      margin: 0;
      padding: 8px 10px;
      font-size: 12px;
      color: var(--vui-muted);
    }
    vflow {
      height: 220px;
    }
    article {
      width: 150px;
    }
  `,
  template: `
    <section class="demo" aria-label="Themes demo" data-vui-theme="light">
      <div class="controls">
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark first editor</label>
        <p>Themes are scoped: each editor, its markers, toolbar and minimap follow its own ancestor.</p>
      </div>
      <div class="editors">
        <div class="editor" data-testid="editor-a" [attr.data-vui-theme]="dark() ? 'dark' : 'light'">
          <p>Editor A: {{ dark() ? 'dark' : 'light' }}</p>
          <vflow [nodes]="nodes" [edges]="edges">
            <ng-template let-ctx vNode>
              <article vuiNode [selected]="ctx.selected() || ctx.preselected()">
                <header vuiNodeHeader>
                  <span vuiTitle>{{ ctx.data().title }}</span>
                </header>
                <span vuiPort handleType="target" position="left"></span>
                <span vuiPort handleType="source" position="right"></span>
              </article>
            </ng-template>
            <ng-template let-ctx vEdge>
              <svg:g vEdgeInteraction>
                <svg:path
                  vuiEdge
                  [attr.d]="ctx.path()"
                  [attr.marker-end]="ctx.markerEnd()"
                  [selected]="ctx.selected() || ctx.preselected()" />
              </svg:g>
            </ng-template>
            <v-minimap />
          </vflow>
        </div>
        <div class="editor" data-testid="editor-b" data-vui-theme="dark">
          <p>Editor B: dark</p>
          <vflow [nodes]="nodes" [edges]="edges">
            <ng-template let-ctx vNode>
              <article vuiNode [selected]="ctx.selected() || ctx.preselected()">
                <header vuiNodeHeader>
                  <span vuiTitle>{{ ctx.data().title }}</span>
                </header>
                <span vuiPort handleType="target" position="left"></span>
                <span vuiPort handleType="source" position="right"></span>
              </article>
            </ng-template>
            <ng-template let-ctx vEdge>
              <svg:g vEdgeInteraction>
                <svg:path
                  vuiEdge
                  [attr.d]="ctx.path()"
                  [attr.marker-end]="ctx.markerEnd()"
                  [selected]="ctx.selected() || ctx.preselected()" />
              </svg:g>
            </ng-template>
            <v-minimap />
          </vflow>
        </div>
      </div>
    </section>
  `,
})
export class ThemesDemoComponent {
  readonly dark = signal(false);
  readonly nodes = createNodes([
    { id: 'a', point: { x: 20, y: 40 }, ariaLabel: 'Source', data: { title: 'Source' } },
    { id: 'b', point: { x: 240, y: 120 }, ariaLabel: 'Target', data: { title: 'Target' } },
  ]);
  readonly edges = createEdges([{ id: 'a-b', source: 'a', target: 'b', curve: 'smooth-step', markers: { end: {} } }]);
}
