import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-pipeline-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../demo.css'],
  styles: `
    article {
      width: 240px;
    }
    .port-row {
      position: relative;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
    }
    .preview {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 6px;
    }
    label {
      display: grid;
      gap: 8px;
    }
    input {
      width: 100%;
    }
  `,
  template: `
    <section class="demo" aria-label="Media pipeline demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <p>Native image and range input; typed ports are application data.</p>
      </div>
      @if (flow(); as editor) {
        <vflow-controls [flow]="editor" />
      }
      <vflow view="auto" [minZoom]="0.4" [maxZoom]="1.5" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx nodeHtml>
          <article
            vflowNode
            selectable
            [vflowSelected]="ctx.selected() || ctx.preselected()"
            [attr.data-node]="ctx.node.id">
            <header vflowNodeHeader>{{ ctx.data().title }}</header>
            <div vflowNodeBody>
              @if (ctx.node.id === 'image') {
                <img class="preview" alt="Blue mountains under a pale sky" [src]="preview" />
                <p>landscape.svg · 640 × 320</p>
              } @else if (ctx.node.id === 'resize') {
                <label vflowNoDrag vflowNoWheel
                  >Output width: {{ width() }} px
                  <input type="range" min="160" max="1280" step="160" [value]="width()" (input)="resize($event)" />
                </label>
                <p>Aspect ratio preserved by the application.</p>
              } @else {
                <span vflowStatus="success">Preview ready</span>
                <p>{{ width() }} × {{ width() / 2 }} pixels</p>
                <button vflowButton vflowNoDrag type="button" (click)="exports.update(increment)">
                  Export preview
                </button>
                <p aria-live="polite">Exports: {{ exports() }}</p>
              }
            </div>
            @for (portData of ctx.data().ports; track portData.id) {
              <div class="port-row" [attr.data-port]="portData.id">
                <span vflowPortLabel>{{ portData.label }}</span
                ><code>{{ portData.type }}</code>
                <handle
                  [id]="portData.id"
                  [type]="portData.direction"
                  [position]="portData.direction === 'source' ? 'right' : 'left'"
                  [canStart]="false"
                  [canAccept]="false"
                  [template]="port"
                  [ariaLabel]="ctx.data().title + ' ' + portData.label" />
              </div>
            }
          </article>
        </ng-template>
        <ng-template let-ctx edge
          ><svg:g customTemplateEdge selectable>
            <svg:path vflowEdge [attr.d]="ctx.path()" [vflowSelected]="ctx.selected() || ctx.preselected()" /></svg:g
        ></ng-template>
        <ng-template let-ctx edgeLabelHtml
          ><span vflowEdgeLabel>{{ ctx.label.data }}</span></ng-template
        >
      </vflow>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
  `,
})
export class PipelineDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly width = signal(640);
  readonly exports = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly preview =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#dbeafe"/><path d="M0 320 210 60 390 320M260 320 460 110 640 320" fill="#1d4ed8"/></svg>',
    );
  readonly nodes = createNodes([
    {
      id: 'image',
      type: 'html-template',
      point: { x: 20, y: 40 },
      ariaLabel: 'Image source',
      data: {
        title: 'Image source',
        ports: [
          { id: 'pixels', label: 'Pixels output', type: 'image', direction: 'source' },
          { id: 'metadata', label: 'Metadata output', type: 'json', direction: 'source' },
        ],
      },
    },
    {
      id: 'resize',
      type: 'html-template',
      point: { x: 370, y: 40 },
      ariaLabel: 'Resize image',
      data: {
        title: 'Resize image',
        ports: [
          { id: 'input', label: 'Pixels input', type: 'image', direction: 'target' },
          { id: 'output', label: 'Resized output', type: 'image', direction: 'source' },
        ],
      },
    },
    {
      id: 'export',
      type: 'html-template',
      point: { x: 720, y: 40 },
      ariaLabel: 'Export image',
      data: {
        title: 'Export image',
        ports: [{ id: 'input', label: 'Pixels input', type: 'image', direction: 'target' }],
      },
    },
  ]);
  readonly edges = createEdges([
    {
      id: 'image-resize',
      source: 'image',
      sourceHandle: 'pixels',
      target: 'resize',
      targetHandle: 'input',
      type: 'template',
      edgeLabels: { start: { type: 'html-template', data: 'image' } },
    },
    {
      id: 'resize-export',
      source: 'resize',
      sourceHandle: 'output',
      target: 'export',
      targetHandle: 'input',
      type: 'template',
      edgeLabels: { end: { type: 'html-template', data: 'image' } },
    },
  ]);
  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }
  resize(event: Event) {
    this.width.set(+(event.target as HTMLInputElement).value);
  }
}
