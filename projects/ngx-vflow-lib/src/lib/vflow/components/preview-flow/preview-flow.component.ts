import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { ViewportService } from '../../services/viewport.service';
import { PreviewFlowRenderStrategyService } from '../../services/preview-flow-render-strategy.service';
import { drawNode } from './draw-node';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { isRectInViewport } from '../../utils/viewport';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'canvas[previewFlow]',
  template: '',
})
export class PreviewFlowComponent {
  private entitiesService = inject(FlowEntitiesService);
  private viewportService = inject(ViewportService);
  private flowSettingsService = inject(FlowSettingsService);
  private renderStrategy = inject(PreviewFlowRenderStrategyService);

  private element = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  private ctx = this.element.getContext('2d')!;

  readonly width = input<number>(0);
  readonly height = input<number>(0);

  private readonly dpr = window.devicePixelRatio;

  private viewportNodes = computed(() => {
    const nodes = this.entitiesService.nodes();
    const viewport = this.viewportService.readableViewport();
    const flowWidth = this.flowSettingsService.computedFlowWidth();
    const flowHeight = this.flowSettingsService.computedFlowHeight();

    return nodes.filter((n) => {
      const { x, y } = n.globalPoint();
      const width = n.width();
      const height = n.height();

      return isRectInViewport({ x, y, width, height }, viewport, flowWidth, flowHeight);
    });
  });

  constructor() {
    effect(() => {
      // Set the "actual" size of the canvas
      this.element.width = this.width() * this.dpr;
      this.element.height = this.height() * this.dpr;

      // Set the "drawn" size of the canvas
      this.element.style.width = `${this.width()}px`;
      this.element.style.height = `${this.height()}px`;

      // Scale the context to match device pixel ratio
      this.ctx.scale(this.dpr, this.dpr);
    });

    effect(() => {
      const viewport = this.viewportService.readableViewport();

      this.ctx.clearRect(0, 0, this.width(), this.height());

      // Save the current context state
      this.ctx.save();

      // Apply viewport transformations (zoom and pan)
      this.ctx.setTransform(
        viewport.zoom * this.dpr, // horizontal scaling with DPR
        0, // horizontal skewing
        0, // vertical skewing
        viewport.zoom * this.dpr, // vertical scaling with DPR
        viewport.x * this.dpr, // horizontal translation with DPR
        viewport.y * this.dpr, // vertical translation with DPR
      );

      for (let i = 0; i < this.viewportNodes().length; i++) {
        const node = this.viewportNodes()[i];

        if (this.renderStrategy.shouldRenderNode(node)) {
          drawNode(this.ctx, node);
        }
      }

      // Restore the context state
      this.ctx.restore();
    });
  }
}
