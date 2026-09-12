import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { VflowBpmn } from '@vflow/ui/bpmn';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-root',
  imports: [Vflow, VflowUi, VflowBpmn],
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
    vflow-controls {
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
    <div class="stage" [vflowTheme]="dark() ? 'dark' : 'light'">
      <vflow view="auto" data-testid="ui-flow" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx nodeHtml>
          @if (ctx.data().kind === 'task') {
            <div vflowBpmnTask class="task" selectable [vflowSelected]="ctx.selected()">
              {{ ctx.data().title }}
              <handle type="target" position="left" [template]="port" />
            </div>
          } @else {
            <article vflowNode selectable [vflowSelected]="ctx.selected()">
              <header vflowNodeHeader>
                <span vflowTitle>{{ ctx.data().title }}</span>
              </header>
              <footer vflowNodeFooter>
                <span vflowStatus="success" [vflowStatusBusy]="true">Running</span>
                <span vflowActions>
                  <button vflowButton vflowNoDrag type="button" (click)="dark.set(!dark())">Theme</button>
                </span>
              </footer>
              <handle type="source" position="right" [template]="port" />
            </article>
          }
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path
              vflowEdge
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [vflowSelected]="ctx.selected()" />
          </svg:g>
        </ng-template>
        <mini-map />
      </vflow>
      @if (flow(); as flow) {
        <vflow-controls [flow]="flow" />
      }
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </div>
  `,
})
export class UiAppComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly nodes = createNodes([
    {
      id: 'card',
      type: 'html-template',
      point: { x: 40, y: 60 },
      ariaLabel: 'Card',
      data: { kind: 'card', title: 'Card from @vflow/ui' },
    },
    {
      id: 'task',
      type: 'html-template',
      point: { x: 360, y: 80 },
      ariaLabel: 'Task',
      data: { kind: 'task', title: 'BPMN task' },
    },
  ]);
  readonly edges = createEdges([
    { id: 'card-task', source: 'card', target: 'task', type: 'template', curve: 'smooth-step', markers: { end: {} } },
  ]);
}
