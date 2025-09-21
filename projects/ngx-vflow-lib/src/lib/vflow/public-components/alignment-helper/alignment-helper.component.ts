import { ChangeDetectionStrategy, Component, computed, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { AlignmentHelperModel } from '../../models/alignment-helper.model';
import { nodeToRect } from '../../utils/nodes';
import { FlowStatusService } from '../../services/flow-status.service';
import { Rect } from '../../interfaces/rect';

@Component({
  selector: 'alignment-helper',
  templateUrl: './alignment-helper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AlignmentHelperComponent implements OnInit {
  private entitiesService = inject(FlowEntitiesService);
  private flowStatus = inject(FlowStatusService);

  private readonly alignmentHelperRef = viewChild.required<TemplateRef<unknown>>('alignmentHelper');

  protected readonly intersections = computed(() => {
    const status = this.flowStatus.status();

    if (status.state === 'node-drag-start') {
      const draggingRect = nodeToRect(status.payload.node);

      const intersections = [];

      for (const node of this.entitiesService.nodes()) {
        if (node === status.payload.node) continue;

        const side = detectCollisionSide(draggingRect, nodeToRect(node));

        if (side) {
          intersections.push(getLinePoints(draggingRect, nodeToRect(node), side));
        }
      }

      return intersections;
    }

    return [];
  });

  ngOnInit(): void {
    const model = new AlignmentHelperModel();
    model.template.set(this.alignmentHelperRef());

    this.entitiesService.alignmentHelper.set(model);
  }
}

type Side = 'left' | 'right' | 'top' | 'bottom';

/**
 * Detect side collision in an axis-aware way.
 * - If horizontal gap <= tolerance and it's the closest axis => returns left/right
 * - If vertical gap <= tolerance and it's the closest axis => returns top/bottom
 * - If neither axis is within tolerance => returns {side: null}
 */
function detectCollisionSide(a: Rect, b: Rect, tolerance = 5): Side | null {
  const aLeft = a.x;
  const aRight = a.x + a.width;
  const aTop = a.y;
  const aBottom = a.y + a.height;

  const bLeft = b.x;
  const bRight = b.x + b.width;
  const bTop = b.y;
  const bBottom = b.y + b.height;

  // horizontal gap between nearest edges (0 if they overlap on X)
  let hGap: number;
  if (aRight < bLeft)
    hGap = bLeft - aRight; // A is left of B
  else if (aLeft > bRight)
    hGap = aLeft - bRight; // A is right of B
  else hGap = 0; // overlap on X

  // vertical gap between nearest edges (0 if they overlap on Y)
  let vGap: number;
  if (aBottom < bTop)
    vGap = bTop - aBottom; // A is above B
  else if (aTop > bBottom)
    vGap = aTop - bBottom; // A is below B
  else vGap = 0; // overlap on Y

  const minGap = Math.min(hGap, vGap);

  // not close enough on any axis
  if (minGap > tolerance) {
    return null;
  }

  // prefer the axis with the smaller gap (tie-break favors X)
  if (hGap <= vGap) {
    // horizontal (left/right) chosen
    // If A is left of B
    if (aRight <= bLeft) return 'left';
    // If A is right of B
    if (aLeft >= bRight) return 'right';

    // If they overlap on X (hGap == 0) — pick the closer side by absolute difference
    const distLeft = Math.abs(aRight - bLeft);
    const distRight = Math.abs(aLeft - bRight);

    return distLeft <= distRight ? 'left' : 'right';
  } else {
    // vertical (top/bottom) chosen
    if (aBottom <= bTop) return 'top';
    if (aTop >= bBottom) return 'bottom';

    const distTop = Math.abs(aBottom - bTop);
    const distBottom = Math.abs(aTop - bBottom);

    return distTop <= distBottom ? 'top' : 'bottom';
  }
}

function getLinePoints(a: Rect, b: Rect, side: Side) {
  const aLeft = a.x;
  const aRight = a.x + a.width;
  const aTop = a.y;
  const aBottom = a.y + a.height;

  const bLeft = b.x;
  const bRight = b.x + b.width;
  const bTop = b.y;
  const bBottom = b.y + b.height;

  if (side === 'left' || side === 'right') {
    const x = side === 'left' ? bLeft : bRight;

    // overlap on Y ?
    const overlapY1 = Math.max(aTop, bTop);
    const overlapY2 = Math.min(aBottom, bBottom);
    if (overlapY1 < overlapY2) {
      // there is vertical overlap — draw over overlap interval
      return {
        x1: x,
        y1: overlapY1,
        x2: x,
        y2: overlapY2,
      };
    } else {
      // no vertical overlap — draw between centers of the sides
      const centerA = aTop + a.height / 2;
      const centerB = bTop + b.height / 2;

      return {
        x1: x,
        y1: Math.min(centerA, centerB),
        x2: x,
        y2: Math.max(centerA, centerB),
      };
    }
  }

  // top or bottom => horizontal line
  if (side === 'top' || side === 'bottom') {
    const y = side === 'top' ? bTop : bBottom;

    const overlapX1 = Math.max(aLeft, bLeft);
    const overlapX2 = Math.min(aRight, bRight);

    if (overlapX1 < overlapX2) {
      return {
        x1: overlapX1,
        y1: y,
        x2: overlapX2,
        y2: y,
      };
    } else {
      const centerA = aLeft + a.width / 2;
      const centerB = bLeft + b.width / 2;

      return {
        x1: Math.min(centerA, centerB),
        y1: y,
        x2: Math.max(centerA, centerB),
        y2: y,
      };
    }
  }

  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}
