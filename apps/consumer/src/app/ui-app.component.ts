import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-root',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }
    .stage {
      position: relative;
      height: 100%;
    }
    vui-controls {
      position: absolute;
      left: 10px;
      bottom: 10px;
      z-index: 2;
    }
    article {
      width: 200px;
    }
  `,
  template: `
    <div class="stage" [attr.data-vui-theme]="dark() ? 'dark' : 'light'">
      <vflow view="auto" data-testid="ui-flow" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx vNode>
          <article vuiNode [selected]="ctx.selected()">
            <header vuiNodeHeader>
              <span vuiTitle>{{ ctx.data().title }}</span>
            </header>
            <footer vuiNodeFooter>
              <span vuiStatus="success" [vuiStatusBusy]="true">Running</span>
              <span vuiActions>
                <button vuiButton="secondary" vNoDrag type="button" (click)="dark.set(!dark())">Theme</button>
              </span>
            </footer>
            @if (ctx.node.id === 'target') {
              <span vuiPort handleType="target" position="left"></span>
            } @else {
              <span vuiPort handleType="source" position="right"></span>
            }
          </article>
        </ng-template>
        <ng-template let-ctx vEdge>
          <svg:g vEdgeInteraction>
            <svg:path vuiEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" [selected]="ctx.selected()" />
          </svg:g>
        </ng-template>
        <v-minimap />
      </vflow>
      @if (flow(); as flow) {
        <vui-controls [flow]="flow" />
      }
    </div>
  `,
})
export class UiAppComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly nodes = createNodes([
    {
      id: 'card',
      point: { x: 40, y: 60 },
      ariaLabel: 'Card',
      data: { title: 'Card from @vflow/ui' },
    },
    {
      id: 'target',
      point: { x: 360, y: 80 },
      ariaLabel: 'Target card',
      data: { title: 'Target card' },
    },
  ]);
  readonly edges = createEdges([
    { id: 'card-target', source: 'card', target: 'target', curve: 'smooth-step', markers: { end: {} } },
  ]);
}
