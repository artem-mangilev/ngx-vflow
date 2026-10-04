import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AlignmentService } from '../../services/alignment.service';
import { ViewportService } from '../../services/viewport.service';

/** Radius of the dot on an aligned point, in screen pixels. */
const DOT = 2;
/** Half the length of a tick on an equal gap, in screen pixels. */
const TICK = 4;

/** Draws the guides of the drag in progress: aligned lines, straight edges and equal gaps. */
@Component({
  selector: 'g[alignmentHelper]',
  templateUrl: './alignment-helper.component.html',
  // The whole group is faded at once, so crossings of lines, dots and ticks do not darken.
  host: { class: 'v-alignment-guides' },
  styles: [
    `
      :host {
        color: var(--v-foreground);
        opacity: 0.5;
      }

      .v-alignment-line {
        stroke: currentColor;
        stroke-width: 1;
        fill: none;
        vector-effect: non-scaling-stroke;
      }

      .v-alignment-point {
        fill: currentColor;
      }

      @media (forced-colors: active) {
        :host {
          opacity: 1;
        }

        .v-alignment-line,
        .v-alignment-point {
          forced-color-adjust: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AlignmentHelperComponent {
  private viewportService = inject(ViewportService);

  protected readonly guides = inject(AlignmentService).guides;

  /** Dots on the aligned points, kept at a fixed screen size. */
  protected readonly points = computed(() => {
    const { lines } = this.guides();
    if (!lines.length) return null;

    const r = DOT / this.viewportService.readableViewport().zoom;
    const seen = new Set<string>();
    let d = '';

    for (const { x, y } of lines.flatMap((line) => line.points)) {
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      d += `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
    }

    return d;
  });

  /** The ticked segments of equal gaps, kept at a fixed screen size. */
  protected readonly gaps = computed(() => {
    const { gaps } = this.guides();
    if (!gaps.length) return null;

    const tick = TICK / this.viewportService.readableViewport().zoom;
    let d = '';

    for (const { axis, from, to, at } of gaps) {
      const middle = (from + to) / 2;
      d +=
        axis === 'x'
          ? `M${from},${at}H${to}M${from},${at - tick}V${at + tick}M${to},${at - tick}V${at + tick}M${middle},${at - tick}V${at + tick}`
          : `M${at},${from}V${to}M${at - tick},${from}H${at + tick}M${at - tick},${to}H${at + tick}M${at - tick},${middle}H${at + tick}`;
    }

    return d;
  });
}
