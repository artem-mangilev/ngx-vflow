import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
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

const INPUTS: InputId[] = ['start', 'end', 'angle'];

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
const DOT_GAP = 22;
/** The least zoom of a flow, which the first fit does not go under either. */
const MIN_ZOOM = 0.5;
/**
 * The entrance, in milliseconds from the first frame the reader sees. The nodes are simply there; after a beat the
 * three wires draw themselves from the controls to the gradient, each starting while the one before is still on its
 * way and after a shorter gap, so they read as one wave. A wire delivers its value shortly before its line is whole:
 * the color is in the gradient as the wire lands. When the angle has arrived the gradient turns to it, and then starts
 * to turn on its own.
 */
const WIRE_STARTS: Record<InputId, number> = { start: 150, end: 290, angle: 400 };
const WIRE_DRAW = 500;
const WIRE_LANDS_BEFORE_END = 80;
const ANGLE_SETTLE = 450;
/** The curve of a line being drawn: it moves on the screen, so it eases at both ends. */
const DRAW_EASING = 'cubic-bezier(0.645, 0.045, 0.355, 1)';
/** How far, in pixels, the light of each color lies from the middle of the card. */
const GLOW_OFFSET = 40;

/**
 * The flow at the top of the landing page: two colors and an angle wired into a gradient. Its canvas is the whole hero
 * section, under the copy of the page, and its nodes stand on the page itself. It opens with the nodes fitted into
 * `slot`, the room the page keeps for them beside the copy; from there the reader drags them anywhere, and pans with
 * a mouse or a trackpad, while a finger on the canvas scrolls the page. The canvas does not zoom: it is as large as
 * the first screen, where a wheel has to scroll the page.
 *
 * It enters once, by wiring itself up: see `WIRE_STARTS`. The nodes have no entrance of their own, one motion being
 * enough for one scene, and can be used from the first frame; a press or a key ends the entrance at once, and a reader
 * who asked for less motion gets the wired flow at once.
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
  host: {
    class: 'relative block size-full [--v-background:transparent] [--edge-keep:72%] dark:[--edge-keep:100%]',
  },
  template: `
    <!--
      The dots of the canvas: they follow the viewport, and are gathered around the slot and fade into the page. The
      background of the flow would cover the section evenly, under the copy as well.
    -->
    <div
      class="pointer-events-none absolute inset-0
        [mask-image:radial-gradient(ellipse_44rem_30rem_at_var(--slot-x,75%)_var(--slot-y,50%),black_35%,transparent)]"
      aria-hidden="true"
      [style.background-image]="dots().image"
      [style.background-size]="dots().size"
      [style.background-position]="dots().position"></div>
    <vflow
      [nodes]="nodes"
      [edges]="edges()"
      [connection]="connection"
      [panOnDrag]="finePointer"
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
            <div class="flex justify-between p-vui-3" vNoDrag vNoSelect role="group" [attr.aria-label]="data.title">
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
                vNoSelect
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
                vNoSelect
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
              [class]="entering() ? '[transition:box-shadow_450ms_var(--ease-out-strong)]' : ''"
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
              <!--
                A color fades into the gradient when it changes: slowly while it arrives during the entrance, quickly
                when the reader picks one, since that is feedback to a press. The angle is not eased, since it turns
                by itself, except during the entrance, where the gradient turns to the angle that has just arrived.
              -->
              <div
                class="aspect-3/2 rounded-vui-control bg-[linear-gradient(var(--mix-angle),var(--mix-from),var(--mix-to))]"
                role="img"
                aria-label="The gradient the connected nodes make"
                [class]="
                  entering()
                    ? '[transition:--mix-from_300ms_var(--ease-out-strong),--mix-to_300ms_var(--ease-out-strong),--mix-angle_450ms_var(--ease-out-strong)]'
                    : '[transition:--mix-from_150ms_ease,--mix-to_150ms_ease]'
                "
                [style.--mix-from]="mix().from"
                [style.--mix-to]="mix().to"
                [style.--mix-angle]="mix().angle"></div>
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
  /** A touch screen keeps the drag on the canvas for scrolling the page, which has no other place to be scrolled by. */
  protected readonly finePointer = matchMedia('(pointer: fine)').matches;
  protected readonly motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** The box of the page the nodes are fitted into at the start, and again when the page is resized. */
  readonly slot = input.required<HTMLElement>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly flow = viewChild.required(VflowComponent);
  private ready = false;

  /** A dot every 22 flow pixels, drawn as a CSS background that moves and scales with the viewport. */
  protected readonly dots = computed(() => {
    const { x, y, zoom } = this.flow().viewport();
    const gap = DOT_GAP * zoom;
    const radius = 1.25 * zoom;

    return {
      image: `radial-gradient(circle, var(--color-doc-border) ${radius}px, transparent ${radius + 0.5}px)`,
      size: `${gap}px ${gap}px`,
      // A tile has its dot in the middle; the offset puts a dot on the origin of the flow.
      position: `${x - gap / 2}px ${y - gap / 2}px`,
    };
  });

  /** The angle turns on its own until the reader takes the slider; never for a reader who asked for less motion. */
  protected readonly spinning = signal(this.motion);
  private readonly visible = signal(true);

  /** The inputs whose wire is still on its way during the entrance: the gradient does not have their values yet. */
  private readonly arriving = signal<ReadonlySet<InputId>>(new Set(this.motion ? INPUTS : []));
  /** Whether the entrance is still playing. */
  protected readonly entering = signal(this.motion);
  private entered = false;
  private entrance: { animations: Animation[]; timers: ReturnType<typeof setTimeout>[] } = {
    animations: [],
    timers: [],
  };

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

  /** The nodes whose edge has reached the gradient. */
  protected readonly feeds = computed(
    () =>
      new Set(
        this.edges()
          .filter((edge) => !this.arriving().has(edge.targetHandle as InputId))
          .map((edge) => edge.source),
      ),
  );

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
  protected readonly mix = computed(() => {
    const [start, end] = this.inputs();
    const empty = 'var(--vui-surface-muted)';

    return { from: start.color ?? empty, to: end.color ?? empty, angle: `${this.angleOf()}deg` };
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
    const host = this.host;
    const destroyRef = inject(DestroyRef);

    // The canvas has no frame and no controls, so the flow itself brings the scene back into the slot when the page
    // gives it another room.
    const resize = new ResizeObserver(() => {
      if (this.ready) this.fit();
    });
    const visibility = new IntersectionObserver(([entry]) => this.visible.set(entry.isIntersecting));
    // The reader does not wait for the entrance: the first press or key ends it.
    const interrupt = () => this.finishEntrance();

    resize.observe(host);
    visibility.observe(host);
    host.addEventListener('pointerdown', interrupt, { capture: true });
    host.addEventListener('keydown', interrupt, { capture: true });
    effect(() => resize.observe(this.slot()));
    destroyRef.onDestroy(() => {
      resize.disconnect();
      visibility.disconnect();
      host.removeEventListener('pointerdown', interrupt, { capture: true });
      host.removeEventListener('keydown', interrupt, { capture: true });
      this.entrance.timers.forEach(clearTimeout);
      this.entrance.animations.forEach((animation) => animation.cancel());
      this.entrance = { animations: [], timers: [] };
    });

    // The angle advances a whole degree at a time, only while the flow is on screen and once it has entered.
    effect((onCleanup) => {
      if (!this.spinning() || !this.visible() || this.entering()) return;

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

  /** Fits the nodes into the slot, at their own size where the slot has the room. */
  protected fit(): void {
    this.ready = true;
    if (!this.entered) this.enter();

    const flow = this.flow();
    const nodes = flow.getNodesBounds();
    const host = this.host.getBoundingClientRect();
    const slot = this.slot().getBoundingClientRect();
    const zoom = Math.max(MIN_ZOOM, Math.min(1, slot.width / nodes.width, slot.height / nodes.height));
    const center = { x: slot.left - host.left + slot.width / 2, y: slot.top - host.top + slot.height / 2 };

    // The dots gather around the same point.
    this.host.style.setProperty('--slot-x', `${center.x}px`);
    this.host.style.setProperty('--slot-y', `${center.y}px`);
    flow.setViewport({
      x: center.x - (nodes.x + nodes.width / 2) * zoom,
      y: center.y - (nodes.y + nodes.height / 2) * zoom,
      zoom,
    });
  }

  /**
   * Plays the entrance. The flow calls this before its first frame is painted, so the wires are hidden from the start;
   * the clock starts two frames later, with the frame the reader sees, or a busy page load would swallow the
   * beginning. The lines are revealed from the left by a clip: a dash pattern would do it too, but the wires are
   * dashed already.
   */
  private enter(): void {
    this.entered = true;
    if (!this.motion) return;

    const entrance = this.entrance;
    const landings: [InputId, number][] = [];

    for (const edge of this.edges()) {
      const input = edge.targetHandle as InputId;
      const wire = this.host.querySelector<SVGPathElement>(`[data-v-edge="${edge.id}"] path.vui-edge`);
      const starts = WIRE_STARTS[input];

      // A wire that is not drawn yet has nothing to play: its value is simply there.
      if (!wire) {
        this.land(input);
        continue;
      }

      entrance.animations.push(
        wire.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
          delay: starts,
          duration: WIRE_DRAW,
          easing: DRAW_EASING,
          fill: 'backwards',
        }),
      );
      landings.push([input, starts + WIRE_DRAW - WIRE_LANDS_BEFORE_END]);
    }

    // Held on their first frame until the clock starts.
    entrance.animations.forEach((animation) => animation.pause());
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        // Ended by the reader, or the page was left, in the meantime.
        if (this.entrance !== entrance) return;

        entrance.animations.forEach((animation) => animation.play());
        for (const [input, at] of landings) entrance.timers.push(setTimeout(() => this.land(input), at));

        const landed = Math.max(...Object.values(WIRE_STARTS)) + WIRE_DRAW - WIRE_LANDS_BEFORE_END;
        entrance.timers.push(setTimeout(() => this.entering.set(false), landed + ANGLE_SETTLE));
      }),
    );
  }

  /** The wire of an input has reached the gradient. */
  private land(input: InputId): void {
    this.arriving.update((arriving) => new Set([...arriving].filter((id) => id !== input)));
  }

  /** Ends the entrance where it is; before the flow is ready, that is before it has started, and it will not play. */
  private finishEntrance(): void {
    this.entered = true;
    this.entrance.animations.forEach((animation) => animation.finish());
    this.entrance.timers.forEach(clearTimeout);
    this.entrance = { animations: [], timers: [] };
    this.arriving.set(new Set());
    this.entering.set(false);
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

  /** The data of the node wired into an input of the gradient; nothing while its wire is on the way. */
  private input(id: InputId): MixerData | undefined {
    if (this.arriving().has(id)) return undefined;

    const edge = this.edges().find((item) => item.targetHandle === id);

    return edge && this.data(edge.source);
  }
}

function color(data: MixerData | undefined): Pick<InputRow, 'value' | 'color'> {
  return data?.kind === 'color' ? { value: data.color, color: data.color } : { value: null, color: null };
}
