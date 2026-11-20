import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Point } from 'ngx-vflow';

export interface Note {
  number: number;
  text: string;
  /** Flow-space point of the note's top-left corner. */
  point: Point;
  /** The arrow from the text to what it describes: the side of the text it is on, its box and its path in that box. */
  arrow: { side: 'left' | 'right' | 'below'; width: number; height: number; path: string };
}

const SIDES = { left: 'flex-row-reverse', right: 'flex-row', below: 'flex-col items-center' };

/**
 * A note on the canvas: text and an arrow, without a card. The demo places it with `*vPortal`, so it pans and zooms
 * with the flow without being a node: guides, the minimap and the selection leave it out.
 */
@Component({
  selector: 'app-note',
  template: `
    @let arrow = note().arrow;

    <figure class="m-0 flex w-max gap-vui-2 text-[13px] leading-5 text-vui-muted" [class]="sides[arrow.side]">
      <figcaption class="w-45">
        <span class="font-semibold text-vui-foreground">{{ note().number }}.</span>
        {{ note().text }}
      </figcaption>

      <svg
        class="flex-none overflow-visible"
        aria-hidden="true"
        [attr.width]="arrow.width"
        [attr.height]="arrow.height"
        [attr.viewBox]="'0 0 ' + arrow.width + ' ' + arrow.height">
        <defs>
          <marker viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto" [id]="marker()">
            <path d="M2 1L8 5L2 9" class="fill-none stroke-current" stroke-width="1.5" stroke-linecap="round" />
          </marker>
        </defs>
        <path
          class="fill-none stroke-current"
          stroke-width="1.5"
          stroke-linecap="round"
          [attr.d]="arrow.path"
          [attr.marker-end]="'url(#' + marker() + ')'" />
      </svg>
    </figure>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent {
  readonly note = input.required<Note>();

  protected readonly sides = SIDES;

  /** A marker is found by its id in the whole document, so every note has its own. */
  protected readonly marker = computed(() => `note-arrow-${this.note().number}`);
}
