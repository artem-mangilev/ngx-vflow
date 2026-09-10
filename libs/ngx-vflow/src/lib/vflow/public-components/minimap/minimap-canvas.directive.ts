import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterRenderEffect, computed, inject, input, signal } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ViewportService } from '../../services/viewport.service';
import { getNodesFlowBounds } from '../../utils/nodes';
import { clamp, getViewportBounds, getViewportForBounds } from '../../utils/viewport';
import { MiniMapPosition } from './minimap.component';
import { KeyboardService } from '../../services/keyboard.service';
import { Point } from '../../interfaces/point.interface';
import { clientToFlowPosition } from '../../utils/coordinates';
import { isPointInRect } from '../../utils/rect';
import { minimapTheme } from './minimap-theme';

@Directive({
  selector: 'canvas[minimapCanvas]',
  host: {
    '[style.pointer-events]': 'pannable() || zoomable() ? "auto" : "none"',
    '[style.touch-action]': 'pannable() || zoomable() ? "none" : "auto"',
    '[style.cursor]': 'pannable() ? "grab" : "auto"',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'cancelDrag($event)',
    '(lostpointercapture)': 'cancelDrag($event)',
    '(mousedown)': '$event.stopPropagation()',
    '(touchstart)': '$event.stopPropagation()',
    '(click)': '$event.stopPropagation()',
    '(dblclick)': '$event.stopPropagation()',
  },
})
export class MinimapCanvasDirective {
  public themeRevision = input(0);
  public position = input.required<MiniMapPosition>();
  public pannable = input.required<boolean>();
  public zoomable = input.required<boolean>();
  public zoomStep = input.required<number>();

  private document = inject(DOCUMENT);
  private canvas = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  private entities = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);
  private readonly theme = minimapTheme(this.themeRevision);
  private viewport = inject(ViewportService);
  private keyboard = inject(KeyboardService);
  private drag?: { id: number; start: Point; offset: Point; moved: boolean };
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
        context.fillStyle = this.theme().surface;
        context.globalAlpha = group ? 0.05 : 1;
        context.fill();
        context.globalAlpha = 1;
        context.strokeStyle = selected ? this.theme().selection : this.theme().foreground;
        context.lineWidth = group && !selected ? 1.5 : 2;
        context.stroke();
      }
    }
    return { image, transform };
  });

  constructor() {
    const view = this.document.defaultView;
    const updateRatio = () => this.pixelRatio.set(view?.devicePixelRatio || 1);
    const cancelDrag = () => this.cancelDrag();
    const wheel = (event: WheelEvent) => this.onWheel(event);
    view?.addEventListener('resize', updateRatio);
    view?.addEventListener('blur', cancelDrag);
    this.canvas.addEventListener('wheel', wheel, { passive: false });
    inject(DestroyRef).onDestroy(() => {
      this.cancelDrag();
      view?.removeEventListener('resize', updateRatio);
      view?.removeEventListener('blur', cancelDrag);
      this.canvas.removeEventListener('wheel', wheel);
    });

    afterRenderEffect(() => {
      if (!this.pannable()) this.cancelDrag();
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
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = this.theme().muted;
      context.fillRect(0, 0, width, height);
      context.fillStyle = this.theme().background;
      context.fillRect(
        transform.x + viewport.x * transform.zoom,
        transform.y + viewport.y * transform.zoom,
        viewport.width * transform.zoom,
        viewport.height * transform.zoom,
      );
      if (image.width && image.height) context.drawImage(image, 0, 0, width, height);
      context.strokeStyle = this.theme().border;
      context.lineWidth = 1;
      context.strokeRect(0.5, 0.5, width - 1, height - 1);
    });
  }

  private flowPoint(event: PointerEvent): Point | undefined {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || this.width() <= 0 || this.height() <= 0) return;
    return clientToFlowPosition(
      {
        x: ((event.clientX - rect.left) * this.width()) / rect.width,
        y: ((event.clientY - rect.top) * this.height()) / rect.height,
      },
      { viewport: this.graph().transform, containerPosition: { x: 0, y: 0 } },
    );
  }

  private canPan(event: PointerEvent) {
    const buttons = this.settings.panOnDrag();
    return (
      this.pannable() &&
      !this.keyboard.isActiveAction('selection') &&
      (buttons !== false || this.keyboard.isActiveAction('pan')) &&
      (event.pointerType === 'touch' || !Array.isArray(buttons) || buttons.includes(event.button))
    );
  }

  protected onPointerDown(event: PointerEvent) {
    event.stopPropagation();
    if (this.drag || !event.isPrimary || !this.canPan(event)) return;
    const point = this.flowPoint(event);
    if (!point) return;
    event.preventDefault();
    const bounds = getViewportBounds(
      this.viewport.readableViewport(),
      this.settings.computedFlowWidth(),
      this.settings.computedFlowHeight(),
    );
    const inside = isPointInRect(point, bounds);
    this.drag = {
      id: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      offset: inside
        ? { x: bounds.x + bounds.width / 2 - point.x, y: bounds.y + bounds.height / 2 - point.y }
        : { x: 0, y: 0 },
      moved: false,
    };
    this.canvas.setPointerCapture(event.pointerId);
    if (!inside) this.centerOn(point);
  }

  protected onPointerMove(event: PointerEvent) {
    event.stopPropagation();
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    // Mouse move events have button=-1; the accepted button is checked on pointerdown.
    if (
      !this.pannable() ||
      this.keyboard.isActiveAction('selection') ||
      (this.settings.panOnDrag() === false && !this.keyboard.isActiveAction('pan'))
    ) {
      this.cancelDrag();
      return;
    }
    const point = this.flowPoint(event);
    if (!point) return;
    event.preventDefault();
    drag.moved ||=
      Math.hypot(event.clientX - drag.start.x, event.clientY - drag.start.y) > this.settings.paneClickDistance();
    if (drag.moved) this.centerOn({ x: point.x + drag.offset.x, y: point.y + drag.offset.y });
  }

  protected onPointerUp(event: PointerEvent) {
    this.onPointerMove(event);
    if (this.drag?.id !== event.pointerId) return;
    const point = this.flowPoint(event);
    if (!this.drag.moved && point) this.centerOn(point);
    this.cancelDrag();
  }

  protected cancelDrag(event?: PointerEvent) {
    const drag = this.drag;
    if (event && drag?.id !== event.pointerId) return;
    this.drag = undefined;
    if (drag && this.canvas.hasPointerCapture(drag.id)) this.canvas.releasePointerCapture(drag.id);
  }

  private centerOn(point: Point, zoom = this.viewport.readableViewport().zoom) {
    this.viewport.writableViewport.set({
      changeType: 'absolute',
      state: {
        x: this.settings.computedFlowWidth() / 2 - point.x * zoom,
        y: this.settings.computedFlowHeight() / 2 - point.y * zoom,
        zoom,
      },
      duration: 0,
    });
  }

  private onWheel(event: WheelEvent) {
    event.stopPropagation();
    // An opted-in minimap owns wheel input even at a zoom limit or with a gesture disabled.
    if (!this.pannable() && !this.zoomable()) return;
    event.preventDefault();
    if (this.drag) return;
    const viewport = this.viewport.readableViewport();
    const scrollPan =
      !event.ctrlKey &&
      (this.settings.panOnScroll() || this.keyboard.isActiveAction('pan')) &&
      !this.keyboard.isActiveAction('zoom');
    if (scrollPan) {
      if (!this.pannable() || this.keyboard.isActiveAction('selection')) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.height() : 1;
      const scale = (unit * viewport.zoom) / this.graph().transform.zoom;
      this.viewport.writableViewport.set({
        changeType: 'absolute',
        state: { ...viewport, x: viewport.x - event.deltaX * scale, y: viewport.y - event.deltaY * scale },
        duration: 0,
      });
      return;
    }
    if (
      !this.zoomable() ||
      !(event.ctrlKey
        ? this.settings.zoomOnPinch()
        : this.settings.zoomOnScroll() || this.keyboard.isActiveAction('zoom'))
    )
      return;
    const step = this.zoomStep();
    const factor = 1 + (Number.isFinite(step) && step > 0 ? step : 0.1);
    const zoom = clamp(
      viewport.zoom * factor ** -Math.sign(event.deltaY),
      this.settings.minZoom(),
      this.settings.maxZoom(),
    );
    this.centerOn(
      {
        x: (this.settings.computedFlowWidth() / 2 - viewport.x) / viewport.zoom,
        y: (this.settings.computedFlowHeight() / 2 - viewport.y) / viewport.zoom,
      },
      zoom,
    );
  }
}
