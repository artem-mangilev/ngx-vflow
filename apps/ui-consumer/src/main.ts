import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VflowUi } from '@vflow/ui';
import { VflowBpmn } from '@vflow/ui/bpmn';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';
import { CoreScene } from './core-scene';
@Component({
  selector: 'app-root',
  host: { role: 'main' },
  imports: [CoreScene, Vflow, VflowUi, VflowBpmn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      font-family: sans-serif;
    }
    .editors {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .override {
      --vui-accent: #007777;
      --vflow-focus: #ff00ff;
    }
  `,
  template: `<h1>Built UI consumer</h1>
    <button (click)="dark.set(!dark())">Toggle first theme</button>
    <div class="editors">
      @for (theme of [dark() ? 'dark' : 'light', 'dark']; track $index) {
        <section [vflowTheme]="$any(theme)" [class.override]="$index === 0">
          <vflow
            #flow
            [ariaLabelConfig]="{ flowLabel: 'Themed graph ' + $index }"
            [view]="[440, 240]"
            [nodes]="graphs[$index]"
            [edges]="edges">
            <mini-map />
            <ng-template nodeHtml let-ctx>
              <article vflowNode selectable [vflowSelected]="ctx.selected()" style="width:110px">
                <header vflowNodeHeader>{{ ctx.data().name }}</header>
                <div vflowNodeBody><span vflowBpmnEvent="start" role="img" aria-label="Start event"></span></div>
                <handle type="source" position="right" [template]="port" /><handle
                  type="target"
                  position="left"
                  [template]="port" />
                <node-toolbar><span vflowToolbar>Toolbar</span></node-toolbar>
              </article>
            </ng-template>
            <ng-template edge let-ctx
              ><svg:g customTemplateEdge selectable>
                <svg:path vflowEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" /></svg:g
            ></ng-template>
            <ng-template #port handle><span vflowPort></span></ng-template>
          </vflow>
          <vflow-controls [flow]="flow"><button vflowButton type="button">Custom action</button></vflow-controls>
        </section>
      }
      <core-scene />
    </div>`,
})
class App {
  readonly dark = signal(false);
  readonly graphs = [0, 1].map(() =>
    createNodes([
      { id: 'a', type: 'html-template', ariaLabel: 'Source', point: { x: 20, y: 50 }, data: { name: 'Source' } },
      { id: 'b', type: 'html-template', ariaLabel: 'Target', point: { x: 260, y: 50 }, data: { name: 'Target' } },
    ]),
  );
  readonly edges = createEdges([{ id: 'ab', type: 'template', source: 'a', target: 'b', markers: { end: {} } }]);
}
bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
