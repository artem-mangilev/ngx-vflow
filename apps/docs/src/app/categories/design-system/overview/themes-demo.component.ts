import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

/** Two editors with different themes next to a core-only flow that the UI stylesheet must not restyle. */
@Component({
  selector: 'app-ui-themes-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  styles: `
    .editors {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      padding: 10px;
    }
    .editor {
      min-width: 0;
      border: 1px solid var(--vui-border);
      border-radius: 10px;
      overflow: hidden;
      background: var(--vflow-background, #fff);
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
    <section class="demo" aria-label="Themes demo" vflowTheme="light">
      <div class="controls">
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark first editor</label>
        <p>Themes are scoped: each editor, its markers, toolbar and minimap follow its own ancestor.</p>
      </div>
      <div class="editors">
        <div class="editor" data-testid="editor-a" [vflowTheme]="dark() ? 'dark' : 'light'">
          <p>Editor A: {{ dark() ? 'dark' : 'light' }}</p>
          <vflow [nodes]="nodes" [edges]="edges">
            <ng-template let-ctx nodeHtml>
              <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <header vflowNodeHeader>
                  <span vflowTitle>{{ ctx.data().title }}</span>
                </header>
                <handle type="target" position="left" [template]="port" />
                <handle type="source" position="right" [template]="port" />
              </article>
            </ng-template>
            <ng-template let-ctx edge>
              <svg:g customTemplateEdge selectable>
                <svg:path
                  vflowEdge
                  [attr.d]="ctx.path()"
                  [attr.marker-end]="ctx.markerEnd()"
                  [vflowSelected]="ctx.selected() || ctx.preselected()" />
              </svg:g>
            </ng-template>
            <mini-map />
          </vflow>
        </div>
        <div class="editor" data-testid="editor-b" vflowTheme="dark">
          <p>Editor B: dark</p>
          <vflow [nodes]="nodes" [edges]="edges">
            <ng-template let-ctx nodeHtml>
              <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <header vflowNodeHeader>
                  <span vflowTitle>{{ ctx.data().title }}</span>
                </header>
                <handle type="target" position="left" [template]="port" />
                <handle type="source" position="right" [template]="port" />
              </article>
            </ng-template>
            <ng-template let-ctx edge>
              <svg:g customTemplateEdge selectable>
                <svg:path
                  vflowEdge
                  [attr.d]="ctx.path()"
                  [attr.marker-end]="ctx.markerEnd()"
                  [vflowSelected]="ctx.selected() || ctx.preselected()" />
              </svg:g>
            </ng-template>
            <mini-map />
          </vflow>
        </div>
      </div>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
    <!-- Outside every theme scope: core defaults only, even though the UI stylesheet is loaded. -->
    <div class="editor" data-testid="editor-core" style="margin-top: 10px">
      <p>Core only: default node and edge presentation without a theme scope.</p>
      <vflow [nodes]="coreNodes" [edges]="coreEdges">
        <mini-map />
      </vflow>
    </div>
  `,
})
export class ThemesDemoComponent {
  readonly dark = signal(false);
  readonly nodes = createNodes([
    { id: 'a', type: 'html-template', point: { x: 20, y: 40 }, ariaLabel: 'Source', data: { title: 'Source' } },
    { id: 'b', type: 'html-template', point: { x: 240, y: 120 }, ariaLabel: 'Target', data: { title: 'Target' } },
  ]);
  readonly edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b', type: 'template', curve: 'smooth-step', markers: { end: {} } },
  ]);
  readonly coreNodes = createNodes([
    { id: 'c1', type: 'default', point: { x: 20, y: 40 }, text: 'Default' },
    { id: 'c2', type: 'default', point: { x: 240, y: 120 }, text: 'Node' },
  ]);
  readonly coreEdges = createEdges([
    { id: 'c1-c2', source: 'c1', target: 'c2', curve: 'smooth-step', markers: { end: {} } },
  ]);
}
