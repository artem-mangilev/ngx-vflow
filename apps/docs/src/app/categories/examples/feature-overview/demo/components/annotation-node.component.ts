import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectNode } from 'ngx-vflow';

export interface AnnotationData {
  number: number;
  text: string;
  /** The arrow from the text to what it describes: the side of the text it is on, its box and its path in that box. */
  arrow?: { side: 'left' | 'right' | 'below'; width: number; height: number; path: string };
}

const SIDES = { left: 'flex-row-reverse', right: 'flex-row', below: 'flex-col items-center' };

/**
 * A note on the canvas: text and an arrow, without a card. It is a node like any other, so it pans and zooms with
 * the flow; its data keeps it from being dragged, selected or focused.
 */
@Component({
  template: `
    @let note = ctx.data();

    <figure
      class="m-0 flex w-max gap-vui-2 text-[13px] leading-5 text-vui-muted"
      [class]="sides[note.arrow?.side ?? 'right']">
      <figcaption class="w-45">
        <span class="font-semibold text-vui-foreground">{{ note.number }}.</span>
        {{ note.text }}
      </figcaption>

      @if (note.arrow; as arrow) {
        <svg
          class="flex-none overflow-visible"
          aria-hidden="true"
          [attr.width]="arrow.width"
          [attr.height]="arrow.height"
          [attr.viewBox]="'0 0 ' + arrow.width + ' ' + arrow.height">
          <defs>
            <marker viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto" [id]="marker">
              <path d="M2 1L8 5L2 9" class="fill-none stroke-current" stroke-width="1.5" stroke-linecap="round" />
            </marker>
          </defs>
          <path
            class="fill-none stroke-current"
            stroke-width="1.5"
            stroke-linecap="round"
            [attr.d]="arrow.path"
            [attr.marker-end]="'url(#' + marker + ')'" />
        </svg>
      }
    </figure>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationNodeComponent {
  protected readonly ctx = injectNode<AnnotationData>();
  protected readonly sides = SIDES;

  /** A marker is found by its id in the whole document, so every note has its own. */
  protected readonly marker = `note-arrow-${this.ctx.node.id}`;
}
