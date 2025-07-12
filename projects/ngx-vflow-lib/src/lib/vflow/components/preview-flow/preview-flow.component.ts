import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { ViewportService } from '../../services/viewport.service';
import { NodeModel } from '../../models/node.model';
import { PreviewFlowRenderStrategyService } from '../../services/preview-flow-render-strategy.service';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'canvas[previewFlow]',
  template: '',
  host: {
    '[width]': 'width()',
    '[height]': 'height()',
  },
})
export class PreviewFlowComponent {
  private entitiesService = inject(FlowEntitiesService);
  private viewportService = inject(ViewportService);
  private renderStrategy = inject(PreviewFlowRenderStrategyService);

  private ctx = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement.getContext('2d')!;

  readonly width = input<number>(0);
  readonly height = input<number>(0);

  constructor() {
    effect(() => {
      const nodes = this.entitiesService.nodes();
      const viewport = this.viewportService.readableViewport();

      this.ctx.clearRect(0, 0, this.width(), this.height());

      // Save the current context state
      this.ctx.save();

      // Apply viewport transformations (zoom and pan)
      this.ctx.setTransform(
        viewport.zoom, // horizontal scaling
        0, // horizontal skewing
        0, // vertical skewing
        viewport.zoom, // vertical scaling
        viewport.x, // horizontal translation
        viewport.y, // vertical translation
      );

      nodes.forEach((node) => {
        if (this.renderStrategy.shouldRenderNode(node)) {
          this.drawNode(node);
        }
      });

      // Restore the context state
      this.ctx.restore();
    });
  }

  private drawNode(node: NodeModel) {
    const point = node.globalPoint();
    const width = node.width();
    const height = node.height();

    this.ctx.fillStyle = 'rgb(0 0 0 / 10%)';
    this.ctx.fillRect(point.x, point.y, width, height);
  }
}
