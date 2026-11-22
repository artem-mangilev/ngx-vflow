import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { Vui } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

/**
 * Presentations shared by the documentation demos. Core is headless: every demo supplies
 * node and edge templates. These components use `@vflow/ui` so feature demos
 * can focus on the feature instead of drawing; copy them or replace them with your own.
 */

interface NodeCtx {
  node: { id: string };
  /** `type: 'group'` marks a group; the application owns this discriminator. */
  data: () => { text?: string; title?: string; type?: string } | undefined;
  selected: () => boolean;
  preselected: () => boolean;
  width: () => number;
  height: () => number;
}

interface EdgeCtx {
  edge: { id: string };
  path: () => string;
  markerStart: () => string;
  markerEnd: () => string;
  selected: () => boolean;
  preselected: () => boolean;
  /** A string `label` in the data renders at the center of the edge; data of any other shape is accepted. */
  data: () => unknown;
}

/** A card with the node's text and a target/source handle pair, or a titled group for `data.type === 'group'`. */
@Component({
  selector: 'docs-node',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (isGroup()) {
      <div vuiGroup class="text-[13px]" [style.width.px]="ctx().width()" [style.height.px]="ctx().height()">
        @if (title(); as title) {
          <header vuiGroupHeader>
            <span vuiTitle>{{ title }}</span>
          </header>
        }
      </div>
    } @else {
      <div vuiNode class="grid w-25 min-h-12.5 place-items-center px-2 py-1 text-center text-[13px]">
        @if (html()) {
          <span [innerHTML]="text()"></span>
        } @else {
          <span>{{ text() }}</span>
        }
        @if (floating()) {
          <!-- One handle whose point faces the other end of each edge: the card has no ports. -->
          <span vHandle handleType="any" position="auto" [canStart]="connectable()" [canAccept]="connectable()"></span>
        } @else {
          <span
            vuiPort
            handleType="target"
            position="left"
            [canStart]="connectable()"
            [canAccept]="connectable()"></span>
          <span
            vuiPort
            handleType="source"
            position="right"
            [canStart]="connectable()"
            [canAccept]="connectable()"></span>
        }
      </div>
    }
  `,
})
export class DocsNodeComponent {
  readonly ctx = input.required<NodeCtx>();
  /** Whether the ports start and accept connections; a demo whose edges are fixed turns it off. */
  readonly connectable = input(true);
  /** One floating handle instead of the left and right ports: the edges meet the side that faces the other end. */
  readonly floating = input(false, { transform: booleanAttribute });
  protected readonly isGroup = computed(() => this.ctx().data()?.type === 'group');
  protected readonly title = computed(() => this.ctx().data()?.text ?? this.ctx().data()?.title ?? '');
  protected readonly text = computed(() => this.ctx().data()?.text ?? this.ctx().data()?.title ?? this.ctx().node.id);
  /** Only markup goes through the HTML sanitizer: it parses every value with a DOM parser, which adds up in large graphs. */
  protected readonly html = computed(() => /<[a-z!/]/i.test(this.text()));
}

/**
 * An edge path with the core markers of the edge and, when `data.label` is set, a center label. The interaction stroke
 * sits inside the host group, so hover and clicks near the line reach this presentation.
 */
@Component({
  selector: 'g[docsEdge]',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:path
      vuiEdge
      [attr.d]="ctx().path()"
      [attr.marker-start]="ctx().markerStart()"
      [attr.marker-end]="ctx().markerEnd()" />
    @if (label(); as label) {
      <span *vEdgeLabel vuiEdgeLabel>{{ label }}</span>
    }
  `,
})
export class DocsEdgeComponent {
  readonly ctx = input.required<EdgeCtx>();
  protected readonly label = computed(() => {
    const label = (this.ctx().data() as { label?: unknown } | undefined)?.label;

    return typeof label === 'string' ? label : undefined;
  });
}

/** Import into a demo and place the node and edge templates inside `<vflow>`. */
export const DocsPresentations = [DocsNodeComponent, DocsEdgeComponent] as const;
