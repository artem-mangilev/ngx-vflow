import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

/** Two editors with different themes next to a core-only flow that the UI stylesheet must not restyle. */
@Component({
  selector: 'app-ui-themes-demo',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      background: var(--v-background, #fff);
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
    .plain-node {
      width: 130px;
      padding: 8px;
      border: 1.5px solid rgb(27, 38, 44);
      border-radius: 4px;
      background: #fff;
      color: #1b262c;
      font-size: 13px;
    }
    .plain-handle {
      width: 14px;
      height: 14px;
      box-sizing: border-box;
      border-radius: 50%;
      border: 2px solid #fff;
      background: rgb(27, 38, 44);
    }
    .plain-edge {
      fill: none;
      stroke: var(--v-muted, rgb(177, 177, 183));
      stroke-width: 2;
    }
  `,
  template: `
    <section class="demo" aria-label="Themes demo" vuiTheme="light">
      <div class="controls">
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark first editor</label>
        <p>Themes are scoped: each editor, its markers, toolbar and minimap follow its own ancestor.</p>
      </div>
      <div class="editors">
        <div class="editor" data-testid="editor-a" [vuiTheme]="dark() ? 'dark' : 'light'">
          <p>Editor A: {{ dark() ? 'dark' : 'light' }}</p>
          <vflow [nodes]="nodes" [edges]="edges">
            <ng-template let-ctx vNode>
              <article vuiNode vSelectable [vuiSelected]="ctx.selected() || ctx.preselected()">
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
                  [vuiSelected]="ctx.selected() || ctx.preselected()" />
              </svg:g>
            </ng-template>
            <v-minimap />
          </vflow>
        </div>
        <div class="editor" data-testid="editor-b" vuiTheme="dark">
          <p>Editor B: dark</p>
          <vflow [nodes]="nodes" [edges]="edges">
            <ng-template let-ctx vNode>
              <article vuiNode vSelectable [vuiSelected]="ctx.selected() || ctx.preselected()">
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
                  [vuiSelected]="ctx.selected() || ctx.preselected()" />
              </svg:g>
            </ng-template>
            <v-minimap />
          </vflow>
        </div>
      </div>
    </section>
    <!-- Outside every theme scope and without @vflow/ui: own templates on the headless core. -->
    <div class="editor" data-testid="editor-core" style="margin-top: 10px">
      <p>Core only: own node and edge templates without a theme scope; core tokens keep their defaults.</p>
      <vflow [nodes]="coreNodes" [edges]="coreEdges">
        <ng-template let-ctx vNode>
          <div class="plain-node" vSelectable>
            {{ ctx.data().title }}
            <span vHandle handleType="target" position="left" class="plain-handle"></span>
            <span vHandle handleType="source" position="right" class="plain-handle"></span>
          </div>
        </ng-template>
        <ng-template let-ctx vEdge>
          <svg:g vEdgeInteraction>
            <svg:path class="plain-edge" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
          </svg:g>
        </ng-template>
        <v-minimap />
      </vflow>
    </div>
  `,
})
export class ThemesDemoComponent {
  readonly dark = signal(false);
  readonly nodes = createNodes([
    { id: 'a', point: { x: 20, y: 40 }, ariaLabel: 'Source', data: { title: 'Source' } },
    { id: 'b', point: { x: 240, y: 120 }, ariaLabel: 'Target', data: { title: 'Target' } },
  ]);
  readonly edges = createEdges([{ id: 'a-b', source: 'a', target: 'b', curve: 'smooth-step', markers: { end: {} } }]);
  readonly coreNodes = createNodes([
    { id: 'c1', point: { x: 20, y: 40 }, data: { title: 'Own template' } },
    { id: 'c2', point: { x: 240, y: 120 }, data: { title: 'Headless core' } },
  ]);
  readonly coreEdges = createEdges([
    { id: 'c1-c2', source: 'c1', target: 'c2', curve: 'smooth-step', markers: { end: {} } },
  ]);
}
