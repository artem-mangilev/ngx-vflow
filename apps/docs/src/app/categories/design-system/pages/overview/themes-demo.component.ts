import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChildren } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-themes-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .editors {
      display: grid;
      gap: 12px;
    }
    section {
      border: 1px solid var(--vflow-border, #c8c8c8);
      padding: 8px;
    }
    vflow {
      height: 220px;
    }
    .custom-node {
      width: 140px;
      padding: 16px;
      background: var(--vflow-surface, white);
      color: var(--vflow-foreground, #1b262c);
      border: 1px solid var(--vflow-border, #c8c8c8);
    }
    .custom-edge {
      fill: none;
      stroke: var(--vflow-muted, #b1b1b7);
      stroke-width: 2px;
    }
    h3 {
      color: var(--vflow-foreground, #1b262c);
    }
  `,
  template: `
    <button type="button" (click)="swapped.set(!swapped())">Swap editor themes</button>
    <div class="editors">
      @for (scene of scenes; track scene.name) {
        <section
          [attr.data-editor]="scene.name"
          [attr.data-vui-theme]="
            scene.name === 'core-only' ? null : (scene.name === 'light') !== swapped() ? 'light' : 'dark'
          ">
          <h3>{{ scene.name }}</h3>
          <vflow #editor view="auto" [nodes]="scene.nodes" [edges]="scene.edges">
            <mini-map #minimap />
            <ng-template let-ctx nodeHtml>
              <div class="custom-node" selectable>
                {{ ctx.data().title }}
                @if (ctx.node.id === 'a') {
                  <handle type="source" position="right" [canStart]="false" [canAccept]="false" />
                } @else {
                  <handle type="target" position="left" [canStart]="false" [canAccept]="false" />
                }
              </div>
            </ng-template>
            <ng-template let-ctx edge
              ><svg:g customTemplateEdge selectable>
                <svg:path class="custom-edge" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" /></svg:g
            ></ng-template>
          </vflow>
          @if (scene.name !== 'core-only') {
            <vflow-controls [flow]="editor">
              <button vflowButton type="button" (click)="minimap.refreshTheme()">Refresh canvas colors</button>
            </vflow-controls>
          }
        </section>
      }
    </div>
  `,
})
export class ThemesDemoComponent {
  readonly swapped = signal(false);
  readonly flows = viewChildren(VflowComponent);
  readonly scenes = ['light', 'dark', 'core-only'].map((name) => ({
    name,
    nodes: createNodes([
      { id: 'a', type: 'html-template', point: { x: 0, y: 0 }, ariaLabel: 'Source', data: { title: 'Own HTML' } },
      { id: 'b', type: 'html-template', point: { x: 260, y: 0 }, ariaLabel: 'Target', data: { title: 'Own HTML' } },
    ]),
    edges: createEdges([{ id: 'edge', source: 'a', target: 'b', type: 'template', markers: { end: {} } }]),
  }));
  constructor() {
    effect(() => {
      for (const flow of this.flows()) if (flow.initialized()) untracked(() => flow.fitView());
    });
  }
}
