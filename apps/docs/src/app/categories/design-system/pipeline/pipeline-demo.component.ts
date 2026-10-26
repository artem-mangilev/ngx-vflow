import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Vui } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNode,
  createNodes,
  DeleteRequest,
  Edge,
  removeElements,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';
import { DemoIconComponent, DemoIconName } from '../../../shared/demo-icon.component';
import { injectDocsTheme } from '../../../shared/docs-theme';
import { BLEND_MODES, BlendMode, FILTERS, FilterFn, Picture, PortType, renderPicture, SAMPLES } from './image-lab';
import { PictureComponent } from './picture.component';

type LabData =
  | { kind: 'source'; title: string; sample: string; src: string }
  | { kind: 'filter'; fn: FilterFn; amount: number }
  | { kind: 'blend'; mode: BlendMode }
  | { kind: 'number'; value: number; playing: boolean }
  | { kind: 'output' };

interface Port {
  id: string;
  name: string;
  type: PortType;
}

const EXPORT = { width: 1200, height: 780 };

/** A small image editor: typed ports, previews that follow the wiring, native controls and a palette inside nodes. */
@Component({
  selector: 'app-ui-pipeline-demo',
  imports: [Vflow, Vui, DemoIconComponent, PictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    vflow {
      height: 600px;
    }
    /* A dense editor scale: 13px for titles and rows, 12px for labels and meta. */
    article {
      width: 220px;
      font-size: 13px;
    }
    article[data-kind='output'] {
      width: 320px;
    }
    /* Port color by type is application CSS on the public selector; the library knows nothing about images.
       Only the idle look is recolored, including the tone of the hover halo, so connection feedback (valid, invalid)
       keeps the library colors. */
    .vui-port[data-type='image'] {
      --type: #8b5cf6;
    }
    .vui-port[data-type='number'] {
      --type: #16a34a;
    }
    .vui-port[data-type][data-vui-state='idle'] {
      --vui-tone: var(--type);
      border-color: var(--type);
    }
    .vui-port[data-type][data-vui-state='idle'][data-vui-connected='true'] {
      background: var(--type);
    }
    .vui-edge[data-type='number'] {
      stroke-dasharray: 5 4;
    }
    .vui-row.output {
      justify-content: flex-end;
      text-align: end;
    }
    .vui-row.output .vui-title {
      flex: none;
    }
    .vui-row input[type='range'] {
      flex: 1;
      min-width: 0;
    }
    .vui-row .vui-title {
      flex: none;
    }
    .value {
      min-width: 34px;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }
    .preview {
      display: grid;
      place-items: center;
      aspect-ratio: 20 / 13;
      overflow: hidden;
      border-radius: 6px;
      background: var(--vui-surface-muted);
    }
    .empty {
      color: var(--vui-muted);
      font-size: 12px;
    }
    .setting {
      display: grid;
      gap: 4px;
      margin-top: 8px;
      color: var(--vui-muted);
      font-size: 12px;
    }
    .setting .select {
      width: 100%;
    }
    .number {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .number .big {
      flex: 1;
      font-size: 20px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .slider {
      display: block;
      width: 100%;
      margin: 6px 0 0;
    }
    .linked {
      flex: 1;
      text-align: end;
    }
    .palette {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
    }
    .palette {
      padding-left: 8px;
    }
  `,
  template: `
    <section class="demo" aria-label="Image lab demo" [attr.data-vui-theme]="theme()">
      <div class="stage">
        <vflow
          view="auto"
          [nodes]="nodes()"
          [edges]="edges()"
          [connection]="connection"
          (connect)="connect($event)"
          (deleteRequest)="remove($event)"
          (initialized)="flow()?.fitView()">
          <ng-template let-ctx vNode>
            @let data = ctx.data();
            <article
              vuiNode
              [attr.data-kind]="data.kind"
              [selected]="ctx.selected() || ctx.preselected()"
              [attr.data-stage]="ctx.node.id">
              <header vuiNodeHeader>
                <span vuiIcon><app-demo-icon [name]="icon(data)" /></span>
                <span vuiTitle>{{ title(data) }}</span>
                @if (data.kind === 'source') {
                  <input #file type="file" accept="image/*" hidden (change)="upload(ctx.node.id, file)" />
                  <button
                    class="button plain small icon"
                    vNoDrag
                    type="button"
                    [attr.aria-label]="'Upload a picture to ' + data.title"
                    (click)="file.click()">
                    <app-demo-icon name="upload" />
                  </button>
                }
              </header>
              <div vuiNodeBody>
                @if (data.kind === 'number') {
                  <div class="number">
                    <span class="big">{{ percent(data.value) }}</span>
                    <button
                      class="button small icon"
                      vNoDrag
                      type="button"
                      [attr.aria-label]="data.playing ? 'Pause the wave' : 'Play a wave'"
                      (click)="togglePlaying(ctx.node.id)">
                      <app-demo-icon [name]="data.playing ? 'pause' : 'play'" />
                    </button>
                  </div>
                  <input
                    class="range slider"
                    vNoDrag
                    vNoWheel
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    aria-label="Number value"
                    [style.--fill.%]="data.value * 100"
                    [value]="data.value"
                    (input)="patch(ctx.node.id, { value: +$any($event.target).value, playing: false })" />
                } @else {
                  <div class="preview" [attr.data-preview]="ctx.node.id">
                    @if (pictures().get(ctx.node.id); as picture) {
                      <app-picture [picture]="picture" [width]="data.kind === 'output' ? 296 : 196" />
                    } @else {
                      <span class="empty">Connect an image</span>
                    }
                  </div>
                }
                @if (data.kind === 'source') {
                  <label class="setting">
                    Picture
                    <select class="select" vNoDrag (change)="pick(ctx.node.id, $any($event.target).value)">
                      @for (sample of samples; track sample.id) {
                        <option [value]="sample.id" [selected]="sample.id === data.sample">{{ sample.name }}</option>
                      }
                      @if (data.sample === 'upload') {
                        <option value="upload" selected>Your picture</option>
                      }
                    </select>
                  </label>
                }
                @if (data.kind === 'blend') {
                  <label class="setting">
                    Mode
                    <select class="select" vNoDrag (change)="patch(ctx.node.id, { mode: $any($event.target).value })">
                      @for (mode of modes; track mode) {
                        <option [value]="mode" [selected]="mode === data.mode">{{ mode }}</option>
                      }
                    </select>
                  </label>
                }
              </div>
              @for (port of ports(data).inputs; track port.id) {
                <div vuiRow [attr.data-port]="port.id">
                  <span
                    vuiPort
                    handleType="target"
                    position="left"
                    [handleId]="'in:' + port.id"
                    [attr.data-type]="port.type"
                    [vuiPortConnected]="connected().has(ctx.node.id + '/in:' + port.id)"></span>
                  <span vuiTitle>{{ port.name }}</span>
                  @if (port.id === 'amount') {
                    <!-- A connected number owns the amount: the row names it instead of offering a dead slider. -->
                    @if (amountSource(ctx.node.id); as source) {
                      <span vuiMeta class="linked" data-testid="linked">from {{ source }}</span>
                    } @else {
                      <input
                        vNoDrag
                        vNoWheel
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        class="range"
                        [style.--fill.%]="(amounts().get(ctx.node.id) ?? 0) * 100"
                        [attr.aria-label]="title(data) + ' amount'"
                        [value]="amounts().get(ctx.node.id)"
                        (input)="patch(ctx.node.id, { amount: +$any($event.target).value })" />
                    }
                    <span vuiMeta class="value">{{ percent(amounts().get(ctx.node.id) ?? 0) }}</span>
                  }
                </div>
              }
              @for (port of ports(data).outputs; track port.id) {
                <div vuiRow class="output" [attr.data-port]="port.id">
                  <span vuiTitle>{{ port.name }}</span>
                  <span
                    vuiPort
                    handleType="source"
                    position="right"
                    [handleId]="'out:' + port.id"
                    [attr.data-type]="port.type"
                    [vuiPortConnected]="connected().has(ctx.node.id + '/out:' + port.id)"></span>
                </div>
              }
              @if (data.kind === 'output') {
                <footer vuiNodeFooter>
                  <span vuiMeta>{{ exportSize.width }}×{{ exportSize.height }} PNG</span>
                  <span vuiActions>
                    <button
                      class="button primary small"
                      vNoDrag
                      type="button"
                      [disabled]="!pictures().get(ctx.node.id)"
                      (click)="download(ctx.node.id)">
                      <app-demo-icon name="download" /> Download
                    </button>
                  </span>
                </footer>
              }
            </article>
          </ng-template>
          <ng-template let-ctx vEdge>
            <svg:g vEdgeInteraction>
              <svg:path
                vuiEdge
                [attr.d]="ctx.path()"
                [attr.data-type]="ctx.data()?.type"
                [selected]="ctx.selected() || ctx.preselected()" />
            </svg:g>
          </ng-template>
          <ng-template let-ctx vConnection>
            @if (ctx.path(); as path) {
              <svg:path vuiEdge stroke-dasharray="5 4" [attr.d]="path" />
            }
          </ng-template>
        </vflow>
        <div vuiToolbar class="palette">
          <app-demo-icon name="plus" />
          <select
            #palette
            class="select plain"
            aria-label="Add a node"
            (change)="add(palette.value); palette.value = ''">
            <option value="" disabled selected>Add node</option>
            @for (fn of filters; track fn) {
              <option [value]="fn">{{ filterLabel(fn) }}</option>
            }
            <option value="blend">Blend</option>
            <option value="number">Number</option>
          </select>
        </div>
        @if (flow(); as flow) {
          <vui-controls class="stage-controls" [flow]="flow" />
        }
      </div>
    </section>
  `,
})
export class PipelineDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly theme = injectDocsTheme();
  readonly samples = SAMPLES;
  readonly modes = BLEND_MODES;
  readonly filters = Object.keys(FILTERS) as FilterFn[];
  readonly exportSize = EXPORT;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private frame = 0;

  readonly nodes = signal(
    createNodes<LabData>([
      lab('wave', { x: 0, y: 0 }, { kind: 'number', value: 0.25, playing: false }),
      lab('photo', { x: 0, y: 170 }, source('Photo', 'sunset')),
      lab('texture', { x: 0, y: 520 }, source('Texture', 'bokeh')),
      lab('hue', { x: 300, y: 120 }, { kind: 'filter', fn: 'hue', amount: 0.25 }),
      lab('blur', { x: 300, y: 500 }, { kind: 'filter', fn: 'blur', amount: 0.3 }),
      lab('blend', { x: 600, y: 300 }, { kind: 'blend', mode: 'screen' }),
      lab('output', { x: 900, y: 250 }, { kind: 'output' }),
    ]),
  );
  readonly edges = signal<Edge[]>(
    createEdges([
      wire('wave', 'value', 'hue', 'amount', 'number'),
      wire('photo', 'image', 'hue', 'image'),
      wire('texture', 'image', 'blur', 'image'),
      wire('hue', 'image', 'blend', 'a'),
      wire('blur', 'image', 'blend', 'b'),
      wire('blend', 'image', 'output', 'image'),
    ]),
  );

  /** `${nodeId}/${handleId}` for every endpoint of an existing edge. */
  readonly connected = computed(
    () =>
      new Set(
        this.edges().flatMap((edge) => [`${edge.source}/${edge.sourceHandle}`, `${edge.target}/${edge.targetHandle}`]),
      ),
  );

  /** The amount of every filter: a connected number wins over the slider of the node. */
  readonly amounts = computed(() => {
    const amounts = new Map<string, number>();
    for (const node of this.nodes()) {
      const data = node.data();
      if (data.kind !== 'filter') continue;
      const input = this.data(this.source(node.id, 'amount'));
      amounts.set(node.id, input?.kind === 'number' ? input.value : data.amount);
    }
    return amounts;
  });

  /** What every node outputs, evaluated along the edges; `null` while a required input is missing. */
  readonly pictures = computed(() => {
    const pictures = new Map<string, Picture | null>();
    const evaluate = (id: string | undefined): Picture | null => {
      if (!id) return null;
      if (pictures.has(id)) return pictures.get(id)!;
      // Guards against a cycle; the connection validator never lets one in.
      pictures.set(id, null);
      const data = this.data(id);
      let picture: Picture | null = null;
      switch (data?.kind) {
        case 'source':
          picture = { kind: 'image', src: data.src };
          break;
        case 'filter': {
          const input = evaluate(this.source(id, 'image'));
          picture = input && { kind: 'filter', fn: data.fn, amount: this.amounts().get(id)!, input };
          break;
        }
        case 'blend': {
          const a = evaluate(this.source(id, 'a'));
          const b = evaluate(this.source(id, 'b'));
          picture = a && b ? { kind: 'blend', mode: data.mode, a, b } : (a ?? b);
          break;
        }
        case 'output':
          picture = evaluate(this.source(id, 'image'));
      }
      pictures.set(id, picture);
      return picture;
    };
    this.nodes().forEach((node) => evaluate(node.id));
    return pictures;
  });

  /** Ports of the same type connect, and an edge may not close a cycle: the pictures are evaluated along the edges. */
  readonly connection: ConnectionSettings = {
    validator: (c) => {
      const source = this.port(c.source, 'outputs', c.sourceHandle);
      const target = this.port(c.target, 'inputs', c.targetHandle);
      return !!source && source.type === target?.type && !this.reaches(c.target, c.source);
    },
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
  }

  /** An input takes one edge: a new connection replaces the old one. */
  connect(connection: Connection) {
    const type = this.port(connection.source, 'outputs', connection.sourceHandle)!.type;
    const edge = createEdge({ ...connection, id: crypto.randomUUID(), data: { type } });
    this.edges.update((edges) =>
      addEdges([edge], {
        nodes: this.nodes(),
        edges: edges.filter((e) => e.target !== edge.target || e.targetHandle !== edge.targetHandle),
      }),
    );
  }

  /** Delete removes the selection; the output stays, the result needs a place to land. */
  remove({ nodeIds, edgeIds }: DeleteRequest) {
    const result = removeElements(
      { nodeIds: nodeIds.filter((id) => this.data(id)?.kind !== 'output'), edgeIds },
      { nodes: this.nodes(), edges: this.edges() },
    );
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
  }

  /** Adds a node from the palette in the middle of the visible area. */
  add(kind: string) {
    const data: LabData =
      kind === 'blend'
        ? { kind: 'blend', mode: 'multiply' }
        : kind === 'number'
          ? { kind: 'number', value: 0.5, playing: false }
          : { kind: 'filter', fn: kind as FilterFn, amount: FILTERS[kind as FilterFn].amount };
    const stage = this.host.querySelector('vflow')!.getBoundingClientRect();
    const center = this.flow()!.clientToFlowPosition({
      x: stage.left + stage.width / 2,
      y: stage.top + stage.height / 2,
    });
    const node = lab(crypto.randomUUID(), { x: center.x - 110, y: center.y - 120 }, data);
    this.nodes.update((nodes) => [...nodes, createNode(node)]);
  }

  patch(id: string, patch: object) {
    this.node(id).data.update((data) => ({ ...data, ...patch }) as LabData);
  }

  pick(id: string, sample: string) {
    const found = SAMPLES.find((s) => s.id === sample);
    if (found) this.patch(id, { sample, src: found.src });
  }

  upload(id: string, input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    const previous = this.data(id);
    if (previous?.kind === 'source' && previous.sample === 'upload') URL.revokeObjectURL(previous.src);
    this.patch(id, { sample: 'upload', src: URL.createObjectURL(file) });
    input.value = '';
  }

  /** A playing number follows a sine wave, so every picture downstream animates. */
  togglePlaying(id: string) {
    const data = this.data(id);
    if (data?.kind !== 'number') return;
    this.patch(id, { playing: !data.playing });
    cancelAnimationFrame(this.frame);
    const start = performance.now() - Math.acos(1 - 2 * data.value) * 800;
    const tick = (time: number) => {
      let playing = false;
      for (const node of this.nodes()) {
        const value = node.data();
        if (value.kind !== 'number' || !value.playing) continue;
        playing = true;
        node.data.set({ ...value, value: (1 - Math.cos((time - start) / 800)) / 2 });
      }
      if (playing) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  /** Only the export rasterizes: the same operations, on a canvas. */
  async download(id: string) {
    const picture = this.pictures().get(id);
    if (!picture) return;
    const canvas = await renderPicture(picture, EXPORT.width, EXPORT.height);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob!);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'image-lab.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url));
    }, 'image/png');
  }

  ports(data: LabData): { inputs: Port[]; outputs: Port[] } {
    const image = (id: string, name = 'Image'): Port => ({ id, name, type: 'image' });
    switch (data.kind) {
      case 'source':
        return { inputs: [], outputs: [image('image')] };
      case 'filter':
        return {
          inputs: [image('image'), { id: 'amount', name: 'Amount', type: 'number' }],
          outputs: [image('image')],
        };
      case 'blend':
        return { inputs: [image('a', 'Image A'), image('b', 'Image B')], outputs: [image('image')] };
      case 'number':
        return { inputs: [], outputs: [{ id: 'value', name: 'Value', type: 'number' }] };
      case 'output':
        return { inputs: [image('image')], outputs: [] };
    }
  }

  readonly title = title;

  icon(data: LabData): DemoIconName {
    return { source: 'image', filter: 'sliders', blend: 'layers', number: 'waveform', output: 'download' }[
      data.kind
    ] as DemoIconName;
  }

  filterLabel(fn: FilterFn) {
    return FILTERS[fn].label;
  }

  /** Title of the node wired into a filter's amount. */
  amountSource(id: string) {
    const data = this.data(this.source(id, 'amount'));
    return data && title(data);
  }

  percent(value: number) {
    return Math.round(value * 100) + '%';
  }

  private node(id: string) {
    return this.nodes().find((node) => node.id === id)!;
  }

  private data(id: string | undefined) {
    return id
      ? this.nodes()
          .find((node) => node.id === id)
          ?.data()
      : undefined;
  }

  /** The node wired into an input. */
  private source(id: string, input: string) {
    return this.edges().find((edge) => edge.target === id && edge.targetHandle === 'in:' + input)?.source;
  }

  private port(id: string, side: 'inputs' | 'outputs', handle?: string) {
    const data = this.data(id);
    const prefix = side === 'inputs' ? 'in:' : 'out:';
    return data && this.ports(data)[side].find((port) => prefix + port.id === handle);
  }

  /** Whether `to` is downstream of `from`. */
  private reaches(from: string, to: string, seen = new Set<string>()): boolean {
    if (from === to) return true;
    seen.add(from);
    return this.edges().some(
      (edge) => edge.source === from && !seen.has(edge.target) && this.reaches(edge.target, to, seen),
    );
  }
}

function lab(id: string, point: { x: number; y: number }, data: LabData) {
  return { id, point, data, ariaLabel: title(data) };
}

function title(data: LabData) {
  switch (data.kind) {
    case 'source':
      return data.title;
    case 'filter':
      return FILTERS[data.fn].label;
    case 'blend':
      return 'Blend';
    case 'number':
      return 'Number';
    case 'output':
      return 'Output';
  }
}

function source(title: string, sample: string): LabData {
  return { kind: 'source', title, sample, src: SAMPLES.find((s) => s.id === sample)!.src };
}

function wire(source: string, out: string, target: string, input: string, type: PortType = 'image') {
  return {
    id: `${source}-${target}-${input}`,
    source,
    sourceHandle: 'out:' + out,
    target,
    targetHandle: 'in:' + input,
    data: { type },
  };
}
