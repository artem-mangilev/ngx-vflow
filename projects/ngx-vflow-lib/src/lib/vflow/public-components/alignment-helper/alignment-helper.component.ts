import { ChangeDetectionStrategy, Component, computed, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { AlignmentHelperModel } from '../../models/alignment-helper.model';
import { nodeToRect } from '../../utils/nodes';
import { FlowStatusService } from '../../services/flow-status.service';
import { rectToRectWithSides } from '../../interfaces/rect';
import { Box } from '../../interfaces/box';

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
      const node = status.payload.node;

      const d = rectToRectWithSides(nodeToRect(node));
      const otherRects = this.entitiesService
        .nodes()
        .filter((n) => n !== node)
        .map((n) => rectToRectWithSides(nodeToRect(n)));

      const lines: Box[] = [];

      otherRects.forEach((o) => {
        for (const [dX, oX, isCenter] of [
          // center check
          [d.left + d.width / 2, o.left + o.width / 2, true] as const,
          [d.left, o.left, false] as const,
          [d.left, o.right, false] as const,
          [d.right, o.left, false] as const,
          [d.right, o.right, false] as const,
        ]) {
          if (Math.abs(dX - oX) <= 10) {
            lines.push({ x: oX, y: -10000, x2: oX, y2: 10000 });

            if (isCenter) break;
          }
        }

        for (const [dY, oY, isCenter] of [
          // center check
          [d.top + d.height / 2, o.top + o.height / 2, true] as const,
          [d.top, o.top, false] as const,
          [d.top, o.bottom, false] as const,
          [d.bottom, o.top, false] as const,
          [d.bottom, o.bottom, false] as const,
        ]) {
          if (Math.abs(dY - oY) <= 10) {
            lines.push({ x: -10000, y: oY, x2: 10000, y2: oY });
          }

          if (isCenter) break;
        }
      });

      return lines;
    }

    return [];
  });

  ngOnInit(): void {
    const model = new AlignmentHelperModel();
    model.template.set(this.alignmentHelperRef());

    this.entitiesService.alignmentHelper.set(model);
  }
}
