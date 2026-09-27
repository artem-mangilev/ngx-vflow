import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AlignmentService } from '../../services/alignment.service';
import { ViewportService } from '../../services/viewport.service';

/** Half the size of the cross on an aligned point, in screen pixels. */
const CROSS = 3;
/** Half the length of a tick on an equal gap, in screen pixels. */
const TICK = 4;

/** Draws the guides of the drag in progress: aligned lines, straight edges and equal gaps. */
@Component({
  selector: 'g[alignmentHelper]',
  templateUrl: './alignment-helper.component.html',
  styles: [
    `
      .vflow-alignment-line {
        stroke: var(--vflow-foreground);
        stroke-width: 1;
        fill: none;
        vector-effect: non-scaling-stroke;
      }

      @media (forced-colors: active) {
        .vflow-alignment-line {
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

  /** Crosses on the aligned points and the ticked segments of equal gaps, kept at a fixed screen size. */
  protected readonly marks = computed(() => {
    const { lines, gaps } = this.guides();
    if (!lines.length && !gaps.length) return null;

    const zoom = this.viewportService.readableViewport().zoom;
    const cross = CROSS / zoom;
    const tick = TICK / zoom;
    let d = '';

    for (const { x, y } of lines.flatMap((line) => line.points)) {
      d += `M${x - cross},${y - cross}L${x + cross},${y + cross}M${x - cross},${y + cross}L${x + cross},${y - cross}`;
    }

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
