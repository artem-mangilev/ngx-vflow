import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterRenderEffect, computed, inject, input, signal } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ViewportService } from '../../services/viewport.service';
import { getNodesFlowBounds } from '../../utils/nodes';
import { getViewportBounds, getViewportForBounds } from '../../utils/viewport';
import { MiniMapPosition } from './minimap.component';

@Directive({ selector: 'canvas[minimapCanvas]' })
export class MinimapCanvasDirective {
  public maskColor = input.required<string>();
  public strokeColor = input.required<string>();
  public position = input.required<MiniMapPosition>();

  private document = inject(DOCUMENT);
  private canvas = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  private entities = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);
  private viewport = inject(ViewportService);
  private pixelRatio = signal(this.document.defaultView?.devicePixelRatio || 1);
  private previews = this.document.createElement('canvas');
  private width = computed(() => this.settings.computedFlowWidth() * 0.2);
  private height = computed(() => this.settings.computedFlowHeight() * 0.2);

  // The graph bitmap depends on geometry and selection, never on the camera.
  private graph = computed(() => {
    const width = this.width();
    const height = this.height();
    const nodes = this.entities.nodes();
    const ratio = this.pixelRatio();
    const image = this.previews;
    image.width = Math.max(0, Math.round(width * ratio));
    image.height = Math.max(0, Math.round(height * ratio));
    const context = image.getContext('2d');
    const transform =
      nodes.length && width > 0 && height > 0
        ? getViewportForBounds(getNodesFlowBounds(nodes), width, height, Number.MIN_VALUE, 0.3, 0)
        : { x: 0, y: 0, zoom: 0.2 };
    if (context && width > 0 && height > 0) {
      context.setTransform(
        ratio * transform.zoom,
        0,
        0,
        ratio * transform.zoom,
        ratio * transform.x,
        ratio * transform.y,
      );
      // ponytail: redraw all previews on graph edits; use dirty regions if edits become the bottleneck.
      for (const node of nodes) {
        const group = node.rawNode.type === 'default-group' || node.rawNode.type === 'template-group';
        if (!group && node.rawNode.type !== 'default' && node.rawNode.type !== 'html-template' && !node.isComponentType)
          continue;
        const { x, y } = node.globalPoint();
        const selected = node.selected();
        context.beginPath();
        context.roundRect(x, y, node.width(), node.height(), group ? 5 : 2);
        context.fillStyle = group ? node.color() : '#fff';
        context.globalAlpha = group ? 0.05 : 1;
        context.fill();
        context.globalAlpha = 1;
        context.strokeStyle = group ? node.color() : selected ? '#0f4c75' : '#1b262c';
        context.lineWidth = group && !selected ? 1.5 : 2;
        context.stroke();
      }
    }
    return { image, transform };
  });

  constructor() {
    const view = this.document.defaultView;
    const updateRatio = () => this.pixelRatio.set(view?.devicePixelRatio || 1);
    view?.addEventListener('resize', updateRatio);
    inject(DestroyRef).onDestroy(() => view?.removeEventListener('resize', updateRatio));

    afterRenderEffect(() => {
      const width = this.width();
      const height = this.height();
      const ratio = this.pixelRatio();
      const position = this.position();
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      this.canvas.style.left = (position.endsWith('left') ? 10 : this.settings.computedFlowWidth() - width - 10) + 'px';
      this.canvas.style.top =
        (position.startsWith('top') ? 10 : this.settings.computedFlowHeight() - height - 10) + 'px';
      const pixelWidth = Math.max(0, Math.round(width * ratio));
      const pixelHeight = Math.max(0, Math.round(height * ratio));
      if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
      if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
      const context = this.canvas.getContext('2d');
      if (!context || width <= 0 || height <= 0) return;
      const { image, transform } = this.graph();
      const viewport = getViewportBounds(
        this.viewport.readableViewport(),
        this.settings.computedFlowWidth(),
        this.settings.computedFlowHeight(),
      );
      const background = this.settings.background();
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = this.maskColor();
      context.fillRect(0, 0, width, height);
      context.fillStyle =
        background.type === 'solid' || background.type === 'dots' ? (background.color ?? '#fff') : '#fff';
      context.fillRect(
        transform.x + viewport.x * transform.zoom,
        transform.y + viewport.y * transform.zoom,
        viewport.width * transform.zoom,
        viewport.height * transform.zoom,
      );
      if (image.width && image.height) context.drawImage(image, 0, 0, width, height);
      context.strokeStyle = this.strokeColor();
      context.lineWidth = 1;
      context.strokeRect(0.5, 0.5, width - 1, height - 1);
    });
  }
}
