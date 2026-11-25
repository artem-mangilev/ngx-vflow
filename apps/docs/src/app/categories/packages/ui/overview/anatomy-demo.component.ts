import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Vui } from '@vflow/ui';
import { Point, Vflow, VflowComponent, createNodes } from 'ngx-vflow';

type Side = 'top' | 'left' | 'right';

/** A part, the side its callout sits on, and the point of the part its arrow ends at. */
interface Callout {
  part: string;
  side: Side;
  selector: string;
  at: (box: DOMRect) => Point;
}

const left = (box: DOMRect): Point => ({ x: box.left, y: box.top + box.height / 2 });
const right = (box: DOMRect): Point => ({ x: box.right, y: box.top + box.height / 2 });
const center = (box: DOMRect): Point => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

const CALLOUTS: Callout[] = [
  { part: 'vuiNode', side: 'top', selector: '.vui-node', at: (box) => ({ x: box.left + box.width * 0.3, y: box.top }) },
  { part: 'vuiNodeHeader', side: 'left', selector: '.vui-node-header', at: left },
  { part: 'vuiPort', side: 'left', selector: '.vui-port[data-v-handle-type="target"]', at: center },
  { part: 'vuiNodeFooter', side: 'left', selector: '.vui-node-footer', at: left },
  { part: 'vuiTitle', side: 'right', selector: '.vui-title', at: right },
  { part: 'vuiRow', side: 'right', selector: '.vui-row', at: right },
  { part: 'vuiPort', side: 'right', selector: '.vui-port[data-v-handle-type="source"]', at: center },
  { part: 'vuiMeta', side: 'right', selector: '.vui-node-footer .vui-meta', at: right },
];

/** Distance between the card and the end of a callout label, and the least vertical gap between two labels. */
const REACH = 64;
const GAP = 30;

interface Placed {
  part: string;
  side: Side;
  label: Point;
  /** The line from the label to the part, as an SVG path. */
  path: string;
}

/**
 * A line that bows a little, as a hand-drawn arrow does: a quadratic curve whose control point lies off the middle of
 * the straight line, always on its upper side.
 */
function sketch(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  let normal = { x: -dy / length, y: dx / length };
  if (normal.y > 0 || (normal.y === 0 && normal.x > 0)) normal = { x: -normal.x, y: -normal.y };
  const bow = Math.min(12, length * 0.12);
  const control = { x: from.x + dx / 2 + normal.x * bow, y: from.y + dy / 2 + normal.y * bow };
  return `M${from.x} ${from.y} Q${control.x} ${control.y} ${to.x} ${to.y}`;
}

/**
 * One node built from the parts, with a callout for each of them. The callouts are flow content placed with
 * `vPortal`, so they pan and zoom with the node. Where an arrow ends is measured from the rendered parts once the flow
 * has its first layout, so the figure follows the theme's spacing.
 */
@Component({
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block size-full' },
  template: `<vflow #flow [nodes]="nodes" (initialized)="measure()">
    <article *vNode="let ctx" vuiNode class="w-56 text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>Send invoice</span>
      </header>
      <div vuiRow>
        Order
        <span vuiPort handleType="target" position="left" [canStart]="false"></span>
      </div>
      <div vuiRow>
        Invoice
        <span vuiPort handleType="source" position="right" [canStart]="false"></span>
      </div>
      <footer vuiNodeFooter>
        <span vuiMeta>Due tomorrow</span>
      </footer>
    </article>

    <div *vPortal="origin" data-testid="anatomy-callouts">
      <svg class="absolute top-0 left-0 overflow-visible text-vui-muted/60" width="1" height="1" aria-hidden="true">
        <defs>
          <marker
            id="vui-anatomy-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            markerUnits="userSpaceOnUse"
            orient="auto">
            <path
              d="M2 1.5 8 5 2 8.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </marker>
        </defs>
        @for (callout of callouts(); track $index) {
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-dasharray="3 4"
            stroke-linecap="round"
            marker-end="url(#vui-anatomy-arrow)"
            [attr.d]="callout.path" />
        }
      </svg>
      @for (callout of callouts(); track $index) {
        <code
          class="absolute -translate-y-1/2 whitespace-nowrap rounded-vui-control border border-solid border-vui-border
            bg-vui-surface px-1.5 py-0.5 font-mono text-xs text-vui-foreground"
          [class.-translate-x-full]="callout.side === 'left'"
          [class.-translate-x-1/2]="callout.side === 'top'"
          [style.left.px]="callout.label.x"
          [style.top.px]="callout.label.y"
          >{{ callout.part }}</code
        >
      }
    </div>
  </vflow>`,
})
export class AnatomyDemoComponent {
  private readonly flow = viewChild.required(VflowComponent);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The node and the portal share the origin of the flow, so measured points are positions in the portal. */
  protected readonly origin: Point = { x: 0, y: 0 };
  protected readonly nodes = createNodes([
    { id: 'anatomy', point: this.origin, draggable: false, selectable: false, ariaLabel: 'Node built from the parts' },
  ]);
  protected readonly callouts = signal<Placed[]>([]);

  protected measure(): void {
    const flow = this.flow();
    const node = this.host.nativeElement.querySelector('[data-v-node="anatomy"]');
    if (!node) return;

    const toFlow = (point: Point) => flow.clientToFlowPosition(point);
    const card = node.querySelector('.vui-node')!.getBoundingClientRect();
    const cardLeft = toFlow({ x: card.left, y: card.top }).x;
    const cardRight = toFlow({ x: card.right, y: card.top }).x;

    const target = (callout: Callout) =>
      toFlow(callout.at(node.querySelector(callout.selector)!.getBoundingClientRect()));

    const placed: Placed[] = [];
    for (const side of ['left', 'right'] as const) {
      const labelX = side === 'left' ? cardLeft - REACH : cardRight + REACH;
      let previous = -Infinity;

      CALLOUTS.filter((callout) => callout.side === side)
        .map((callout) => ({ callout, to: target(callout) }))
        .sort((a, b) => a.to.y - b.to.y)
        .forEach(({ callout, to }) => {
          // Labels keep the order of their parts and spread apart where the parts are close.
          const y = Math.max(to.y, previous + GAP);
          previous = y;
          const from = { x: side === 'left' ? labelX + 6 : labelX - 6, y };
          placed.push({ part: callout.part, side, label: { x: labelX, y }, path: sketch(from, to) });
        });
    }
    for (const callout of CALLOUTS.filter(({ side }) => side === 'top')) {
      const to = target(callout);
      const label = { x: to.x - 36, y: to.y - 48 };
      placed.push({ part: callout.part, side: 'top', label, path: sketch({ x: label.x, y: label.y + 14 }, to) });
    }

    this.callouts.set(placed);
    // The callouts are not part of the graph, so the fit leaves room for them around the node.
    flow.fitView({ padding: 0.9, maxZoom: 1 });
  }
}
