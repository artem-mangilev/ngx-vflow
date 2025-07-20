import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { ViewportService } from '../../services/viewport.service';
import { PreviewFlowRenderStrategyService } from '../../services/preview-flow-render-strategy.service';
import { drawNode } from './draw-node';
import { NodeRenderingService } from '../../services/node-rendering.service';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'canvas[previewFlow]',
  template: '',
})
export class PreviewFlowComponent {
  private viewportService = inject(ViewportService);
  private renderStrategy = inject(PreviewFlowRenderStrategyService);
  private nodeRenderingService = inject(NodeRenderingService);
  private renderer2 = inject(Renderer2);

  private element = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  private ctx = this.element.getContext('2d')!;

  readonly width = input<number>(0);
  readonly height = input<number>(0);

  private readonly dpr = window.devicePixelRatio;

  constructor() {
    effect(() => {
      // Set the "actual" size of the canvas
      this.renderer2.setProperty(this.element, 'width', this.width() * this.dpr);
      this.renderer2.setProperty(this.element, 'height', this.height() * this.dpr);

      // Set the "drawn" size of the canvas
      this.renderer2.setStyle(this.element, 'width', `${this.width()}px`);
      this.renderer2.setStyle(this.element, 'height', `${this.height()}px`);

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

      for (let i = 0; i < this.nodeRenderingService.viewportNodes().length; i++) {
        const node = this.nodeRenderingService.viewportNodes()[i];

        if (this.renderStrategy.shouldRenderNode(node)) {
          drawNode(this.ctx, node);
        }
      }

      // Restore the context state
      this.ctx.restore();
    });
  }
}
