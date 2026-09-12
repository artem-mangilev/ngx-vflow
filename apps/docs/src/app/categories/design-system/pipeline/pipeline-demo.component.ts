import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  untracked,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { VflowUi } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNodes,
  Edge,
  HtmlTemplateNode,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';

type PortType = 'video' | 'audio' | 'image';
interface Port {
  id: string;
  name: string;
  type: PortType;
}
interface StageData {
  title: string;
  icon: string;
  kind: 'source' | 'transcode' | 'mix' | 'publish';
  inputs: Port[];
  outputs: Port[];
}

/** A media pipeline: typed, labeled ports as field rows, rich body content and native controls inside nodes. */
@Component({
  selector: 'app-ui-pipeline-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  styles: `
    article {
      width: 230px;
    }
    vflow {
      height: 520px;
    }
    /* Port color by type is application CSS on the public selector; the library knows nothing about media types. */
    .vui-port[data-type='video'] {
      background: #2563eb;
    }
    .vui-port[data-type='audio'] {
      background: #16a34a;
    }
    .vui-port[data-type='image'] {
      background: #d97706;
    }
    .vui-field.output {
      justify-content: flex-end;
      text-align: end;
    }
    .vui-field.output .vui-title {
      flex: none;
    }
    .setting {
      display: grid;
      gap: 4px;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .setting select,
    .setting input {
      width: 100%;
    }
    .clip {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 6px;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 32px;
    }
    .bars span {
      flex: 1;
      background: var(--vui-accent);
      border-radius: 2px 2px 0 0;
    }
  `,
  template: `
    <section class="demo" aria-label="Media pipeline demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit pipeline</button>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <p>Connect ports of the same type. Controls inside nodes do not drag or zoom the graph.</p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges()" [connection]="connection" (connect)="connect($event)">
        <ng-template let-ctx nodeHtml>
          <article
            vflowNode
            selectable
            [vflowSelected]="ctx.selected() || ctx.preselected()"
            [attr.data-stage]="ctx.node.id">
            <header vflowNodeHeader>
              <span vflowIcon aria-hidden="true">{{ ctx.data().icon }}</span>
              <span vflowTitle>{{ ctx.data().title }}</span>
              @if (ctx.node.id === 'transcode') {
                <span [vflowStatus]="encoding() ? 'info' : 'neutral'" [vflowStatusBusy]="encoding()">{{
                  encoding() ? 'Encoding' : 'Idle'
                }}</span>
              }
            </header>
            @switch (ctx.data().kind) {
              @case ('source') {
                <div vflowNodeBody>
                  <svg class="clip" viewBox="0 0 200 90" role="img" aria-label="Clip preview: sunset over hills">
                    <rect width="200" height="90" fill="#fde68a" />
                    <circle cx="150" cy="35" r="18" fill="#f97316" />
                    <path d="M0 90 L60 45 L110 75 L150 55 L200 80 L200 90 Z" fill="#65a30d" />
                  </svg>
                  <p vflowMeta>sunset.mov · 00:42 · 1920×1080</p>
                </div>
              }
              @case ('transcode') {
                <div vflowNodeBody>
                  <label class="setting">
                    Resolution
                    <select vflowNoDrag [value]="resolution()" (change)="resolution.set($any($event.target).value)">
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="2160p">2160p</option>
                    </select>
                  </label>
                  <label class="setting">
                    Bitrate: {{ bitrate() }} Mbit/s
                    <input
                      vflowNoDrag
                      vflowNoWheel
                      type="range"
                      min="2"
                      max="40"
                      [value]="bitrate()"
                      (input)="bitrate.set(+$any($event.target).value)" />
                  </label>
                  <label class="setting">
                    <span>
                      <input vflowNoDrag type="checkbox" [checked]="advanced()" (change)="toggleAdvanced()" /> Poster
                      output
                    </span>
                  </label>
                </div>
              }
              @case ('mix') {
                <div vflowNodeBody>
                  <div class="bars" aria-hidden="true">
                    @for (level of levels; track $index) {
                      <span [style.height.%]="level"></span>
                    }
                  </div>
                  <p vflowMeta>Loudness −14 LUFS</p>
                </div>
              }
              @default {
                <div vflowNodeBody>
                  <p vflowMeta>{{ resolution() }} · {{ bitrate() }} Mbit/s · {{ edges().length }} inputs wired</p>
                </div>
              }
            }
            @for (port of ctx.data().inputs; track port.id) {
              <div vflowField [attr.data-port]="port.id">
                <ng-template #inPort let-handle handle>
                  <span
                    vflowPort
                    [attr.data-type]="port.type"
                    [vflowPortState]="handle.state()"
                    [vflowPortConnected]="connected().has(ctx.node.id + '/in:' + port.id)"></span>
                </ng-template>
                <handle
                  type="target"
                  position="left"
                  [id]="'in:' + port.id"
                  [template]="inPort"
                  [ariaLabel]="ctx.data().title + ' ' + port.name + ' input (' + port.type + ')'" />
                <span vflowTitle>{{ port.name }}</span>
                <span vflowMeta>{{ port.type }}</span>
              </div>
            }
            @for (port of ctx.data().outputs; track port.id) {
              <div vflowField class="output" [attr.data-port]="port.id">
                <ng-template #outPort let-handle handle>
                  <span
                    vflowPort
                    [attr.data-type]="port.type"
                    [vflowPortState]="handle.state()"
                    [vflowPortConnected]="connected().has(ctx.node.id + '/out:' + port.id)"></span>
                </ng-template>
                <span vflowMeta>{{ port.type }}</span>
                <span vflowTitle>{{ port.name }}</span>
                <handle
                  type="source"
                  position="right"
                  [id]="'out:' + port.id"
                  [template]="outPort"
                  [ariaLabel]="ctx.data().title + ' ' + port.name + ' output (' + port.type + ')'" />
              </div>
            }
          </article>
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path vflowEdge [attr.d]="ctx.path()" [vflowSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
        </ng-template>
        <ng-template let-ctx connection>
          @if (ctx.path(); as path) {
            <svg:path vflowEdge stroke-dasharray="5 4" [attr.d]="path" />
          }
        </ng-template>
      </vflow>
    </section>
  `,
})
export class PipelineDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly resolution = signal('1080p');
  readonly bitrate = signal(12);
  readonly advanced = signal(false);
  readonly encoding = computed(() => this.bitrate() > 20);
  readonly levels = [40, 70, 55, 90, 65, 80, 45, 75];

  readonly nodes = createNodes<StageData>([
    stage(
      'source',
      { x: 20, y: 40 },
      'Source clip',
      '▶',
      'source',
      [],
      [
        { id: 'video', name: 'Video', type: 'video' },
        { id: 'audio', name: 'Audio', type: 'audio' },
      ],
    ),
    stage(
      'transcode',
      { x: 330, y: 20 },
      'Transcode',
      '⚙',
      'transcode',
      [{ id: 'video', name: 'Video', type: 'video' }],
      [{ id: 'video', name: 'Video', type: 'video' }],
    ),
    stage(
      'mix',
      { x: 330, y: 340 },
      'Audio mix',
      '♫',
      'mix',
      [{ id: 'audio', name: 'Audio', type: 'audio' }],
      [{ id: 'audio', name: 'Audio', type: 'audio' }],
    ),
    stage(
      'publish',
      { x: 640, y: 150 },
      'Publish',
      '☁',
      'publish',
      [
        { id: 'video', name: 'Video', type: 'video' },
        { id: 'audio', name: 'Audio', type: 'audio' },
        { id: 'poster', name: 'Poster', type: 'image' },
      ],
      [],
    ),
  ]) as (HtmlTemplateNode<StageData> & { data: WritableSignal<StageData> })[];
  readonly edges = signal<Edge[]>(
    createEdges([
      wire('source-transcode', 'source', 'video', 'transcode', 'video'),
      wire('source-mix', 'source', 'audio', 'mix', 'audio'),
      wire('transcode-publish', 'transcode', 'video', 'publish', 'video'),
      wire('mix-publish', 'mix', 'audio', 'publish', 'audio'),
    ]),
  );
  /** `${nodeId}/${handleId}` for every endpoint of an existing edge. */
  readonly connected = computed(
    () =>
      new Set(
        this.edges().flatMap((edge) => [`${edge.source}/${edge.sourceHandle}`, `${edge.target}/${edge.targetHandle}`]),
      ),
  );
  readonly connection: ConnectionSettings = {
    type: 'template',
    validator: (c) => {
      const source = this.port(c.source, 'outputs', c.sourceHandle);
      const target = this.port(c.target, 'inputs', c.targetHandle);
      return !!source && !!target && source.type === target.type;
    },
  };

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }

  /** The application decides what an option changes: here an extra typed output row appears above the video output. */
  toggleAdvanced() {
    this.advanced.update((value) => !value);
    const transcode = this.nodes.find((node) => node.id === 'transcode')!;
    transcode.data.update((data) => ({
      ...data,
      outputs: this.advanced()
        ? [{ id: 'poster', name: 'Poster', type: 'image' as const }, ...data.outputs]
        : data.outputs.filter((port) => port.id !== 'poster'),
    }));
    if (!this.advanced()) {
      this.edges.update((edges) => edges.filter((edge) => edge.sourceHandle !== 'out:poster'));
    }
  }

  connect(connection: Connection) {
    const edge = createEdge({ ...connection, id: crypto.randomUUID() });
    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }

  private port(nodeId: string, side: 'inputs' | 'outputs', handle?: string) {
    const prefix = side === 'inputs' ? 'in:' : 'out:';
    return this.nodes
      .find((node) => node.id === nodeId)
      ?.data()
      [side].find((port) => prefix + port.id === handle);
  }
}

function stage(
  id: string,
  point: { x: number; y: number },
  title: string,
  icon: string,
  kind: StageData['kind'],
  inputs: Port[],
  outputs: Port[],
) {
  return { id, type: 'html-template' as const, point, ariaLabel: title, data: { title, icon, kind, inputs, outputs } };
}

function wire(id: string, source: string, out: string, target: string, input: string) {
  return { id, source, sourceHandle: 'out:' + out, target, targetHandle: 'in:' + input };
}
