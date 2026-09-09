import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-pipeline-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./demo.css'],
  styles: `
    article {
      width: 230px;
    }
    .preview {
      height: 100px;
      background: linear-gradient(140deg, #334155, #67e8f9);
      border-radius: 6px;
    }
    .port-row {
      position: relative;
      padding: 8px 14px;
    }
    input {
      width: 100%;
    }
  `,
  template: `
    <section class="demo" vflowTheme="dark" aria-label="Media pipeline demo">
      <div class="controls">
        @if (flow(); as editor) {
          <vflow-controls [flow]="editor" />
        }
        <p>Image ports carry image data; application controls configure the transform.</p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx nodeHtml>
          <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
            <header vflowNodeHeader>{{ ctx.data().title }}</header>
            <div vflowNodeBody>
              @if (ctx.node.id === 'resize') {
                <label
                  >Output width
                  <input
                    vflowNoDrag
                    vflowNoWheel
                    type="range"
                    min="320"
                    max="1280"
                    step="160"
                    [value]="width()"
                    (input)="width.set(+$any($event.target).value)" />
                </label>
                <output role="status">{{ width() }} px</output>
              } @else {
                <div class="preview" role="img" aria-label="Illustrative blue image preview"></div>
                <p>{{ ctx.data().description }}</p>
              }
            </div>
            @if (ctx.node.id !== 'source') {
              <div class="port-row">
                Image input <small class="muted">image/png</small>
                <handle
                  type="target"
                  position="left"
                  id="image-in"
                  ariaLabel="Image input: image/png"
                  [template]="port" />
              </div>
            }
            @if (ctx.node.id !== 'output') {
              <div class="port-row">
                Image output <small class="muted">image/png</small>
                <handle
                  type="source"
                  position="right"
                  id="image-out"
                  ariaLabel="Image output: image/png"
                  [template]="port" />
              </div>
            }
          </article>
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path vflowEdge [attr.d]="ctx.path()" [vflowSelected]="ctx.selected()" />
          </svg:g>
        </ng-template>
      </vflow>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
  `,
})
export class PipelineDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly width = signal(960);
  readonly nodes = createNodes([
    {
      id: 'source',
      type: 'html-template',
      point: { x: 20, y: 30 },
      ariaLabel: 'Source image',
      data: { title: 'Source image', description: 'Original · 1280 × 720' },
    },
    {
      id: 'resize',
      type: 'html-template',
      point: { x: 340, y: 70 },
      ariaLabel: 'Resize image',
      data: { title: 'Resize image', description: '' },
    },
    {
      id: 'output',
      type: 'html-template',
      point: { x: 660, y: 30 },
      ariaLabel: 'Preview output',
      data: { title: 'Preview output', description: 'Application-owned preview' },
    },
  ]);
  readonly edges = createEdges([
    {
      id: 'input',
      type: 'template',
      source: 'source',
      sourceHandle: 'image-out',
      target: 'resize',
      targetHandle: 'image-in',
    },
    {
      id: 'output',
      type: 'template',
      source: 'resize',
      sourceHandle: 'image-out',
      target: 'output',
      targetHandle: 'image-in',
    },
  ]);
  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }
}
