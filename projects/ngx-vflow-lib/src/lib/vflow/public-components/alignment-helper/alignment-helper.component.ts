import { ChangeDetectionStrategy, Component, computed, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { AlignmentHelperModel } from '../../models/alignment-helper.model';
import { nodeToRect } from '../../utils/nodes';
import { FlowStatusService, isNodeDragEndStatus, isNodeDragStartStatus } from '../../services/flow-status.service';
import { rectToRectWithSides } from '../../interfaces/rect';
import { Box } from '../../interfaces/box';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, map, tap } from 'rxjs';
import { extendedComputed } from '../../utils/signals/extended-computed';

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

  protected isNodeDragging = computed(() => isNodeDragStartStatus(this.flowStatus.status()));

  protected readonly intersections = extendedComputed<{ lines: Box[]; snappedX: number; snappedY: number }>(
    (lastValue) => {
      const status = this.flowStatus.status();

      if (isNodeDragStartStatus(status)) {
        const node = status.payload.node;

        const d = rectToRectWithSides(nodeToRect(node));
        const otherRects = this.entitiesService
          .nodes()
          .filter((n) => n !== node)
          .map((n) => rectToRectWithSides(nodeToRect(n)));

        const lines: Box[] = [];

        let snappedX = d.x;
        let snappedY = d.y;
        let closestXDiff = Infinity;
        let closestYDiff = Infinity;

        otherRects.forEach((o) => {
          const dCenterX = d.left + d.width / 2;
          const oCenterX = o.left + o.width / 2;

          for (const [dX, oX, snapX, isCenter] of [
            // center check
            [dCenterX, oCenterX, oCenterX - d.width / 2, true] as const,
            [d.left, o.left, o.left, false] as const,
            [d.left, o.right, o.right, false] as const,
            [d.right, o.left, o.left - d.width, false] as const,
            [d.right, o.right, o.right - d.width, false] as const,
          ]) {
            const diff = Math.abs(dX - oX);

            if (diff <= 10) {
              const y = Math.min(d.top, o.top);
              const y2 = Math.max(d.bottom, o.bottom);

              lines.push({ x: oX, y, x2: oX, y2 });

              if (diff < closestXDiff) {
                closestXDiff = diff;
                snappedX = snapX;
              }

              if (isCenter) break;
            }
          }

          const dCenterY = d.top + d.height / 2;
          const oCenterY = o.top + o.height / 2;

          for (const [dY, oY, snapY, isCenter] of [
            // center check
            [dCenterY, oCenterY, oCenterY - d.height / 2, true] as const,
            [d.top, o.top, o.top, false] as const,
            [d.top, o.bottom, o.bottom, false] as const,
            [d.bottom, o.top, o.top - d.height, false] as const,
            [d.bottom, o.bottom, o.bottom - d.height, false] as const,
          ]) {
            const diff = Math.abs(dY - oY);

            if (diff <= 10) {
              const x = Math.min(d.left, o.left);
              const x2 = Math.max(d.right, o.right);

              lines.push({ x, y: oY, x2, y2: oY });

              if (diff < closestYDiff) {
                closestYDiff = diff;
                snappedY = snapY;
              }

              if (isCenter) break;
            }
          }
        });

        return { lines, snappedX, snappedY };
      }

      return lastValue;
    },
  );

  constructor() {
    toObservable(this.flowStatus.status)
      .pipe(
        filter(isNodeDragEndStatus),
        map((status) => status.payload.node),
        map((node) => [node, this.intersections()] as const),
        tap(([node, intersections]) => {
          if (intersections) {
            node.setPoint({ x: intersections.snappedX, y: intersections.snappedY });
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  ngOnInit(): void {
    const model = new AlignmentHelperModel();
    model.template.set(this.alignmentHelperRef());

    this.entitiesService.alignmentHelper.set(model);
  }
}
