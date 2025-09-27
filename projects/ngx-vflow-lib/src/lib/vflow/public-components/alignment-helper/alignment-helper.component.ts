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
        [
          [d.left, o.left],
          [d.left, o.right],
          [d.right, o.left],
          [d.right, o.right],
        ].forEach(([dX, oX]) => {
          if (Math.abs(dX - oX) <= 10) {
            lines.push({ x: oX, y: -10000, x2: oX, y2: 10000 });
          }
        });

        [
          [d.top, o.top],
          [d.top, o.bottom],
          [d.bottom, o.top],
          [d.bottom, o.bottom],
        ].forEach(([dY, oY]) => {
          if (Math.abs(dY - oY) <= 10) {
            lines.push({ x: -10000, y: oY, x2: 10000, y2: oY });
          }
        });
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
