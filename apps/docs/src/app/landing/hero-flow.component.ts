import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DemoIconComponent, DocsKit } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdges,
  createNodes,
  DeleteRequest,
  Edge,
  removeElements,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';

type MixerData =
  { kind: 'color'; title: string; color: string } | { kind: 'angle'; angle: number } | { kind: 'gradient' };

type InputId = 'start' | 'end' | 'angle';

interface InputRow {
  id: InputId;
  name: string;
  /** What the row shows for the connected value; `null` while nothing is connected. */
  value: string | null;
  color: string | null;
}

const SWATCHES = [
  { name: 'Blue', value: '#3282b8' },
  { name: 'Sky', value: '#bbe1fa' },
  { name: 'Mint', value: '#5eead4' },
  { name: 'Amber', value: '#ffc46b' },
  { name: 'Coral', value: '#ff7e6b' },
];

/** Degrees a second while the angle plays: one turn in half a minute. */
const SPIN_SPEED = 12;
/**
 * On a phone the scene is drawn smaller to fit the screen, so there it is laid out tighter and loses less of its size.
 */
const COMPACT = matchMedia('(width <= 600px)').matches;
/** How far, in pixels, the light of each color lies from the middle of the card. */
const GLOW_OFFSET = 40;

/**
 * The flow at the top of the landing page: two colors and an angle wired into a gradient. Its nodes float on the page
 * itself, so the canvas neither pans nor zooms; the nodes drag, the controls work and the edges can be rewired.
 *
 * The nodes are not tab stops: the keyboard reaches the controls inside them and the edges, which Delete removes, and
 * a reader on the way to the rest of the page passes four stops fewer. The flows below the hero keep the whole
 * keyboard of the library.
 */
@Component({
  selector: 'app-hero-flow',
  imports: [Vflow, Vui, DocsKit, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The canvas is the page: no fill of its own. `--edge-keep` is how much of its color an edge keeps on a light page.
  host: { class: 'block size-full [--v-background:transparent] [--edge-keep:72%] dark:[--edge-keep:100%]' },
  template: `
    <vflow
      [nodes]="nodes"
      [edges]="edges()"
      [connection]="connection"
      [panOnDrag]="false"
      [zoomOnScroll]="false"
      [zoomOnPinch]="false"
      [nodesFocusable]="false"
      (connect)="connect($event)"
      (deleteRequest)="remove($event)"
      (initialized)="fit()">
      <ng-template let-ctx vNode [vNodeOf]="nodes">
        @let data = ctx.data();
        @if (data.kind === 'color') {
          <article vuiNode class="w-44 text-[13px]">
            <header vuiNodeHeader class="py-vui-2">
              <span vuiTitle>{{ data.title }}</span>
              <span vuiMeta class="font-doc-mono">{{ data.color }}</span>
            </header>
            <div class="flex justify-between p-vui-3" vNoDrag role="group" [attr.aria-label]="data.title">
              @for (swatch of swatches; track swatch.value) {
                <button
                  type="button"
                  class="size-6 cursor-pointer rounded-full border-0 p-0 inset-ring inset-ring-vui-foreground/25 ring-offset-2
                    ring-offset-vui-surface
                    focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vui-accent
                    aria-pressed:ring-2 aria-pressed:ring-vui-foreground"
                  [style.background]="swatch.value"
                  [attr.aria-label]="swatch.name"
                  [attr.aria-pressed]="swatch.value === data.color"
                  (click)="setColor(ctx.node.id, data.title, swatch.value)"></button>
              }
            </div>
            <span vuiPort handleType="source" position="right" [vuiPortConnected]="feeds().has(ctx.node.id)"></span>
          </article>
        } @else if (data.kind === 'angle') {
          <article vuiNode class="w-44 text-[13px]">
            <header vuiNodeHeader class="items-center py-vui-2">
              <span vuiTitle>Angle</span>
              <span vuiMeta class="tabular-nums">{{ data.angle }}°</span>
              <button
                docsButton="plain"
                small
                icon
                vNoDrag
                type="button"
                [attr.aria-label]="spinning() ? 'Stop turning the gradient' : 'Turn the gradient'"
                (click)="spinning.set(!spinning())">
                <app-demo-icon [name]="spinning() ? 'pause' : 'play'" />
              </button>
            </header>
            <div class="flex p-vui-3">
              <input
                docsRange
                class="min-w-0 flex-1"
                vNoDrag
                vNoWheel
                type="range"
                min="0"
                max="359"
                step="1"
                aria-label="Angle of the gradient"
                [value]="data.angle"
                (input)="setAngle(+$any($event.target).value)" />
            </div>
            <span vuiPort handleType="source" position="right" [vuiPortConnected]="feeds().has(ctx.node.id)"></span>
          </article>
        } @else {
          <article vuiNode class="w-60 text-[13px]">
            <!-- The light the gradient casts on the page: a shadow of each color on its side of the card. -->
            <div
              class="pointer-events-none absolute inset-4 -z-1 rounded-vui-surface forced-colors:hidden"
              aria-hidden="true"
              [style.box-shadow]="glow()"></div>
            <header vuiNodeHeader class="py-vui-2">
              <span vuiTitle>Gradient</span>
            </header>
            @for (row of inputs(); track row.id) {
              <div vuiRow>
                <span
                  vuiPort
                  handleType="target"
                  position="left"
                  [handleId]="row.id"
                  [vuiPortConnected]="row.value !== null"></span>
                <span class="flex-1">{{ row.name }}</span>
                @if (row.color) {
                  <span class="size-3 rounded-full" aria-hidden="true" [style.background]="row.color"></span>
                }
                <span vuiMeta class="tabular-nums" [class.font-doc-mono]="row.color">{{
                  row.value ?? 'not connected'
                }}</span>
              </div>
            }
            <div class="border-t border-vui-separator p-vui-2">
              <div
                class="aspect-3/2 rounded-vui-control"
                role="img"
                aria-label="The gradient the connected nodes make"
                [style.background]="gradient()"></div>
            </div>
          </article>
        }
      </ng-template>

      <!-- An edge has the color it carries; its dashes run toward the gradient while the angle turns. -->
      <svg:g *vEdge="let ctx" vEdgeInteractionArea>
        <svg:path
          vuiEdge
          stroke-dasharray="6 6"
          stroke-linecap="round"
          [attr.d]="ctx.path()"
          [style.stroke]="ctx.selected() ? null : colorOf(ctx.edge.source)">
          @if (spinning()) {
            <svg:animate attributeName="stroke-dashoffset" values="0;-12" dur="0.8s" repeatCount="indefinite" />
          }
        </svg:path>
      </svg:g>
      <ng-template let-ctx vConnection>
        @if (ctx.path(); as path) {
          <svg:path vuiEdge stroke-dasharray="6 6" stroke-linecap="round" [attr.d]="path" />
        }
      </ng-template>
    </vflow>
  `,
})
export class HeroFlowComponent {
  protected readonly swatches = SWATCHES;
  protected readonly motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly flow = viewChild.required(VflowComponent);
  private ready = false;

  /** The angle turns on its own until the reader takes the slider; never for a reader who asked for less motion. */
  protected readonly spinning = signal(this.motion);
  private readonly visible = signal(true);

  protected readonly nodes = createNodes<MixerData>([
    {
      id: 'start',
      point: { x: COMPACT ? 0 : 24, y: 0 },
      data: { kind: 'color', title: 'Start color', color: '#3282b8' },
      ariaLabel: 'Start color',
    },
    {
      id: 'end',
      point: { x: 0, y: COMPACT ? 104 : 112 },
      data: { kind: 'color', title: 'End color', color: '#ff7e6b' },
      ariaLabel: 'End color',
    },
    {
      id: 'angle',
      point: { x: COMPACT ? 0 : 24, y: COMPACT ? 208 : 224 },
      data: { kind: 'angle', angle: 135 },
      ariaLabel: 'Angle',
    },
    { id: 'gradient', point: { x: COMPACT ? 212 : 296, y: 4 }, data: { kind: 'gradient' }, ariaLabel: 'Gradient' },
  ]);

  protected readonly edges = signal<Edge[]>(
    createEdges([
      { id: 'start-gradient', source: 'start', target: 'gradient', targetHandle: 'start' },
      { id: 'end-gradient', source: 'end', target: 'gradient', targetHandle: 'end' },
      { id: 'angle-gradient', source: 'angle', target: 'gradient', targetHandle: 'angle' },
    ]),
  );

  /** The nodes that have an edge to the gradient. */
  protected readonly feeds = computed(() => new Set(this.edges().map((edge) => edge.source)));

  /** The three inputs of the gradient with the value each receives. */
  protected readonly inputs = computed<InputRow[]>(() => {
    const start = this.input('start');
    const end = this.input('end');
    const angle = this.input('angle');

    return [
      { id: 'start', name: 'Start', ...color(start) },
      { id: 'end', name: 'End', ...color(end) },
      { id: 'angle', name: 'Angle', value: angle?.kind === 'angle' ? `${angle.angle}°` : null, color: null },
    ];
  });

  /** An input without an edge leaves its end of the gradient empty; without an angle the gradient runs left to right. */
  protected readonly gradient = computed(() => {
    const [start, end] = this.inputs();
    const empty = 'var(--vui-surface-muted)';

    return `linear-gradient(${this.angleOf()}deg, ${start.color ?? empty}, ${end.color ?? empty})`;
  });

  protected readonly glow = computed(() => {
    const [start, end] = this.inputs();
    const turn = (this.angleOf() * Math.PI) / 180;
    // A CSS gradient of 0deg runs to the top, and its end color is where it runs to.
    const x = Math.round(Math.sin(turn) * GLOW_OFFSET);
    const y = Math.round(-Math.cos(turn) * GLOW_OFFSET);
    const light = (color: string | null) => (color ? `color-mix(in oklab, ${color} 45%, transparent)` : 'transparent');

    return `${-x}px ${-y}px 64px 8px ${light(start.color)}, ${x}px ${y}px 64px 8px ${light(end.color)}`;
  });

  /** A color connects to either end of the gradient, the angle to the angle. */
  protected readonly connection: ConnectionSettings = {
    validator: ({ source, target, targetHandle }) => {
      const kind = this.data(source)?.kind;

      return target === 'gradient' && (kind === 'angle') === (targetHandle === 'angle') && kind !== 'gradient';
    },
  };

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    // The canvas does not pan, so the flow itself keeps the scene in the middle of whatever room the page gives it.
    const resize = new ResizeObserver(() => {
      if (this.ready) this.fit();
    });
    const visibility = new IntersectionObserver(([entry]) => this.visible.set(entry.isIntersecting));

    resize.observe(host);
    visibility.observe(host);
    destroyRef.onDestroy(() => {
      resize.disconnect();
      visibility.disconnect();
    });

    // The angle advances a whole degree at a time, and only while the flow is on screen.
    effect((onCleanup) => {
      if (!this.spinning() || !this.visible()) return;

      const node = this.nodes.find((item) => item.id === 'angle')!;
      let angle = untracked(() => node.data() as { kind: 'angle'; angle: number }).angle;
      let last = performance.now();
      let frame = requestAnimationFrame(function tick(time) {
        const next = (angle + ((time - last) / 1000) * SPIN_SPEED) % 360;

        if (Math.floor(next) !== Math.floor(angle)) node.data.set({ kind: 'angle', angle: Math.floor(next) });
        angle = next;
        last = time;
        frame = requestAnimationFrame(tick);
      });

      onCleanup(() => cancelAnimationFrame(frame));
    });
  }

  protected fit(): void {
    this.ready = true;
    this.flow().fitView({ maxZoom: 1, padding: COMPACT ? 0.05 : 0.1 });
  }

  protected setColor(id: string, title: string, color: string): void {
    this.nodes.find((node) => node.id === id)!.data.set({ kind: 'color', title, color });
  }

  /** The slider takes the angle over: it stops turning. */
  protected setAngle(angle: number): void {
    this.spinning.set(false);
    this.nodes.find((node) => node.id === 'angle')!.data.set({ kind: 'angle', angle });
  }

  /** An input takes one edge: a new connection replaces the old one. */
  protected connect(connection: Connection): void {
    this.edges.update((edges) =>
      addEdges([{ id: crypto.randomUUID(), ...connection }], {
        nodes: this.nodes,
        edges: edges.filter((edge) => edge.targetHandle !== connection.targetHandle),
      }),
    );
  }

  /** Delete removes the selected edges; the four nodes stay. */
  protected remove({ edgeIds }: DeleteRequest): void {
    this.edges.set(removeElements({ nodeIds: [], edgeIds }, { nodes: this.nodes, edges: this.edges() }).edges);
  }

  /**
   * The color an edge carries; on a light page it is drawn toward the text color, so that it stands out. The angle is
   * not a color, so its edge keeps the color of the theme.
   */
  protected colorOf(source: string): string | null {
    const data = this.data(source);

    return data?.kind === 'color' ? `color-mix(in oklab, ${data.color} var(--edge-keep), var(--vui-foreground))` : null;
  }

  private angleOf(): number {
    const angle = this.input('angle');

    return angle?.kind === 'angle' ? angle.angle : 90;
  }

  private data(id: string): MixerData | undefined {
    return this.nodes.find((node) => node.id === id)?.data();
  }

  /** The data of the node wired into an input of the gradient. */
  private input(id: InputId): MixerData | undefined {
    const edge = this.edges().find((item) => item.targetHandle === id);

    return edge && this.data(edge.source);
  }
}

function color(data: MixerData | undefined): Pick<InputRow, 'value' | 'color'> {
  return data?.kind === 'color' ? { value: data.color, color: data.color } : { value: null, color: null };
}
