import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FILTERS, Picture } from './image-lab';

/** Draws a picture tree with CSS: an image, a `filter` around its input, or two inputs stacked with a blend mode. */
@Component({
  selector: 'app-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'picture' },
  styles: `
    :host {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
    }
    img,
    .layer {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    /* Blending stays inside the stack instead of mixing with the node behind it. */
    .stack {
      position: relative;
      isolation: isolate;
    }
    .top {
      position: absolute;
      inset: 0;
    }
  `,
  template: `
    @let p = picture();
    @switch (p.kind) {
      @case ('image') {
        <img alt="" draggable="false" [src]="p.src" />
      }
      @case ('filter') {
        <div class="layer" [style.filter]="filter(p.fn, p.amount)">
          <app-picture [picture]="p.input" [width]="width()" />
        </div>
      }
      @case ('blend') {
        <div class="layer stack">
          <app-picture [picture]="p.a" [width]="width()" />
          <app-picture class="top" [picture]="p.b" [width]="width()" [style.mix-blend-mode]="p.mode" />
        </div>
      }
    }
  `,
})
export class PictureComponent {
  readonly picture = input.required<Picture>();
  /** Drawn width in CSS pixels: blur is relative to it. */
  readonly width = input.required<number>();

  protected filter(fn: keyof typeof FILTERS, amount: number) {
    return FILTERS[fn].css(amount, this.width());
  }
}
