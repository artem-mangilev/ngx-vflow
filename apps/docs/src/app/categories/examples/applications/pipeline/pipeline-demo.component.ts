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
import { DemoIconComponent, DemoIconName, DocsKit, SCENE_BACKGROUND } from '@docs/shared';
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
  NodeWithDefaults,
  removeElements,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';
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

/**
 * Port color by type is the application's; the library knows nothing about images. Only the idle look is recolored,
 * including the tone of the hover halo, so connection feedback (valid, invalid) keeps the library colors. The
 * utilities are important because they replace colors the port part sets for the same states.
 */
const TYPED_PORT = `data-[v-handle-state=idle]:[--vui-tone:var(--type)] data-[v-handle-state=idle]:border-(--type)!
  data-[v-handle-state=idle]:data-[vui-connected=true]:bg-(--type)!`;

const PORT_COLOR: Record<PortType, string> = {
  image: `[--type:var(--color-violet-500)] ${TYPED_PORT}`,
  number: `[--type:var(--color-green-600)] ${TYPED_PORT}`,
};

/**
 * The icon of a node says what it does: a source has the color of what it produces, processing and the result have
 * their own.
 */
const KIND_COLOR: Record<LabData['kind'], string> = {
  source: '[--icon-color:var(--color-violet-500)]',
  number: '[--icon-color:var(--color-green-600)]',
  filter: '[--icon-color:var(--color-orange-600)]',
  blend: '[--icon-color:var(--color-orange-600)]',
  output: '[--icon-color:var(--color-cyan-600)]',
};

/** A small image editor: typed ports, previews that follow the wiring, native controls and a palette inside nodes. */
@Component({
  selector: 'app-ui-pipeline-demo',
  imports: [Vflow, Vui, DocsKit, DemoIconComponent, PictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <docs-demo framed role="region" aria-label="Image lab demo">
      <!-- Tall enough for the scene to fit by its width on every docs layout (the flow is at most 959px wide), which
           leaves the palette and the viewport controls a free band above and below the nodes. -->
      <div class="h-175">
        <vflow
          [nodes]="nodes()"
          [edges]="edges()"
          [background]="background"
          [connection]="connection"
          (connect)="connect($event)"
          (deleteRequest)="remove($event)"
          (initialized)="flow().fitView({ maxZoom: 1 })">
          <ng-template let-ctx vNode [vNodeOf]="nodes()">
            @let data = ctx.data();
            <!-- A dense editor scale: 13px for titles and rows, 12px for labels and meta. -->
            <article
              vuiNode
              class="text-[13px]"
              [class]="data.kind === 'output' ? 'w-80' : 'w-55'"
              [attr.data-stage]="ctx.node.id">
              <header vuiNodeHeader>
                <span docsNodeIcon tile [class]="kindColor[data.kind]"><app-demo-icon [name]="icon(data)" /></span>
                <span vuiTitle>{{ title(data) }}</span>
                @if (data.kind === 'source') {
                  <input #file type="file" accept="image/*" hidden (change)="upload(ctx.node.id, file)" />
                  <button
                    docsButton="plain"
                    small
                    icon
                    vNoDrag
                    vNoSelect
                    type="button"
                    [attr.aria-label]="'Upload a picture to ' + data.title"
                    (click)="file.click()">
                    <app-demo-icon name="upload" />
                  </button>
                }
              </header>
              <div class="p-vui-3">
                @if (data.kind === 'number') {
                  <div class="flex items-center gap-2">
                    <span class="flex-1 text-xl font-semibold tabular-nums">{{ percent(data.value) }}</span>
                    <button
                      docsButton
                      small
                      icon
                      vNoDrag
                      vNoSelect
                      type="button"
                      [attr.aria-label]="data.playing ? 'Pause the wave' : 'Play a wave'"
                      (click)="togglePlaying(ctx.node.id)">
                      <app-demo-icon [name]="data.playing ? 'pause' : 'play'" />
                    </button>
                  </div>
                  <div class="mt-1.5 flex">
                    <input
                      docsRange
                      class="flex-1 min-w-0"
                      vNoDrag
                      vNoSelect
                      vNoWheel
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      aria-label="Number value"
                      [value]="data.value"
                      (input)="patch(ctx.node.id, { value: +$any($event.target).value, playing: false })" />
                  </div>
                } @else {
                  <div
                    class="grid aspect-20/13 place-items-center overflow-hidden rounded-vui-control bg-vui-surface-muted"
                    [attr.data-preview]="ctx.node.id">
                    @if (pictures().get(ctx.node.id); as picture) {
                      <app-picture [picture]="picture" [width]="data.kind === 'output' ? 296 : 196" />
                    } @else {
                      <span vuiMeta>Connect an image</span>
                    }
                  </div>
                }
                @if (data.kind === 'source') {
                  <label class="mt-2 grid gap-1 text-xs text-vui-muted">
                    Picture
                    <select
                      docsSelect
                      class="w-full"
                      vNoDrag
                      vNoSelect
                      (change)="pick(ctx.node.id, $any($event.target).value)">
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
                  <label class="mt-2 grid gap-1 text-xs text-vui-muted">
                    Mode
                    <select
                      docsSelect
                      class="w-full"
                      vNoDrag
                      vNoSelect
                      (change)="patch(ctx.node.id, { mode: $any($event.target).value })">
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
                    [class]="portColor[port.type]"
                    [handleId]="'in:' + port.id"
                    [vuiPortConnected]="connected().has(ctx.node.id + '/in:' + port.id)"></span>
                  <span>{{ port.name }}</span>
                  @if (port.id === 'amount') {
                    <!-- A connected number owns the amount: the row names it instead of offering a dead slider. -->
                    @if (amountSource(ctx.node.id); as source) {
                      <span vuiMeta class="flex-1 text-end" data-testid="linked">from {{ source }}</span>
                    } @else {
                      <input
                        docsRange
                        class="flex-1 min-w-0"
                        vNoDrag
                        vNoSelect
                        vNoWheel
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        [attr.aria-label]="title(data) + ' amount'"
                        [value]="amounts().get(ctx.node.id)"
                        (input)="patch(ctx.node.id, { amount: +$any($event.target).value })" />
                    }
                    <span vuiMeta class="min-w-8.5 text-end tabular-nums">{{
                      percent(amounts().get(ctx.node.id) ?? 0)
                    }}</span>
                  }
                </div>
              }
              @for (port of ports(data).outputs; track port.id) {
                <div vuiRow class="justify-end" [attr.data-port]="port.id">
                  <span>{{ port.name }}</span>
                  <span
                    vuiPort
                    handleType="source"
                    position="right"
                    [class]="portColor[port.type]"
                    [handleId]="'out:' + port.id"
                    [vuiPortConnected]="connected().has(ctx.node.id + '/out:' + port.id)"></span>
                </div>
              }
              @if (data.kind === 'output') {
                <footer vuiNodeFooter>
                  <span vuiMeta>{{ exportSize.width }}×{{ exportSize.height }} PNG</span>
                  <button
                    docsButton="primary"
                    small
                    class="ms-auto"
                    vNoDrag
                    vNoSelect
                    type="button"
                    [disabled]="!pictures().get(ctx.node.id)"
                    (click)="download(ctx.node.id)">
                    <app-demo-icon name="download" /> Download
                  </button>
                </footer>
              }
            </article>
          </ng-template>
          <!-- A number travels along a dashed edge. -->
          <svg:g *vEdge="let ctx" vEdgeInteractionArea>
            <svg:path
              vuiEdge
              [attr.d]="ctx.path()"
              [attr.stroke-dasharray]="ctx.data()?.type === 'number' ? '4 4' : null" />
          </svg:g>
          <ng-template let-ctx vConnection>
            @if (ctx.path(); as path) {
              <svg:path vuiEdge stroke-dasharray="4 4" [attr.d]="path" />
            }
          </ng-template>
          <vui-controls vPanel="bottom-left" />
        </vflow>
      </div>
      <div vuiToolbar vPanel="top-left" class="z-2 pl-2" data-testid="palette">
        <app-demo-icon name="plus" />
        <select #palette docsSelect plain aria-label="Add a node" (change)="add(palette.value); palette.value = ''">
          <option value="" disabled selected>Add node</option>
          @for (fn of filters; track fn) {
            <option [value]="fn">{{ filterLabel(fn) }}</option>
          }
          <option value="blend">Blend</option>
          <option value="number">Number</option>
        </select>
      </div>
    </docs-demo>
  `,
})
export class PipelineDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);
  protected readonly background = SCENE_BACKGROUND;
  protected readonly samples = SAMPLES;
  protected readonly modes = BLEND_MODES;
  protected readonly filters = Object.keys(FILTERS) as FilterFn[];
  protected readonly exportSize = EXPORT;
  protected readonly kindColor = KIND_COLOR;
  protected readonly portColor = PORT_COLOR;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private frame = 0;

  protected readonly nodes = signal(
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
  protected readonly edges = signal<Edge[]>(
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
  protected readonly connected = computed(
    () =>
      new Set(
        this.edges().flatMap((edge) => [`${edge.source}/${edge.sourceHandle}`, `${edge.target}/${edge.targetHandle}`]),
      ),
  );

  /** The amount of every filter: a connected number wins over the slider of the node. */
  protected readonly amounts = computed(() => {
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
  protected readonly pictures = computed(() => {
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
  protected readonly connection: ConnectionSettings<NodeWithDefaults<LabData>> = {
    validator: ({ source, target }) => {
      const output = this.port(source.node.data(), 'outputs', source.handle.id);
      const input = this.port(target.node.data(), 'inputs', target.handle.id);
      return !!output && output.type === input?.type && !this.reaches(target.node.id, source.node.id);
    },
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.frame) cancelAnimationFrame(this.frame);
    });
  }

  /** An input takes one edge: a new connection replaces the old one. */
  protected connect(connection: Connection) {
    const type = this.port(this.data(connection.source), 'outputs', connection.sourceHandle)!.type;
    const edge = createEdge({ ...connection, id: crypto.randomUUID(), data: { type } });
    this.edges.update((edges) =>
      addEdges([edge], {
        nodes: this.nodes(),
        edges: edges.filter((e) => e.target !== edge.target || e.targetHandle !== edge.targetHandle),
      }),
    );
  }

  /** Delete removes the selection; the output stays, the result needs a place to land. */
  protected remove({ nodeIds, edgeIds }: DeleteRequest) {
    const result = removeElements(
      { nodeIds: nodeIds.filter((id) => this.data(id)?.kind !== 'output'), edgeIds },
      { nodes: this.nodes(), edges: this.edges() },
    );
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
  }

  /** Adds a node from the palette in the middle of the visible area. */
  protected add(kind: string) {
    const data: LabData =
      kind === 'blend'
        ? { kind: 'blend', mode: 'multiply' }
        : kind === 'number'
          ? { kind: 'number', value: 0.5, playing: false }
          : { kind: 'filter', fn: kind as FilterFn, amount: FILTERS[kind as FilterFn].amount };
    const stage = this.host.querySelector('vflow')!.getBoundingClientRect();
    const center = this.flow().clientToFlowPosition({
      x: stage.left + stage.width / 2,
      y: stage.top + stage.height / 2,
    });
    const node = lab(crypto.randomUUID(), { x: center.x - 110, y: center.y - 120 }, data);
    this.nodes.update((nodes) => [...nodes, createNode(node)]);
  }

  protected patch(id: string, patch: object) {
    this.node(id).data.update((data) => ({ ...data, ...patch }) as LabData);
  }

  protected pick(id: string, sample: string) {
    const found = SAMPLES.find((s) => s.id === sample);
    if (found) this.patch(id, { sample, src: found.src });
  }

  protected upload(id: string, input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    const previous = this.data(id);
    if (previous?.kind === 'source' && previous.sample === 'upload') URL.revokeObjectURL(previous.src);
    this.patch(id, { sample: 'upload', src: URL.createObjectURL(file) });
    input.value = '';
  }

  /** A playing number follows a sine wave, so every picture downstream animates. */
  protected togglePlaying(id: string) {
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
  protected async download(id: string) {
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

  protected ports(data: LabData): { inputs: Port[]; outputs: Port[] } {
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

  protected readonly title = title;

  protected icon(data: LabData): DemoIconName {
    return { source: 'image', filter: 'sliders', blend: 'layers', number: 'waveform', output: 'download' }[
      data.kind
    ] as DemoIconName;
  }

  protected filterLabel(fn: FilterFn) {
    return FILTERS[fn].label;
  }

  /** Title of the node wired into a filter's amount. */
  protected amountSource(id: string) {
    const data = this.data(this.source(id, 'amount'));
    return data && title(data);
  }

  protected percent(value: number) {
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

  private port(data: LabData | undefined, side: 'inputs' | 'outputs', handle?: string) {
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
