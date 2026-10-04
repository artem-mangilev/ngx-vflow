import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { Vui } from '@vflow/ui';
import { VuiBpmn } from '@vflow/ui/bpmn';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-root',
  imports: [Vflow, Vui, VuiBpmn],
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
    .task {
      width: 150px;
      min-height: 60px;
    }
  `,
  template: `
    <div class="stage" [vuiTheme]="dark() ? 'dark' : 'light'">
      <vflow view="auto" data-testid="ui-flow" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx vNode>
          @if (ctx.data().kind === 'task') {
            <div vuiBpmnTask class="task" vSelectable [vuiSelected]="ctx.selected()">
              {{ ctx.data().title }}
              <span vuiPort handleType="target" position="left"></span>
            </div>
          } @else {
            <article vuiNode vSelectable [vuiSelected]="ctx.selected()">
              <header vuiNodeHeader>
                <span vuiTitle>{{ ctx.data().title }}</span>
              </header>
              <footer vuiNodeFooter>
                <span vuiStatus="success" [vuiStatusBusy]="true">Running</span>
                <span vuiActions>
                  <button vuiButton vNoDrag type="button" (click)="dark.set(!dark())">Theme</button>
                </span>
              </footer>
              <span vuiPort handleType="source" position="right"></span>
            </article>
          }
        </ng-template>
        <ng-template let-ctx vEdge>
          <svg:g vEdgeInteraction>
            <svg:path
              vuiEdge
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [vuiSelected]="ctx.selected()" />
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
      data: { kind: 'card', title: 'Card from @vflow/ui' },
    },
    {
      id: 'task',
      point: { x: 360, y: 80 },
      ariaLabel: 'Task',
      data: { kind: 'task', title: 'BPMN task' },
    },
  ]);
  readonly edges = createEdges([
    { id: 'card-task', source: 'card', target: 'task', curve: 'smooth-step', markers: { end: {} } },
  ]);
}
