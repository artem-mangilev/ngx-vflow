import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, fromEvent, map } from 'rxjs';
import { VFLOW_NODE_COMPONENTS } from '../../features/with-entity-components';
import { VFLOW_MINIMAP_SETTINGS } from '../../features/with-minimap-settings';
import { createPointerDrag, PointerDragContext } from '../../gestures/pointer-drag';
import { wheelPanDelta } from '../../gestures/wheel';
import { Point } from '../../interfaces/point.interface';
import { Rect } from '../../interfaces/rect';
import { ViewportState } from '../../interfaces/viewport.interface';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { FlowRenderingService } from '../../services/flow-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { KeyboardService } from '../../services/keyboard.service';
import { ViewportService, ZOOM_STEP } from '../../services/viewport.service';
import { cssPalette } from '../../utils/css-palette';
import { getNodesFlowBounds } from '../../utils/nodes';
import { getBoundsOfRects, isPointInRect } from '../../utils/rect';
import { resizable } from '../../utils/resizable';
import { clamp, getViewportBounds } from '../../utils/viewport';
import { minimapNodeBatches } from './minimap-nodes';

/**
 * Zoom factor of one wheel event on the minimap: half a zoom-key step (`ZOOM_STEP` 1.2, so about 1.095 per event),
 * because a trackpad sends many wheel events per gesture where a key sends one.
 */
const MINIMAP_WHEEL_ZOOM = Math.sqrt(ZOOM_STEP);

/** Gap in CSS pixels between the content of the minimap and its edges. */
const PADDING = 5;

/** The smallest side, in CSS pixels, of the viewport as the minimap marks it, so a deep zoom into a large graph stays findable. */
const MIN_VIEWPORT_SIZE = 8;

const MASK = 'var(--v-minimap-mask)';
const VIEWPORT_OUTLINE = 'var(--v-minimap-viewport)';

/**
 * Draws the minimap and navigates with it. Everything drawn is derived:
 *
 * - `transform` maps flow space to the canvas, from the bounds of the nodes united with the viewport;
 * - `batches` are the nodes as paths in flow space, from their geometry and styles;
 * - `picture` is the batches painted in the transform, so it is painted again only when one of the two changes;
 * - a frame is the picture under the mask that leaves the viewport open.
 *
 * While the viewport stays within the nodes the transform does not change, so a frame of a camera move costs the
 * same whatever the size of the graph.
 */
@Directive({
  selector: 'canvas[minimapCanvas]',
  host: {
    '[style.pointer-events]': 'pannable() || zoomable() ? "auto" : "none"',
    '[style.touch-action]': 'pannable() || zoomable() ? "none" : "auto"',
    '[style.cursor]': 'pannable() ? "grab" : "auto"',
    '(click)': 'onClick($event)',
    '(auxclick)': 'onClick($event)',
    // Nothing pressed or clicked on the minimap reaches the flow around it.
    '(pointerdown)': '$event.stopPropagation()',
    '(mousedown)': '$event.stopPropagation()',
    '(touchstart)': '$event.stopPropagation()',
    '(dblclick)': '$event.stopPropagation()',
  },
})
export class MinimapCanvasDirective {
  public pannable = input.required<boolean>();
  public zoomable = input.required<boolean>();

  private view = inject(DOCUMENT).defaultView;
  private canvas = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
  private entities = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);
  private viewport = inject(ViewportService);
  private keyboard = inject(KeyboardService);
  private flowInitialized = inject(FlowRenderingService).flowInitialized;
  private minimapSettings = inject(VFLOW_MINIMAP_SETTINGS, { optional: true });

  /** The box the application's CSS gives the canvas. */
  private box = toSignal(resizable([this.canvas], inject(NgZone)).pipe(map(([entry]) => entry.contentRect)));
  private pixelRatio = toSignal(
    this.view ? fromEvent(this.view, 'resize').pipe(map(() => this.view?.devicePixelRatio || 1)) : EMPTY,
    { initialValue: this.view?.devicePixelRatio || 1 },
  );

  /** CSS pixels of the canvas, and its bitmap in device pixels. */
  private size = computed(
    () => {
      const [width, height] = [this.box()?.width ?? 0, this.box()?.height ?? 0];
      const ratio = this.pixelRatio();
      return { width, height, pixelWidth: Math.round(width * ratio), pixelHeight: Math.round(height * ratio) };
    },
    { equal: (a, b) => a.width === b.width && a.height === b.height && a.pixelWidth === b.pixelWidth },
  );

  /** The flow area the pane shows. */
  private visible = computed(() =>
    getViewportBounds(
      this.viewport.readableViewport(),
      this.settings.computedFlowWidth(),
      this.settings.computedFlowHeight(),
    ),
  );

  /**
   * Flow space to the CSS pixels of the canvas: the bounds of the nodes united with the viewport, so the viewport is
   * inside the minimap wherever the camera is.
   */
  private transform = computed(
    () => {
      const nodes = this.entities.nodes();
      const bounds = nodes.length ? getBoundsOfRects([getNodesFlowBounds(nodes), this.visible()]) : this.visible();
      return fit(bounds, this.size());
    },
    { equal: (a, b) => a.x === b.x && a.y === b.y && a.zoom === b.zoom },
  );

  private batches = computed(() =>
    minimapNodeBatches(this.entities.nodes(), this.minimapSettings?.().nodeStyles ?? {}),
  );

  /**
   * Every color the minimap paints with, as it is written: the tokens of the mask and the colors of node styles.
   * None while the canvas has no size, which is also while it is hidden: nothing is painted then.
   */
  private colors = computed(
    () => {
      if (!this.size().pixelWidth || !this.size().pixelHeight) return [];
      const styles = this.batches().flatMap(({ style }) => [style.background, style.borderColor]);
      return [...new Set([MASK, VIEWPORT_OUTLINE, ...styles])];
    },
    { equal: (a, b) => a.length === b.length && a.every((color, index) => color === b[index]) },
  );

  /** Those colors as the canvas takes them, resolved on the minimap element and following its theme. */
  private palette = cssPalette(this.canvas.parentElement ?? this.canvas, this.colors);

  private bitmap = inject(DOCUMENT).createElement('canvas');

  /** The nodes painted in the current transform; `null` where there is nothing to paint on. */
  private picture = computed(() => {
    const { width, height, pixelWidth, pixelHeight } = this.size();
    // An empty bitmap needs no context; jsdom reports every getContext call as not implemented.
    if (!pixelWidth || !pixelHeight) return null;
    this.bitmap.width = pixelWidth;
    this.bitmap.height = pixelHeight;
    const context = this.bitmap.getContext('2d');
    if (!context) return null;

    const { x, y, zoom } = this.transform();
    const palette = this.palette();
    const [scaleX, scaleY] = [pixelWidth / width, pixelHeight / height];
    context.setTransform(scaleX * zoom, 0, 0, scaleY * zoom, scaleX * x, scaleY * y);
    for (const { style, path } of this.batches()) {
      const fill = palette.get(style.background);
      if (isVisible(fill)) {
        context.fillStyle = fill;
        context.fill(path);
      }
      const stroke = style.borderWidth > 0 ? palette.get(style.borderColor) : undefined;
      if (isVisible(stroke)) {
        context.strokeStyle = stroke;
        // The width is in CSS pixels of the minimap: it does not shrink with the graph.
        context.lineWidth = style.borderWidth / zoom;
        context.stroke(path);
      }
    }
    // A new object each time: the bitmap is the same element, and the frame must see that it was painted again.
    return { image: this.bitmap };
  });

  /** Where the last event of a drag was, to move the viewport by what the pointer moved since. */
  private dragged: Point = { x: 0, y: 0 };

  constructor() {
    const drag = createPointerDrag(this.canvas, {
      filter: (event) => event.isPrimary && this.canPanWith(event),
      threshold: () => this.settings.paneClickDistance(),
      capture: true,
      onStart: (context) => {
        this.dragged = context.start;
        // A drag that starts outside the viewport brings the viewport under the pointer first.
        const pressed = this.canPan() && this.flowPoint(context.press);
        if (pressed && !isPointInRect(pressed, this.visible())) this.centerOn(pressed);
        this.panBy(context);
      },
      onMove: (context) => this.panBy(context),
    });
    inject(DestroyRef).onDestroy(() => drag.destroy());

    // The listener is not passive: an opted-in minimap keeps the wheel from scrolling the page.
    fromEvent<WheelEvent>(this.canvas, 'wheel', { passive: false })
      .pipe(takeUntilDestroyed())
      .subscribe((event) => this.onWheel(event));

    if (typeof ngDevMode === 'undefined' || ngDevMode) this.warnAboutUnknownComponents();

    afterRenderEffect(() => {
      const { width, height, pixelWidth, pixelHeight } = this.size();
      if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
      if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
      // Until the first layout the nodes have placeholder sizes and the minimap is hidden.
      if (!pixelWidth || !pixelHeight || !this.flowInitialized()) return;
      const context = this.canvas.getContext('2d');
      if (!context) return;

      context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      context.clearRect(0, 0, width, height);
      const picture = this.picture();
      if (picture) context.drawImage(picture.image, 0, 0, width, height);

      // The mask covers everything but the viewport, above the nodes: the part of the graph out of view is dimmed.
      const { x, y, zoom } = this.transform();
      const visible = this.visible();
      const marked = atLeast(
        {
          x: x + visible.x * zoom,
          y: y + visible.y * zoom,
          width: visible.width * zoom,
          height: visible.height * zoom,
        },
        MIN_VIEWPORT_SIZE,
      );
      context.beginPath();
      context.rect(0, 0, width, height);
      context.rect(marked.x, marked.y, marked.width, marked.height);
      const palette = this.palette();
      context.fillStyle = palette.get(MASK) ?? 'transparent';
      context.fill('evenodd');
      const outline = palette.get(VIEWPORT_OUTLINE);
      if (isVisible(outline)) {
        context.strokeStyle = outline;
        context.lineWidth = 1;
        context.strokeRect(marked.x + 0.5, marked.y + 0.5, marked.width - 1, marked.height - 1);
      }
    });
  }

  /** A click centers the viewport on the clicked point. A drag swallows the click that follows it. */
  protected onClick(event: MouseEvent) {
    event.stopPropagation();
    const point = this.canPanWith(event) && this.flowPoint(event);
    if (point) this.centerOn(point);
  }

  /** Whether the gesture settings of the flow let the minimap pan now. */
  private canPan() {
    return (
      this.pannable() &&
      !this.keyboard.isActiveModifier('selection') &&
      (this.settings.panOnDrag() !== false || this.keyboard.isActiveModifier('panActivation'))
    );
  }

  /** {@link canPan} with this button: an array of mouse buttons in `panOnDrag` never restricts a finger. */
  private canPanWith(event: MouseEvent) {
    const buttons = this.settings.panOnDrag();
    // A click is a pointer event in current browsers, so it knows a finger too.
    const touch = (event as PointerEvent).pointerType === 'touch';
    return this.canPan() && (touch || !Array.isArray(buttons) || buttons.includes(event.button));
  }

  /**
   * Moves the viewport by what the pointer moved since the last event, at the scale the minimap has now. The scale
   * changes while the viewport reaches beyond the nodes, so a point of the canvas has no fixed flow point to follow.
   */
  private panBy({ point }: PointerDragContext) {
    const rect = this.canvas.getBoundingClientRect();
    const last = this.dragged;
    this.dragged = point;
    // The settings and the modifier keys may change during a drag.
    if (!rect.width || !this.canPan()) return;
    const viewport = this.viewport.readableViewport();
    const scale = (this.size().width / rect.width / this.transform().zoom) * viewport.zoom;
    this.viewport.change({
      x: viewport.x - (point.x - last.x) * scale,
      y: viewport.y - (point.y - last.y) * scale,
      zoom: viewport.zoom,
    });
  }

  private onWheel(event: WheelEvent) {
    event.stopPropagation();
    // An opted-in minimap owns wheel input even at a zoom limit or with a gesture disabled.
    if (!this.pannable() && !this.zoomable()) return;
    event.preventDefault();
    const viewport = this.viewport.readableViewport();
    const scrollPan =
      !event.ctrlKey &&
      (this.settings.panOnScroll() || this.keyboard.isActiveModifier('panActivation')) &&
      !this.keyboard.isActiveModifier('zoomActivation');
    if (scrollPan) {
      if (!this.pannable() || this.keyboard.isActiveModifier('selection')) return;
      const delta = wheelPanDelta(event, this.size().height);
      const scale = viewport.zoom / this.transform().zoom;
      this.viewport.change({ ...viewport, x: viewport.x + delta.x * scale, y: viewport.y + delta.y * scale });
      return;
    }
    const allowed = event.ctrlKey
      ? this.settings.zoomOnPinch()
      : this.settings.zoomOnScroll() || this.keyboard.isActiveModifier('zoomActivation');
    if (!this.zoomable() || !allowed) return;
    const zoom = clamp(
      viewport.zoom * MINIMAP_WHEEL_ZOOM ** -Math.sign(event.deltaY),
      this.settings.minZoom(),
      this.settings.maxZoom(),
    );
    // Around the middle of the pane.
    this.centerOn(
      {
        x: (this.settings.computedFlowWidth() / 2 - viewport.x) / viewport.zoom,
        y: (this.settings.computedFlowHeight() / 2 - viewport.y) / viewport.zoom,
      },
      zoom,
    );
  }

  /** The flow point the minimap shows under the pointer. */
  private flowPoint(event: MouseEvent): Point | undefined {
    const rect = this.canvas.getBoundingClientRect();
    const { width, height } = this.size();
    if (!rect.width || !rect.height || !width || !height) return;
    const { x, y, zoom } = this.transform();
    return {
      x: (((event.clientX - rect.left) * width) / rect.width - x) / zoom,
      y: (((event.clientY - rect.top) * height) / rect.height - y) / zoom,
    };
  }

  private centerOn(point: Point, zoom = this.viewport.readableViewport().zoom) {
    this.viewport.change({
      x: this.settings.computedFlowWidth() / 2 - point.x * zoom,
      y: this.settings.computedFlowHeight() / 2 - point.y * zoom,
      zoom,
    });
  }

  private warnAboutUnknownComponents() {
    const components = inject(VFLOW_NODE_COMPONENTS, { optional: true });
    const warned = new Set<string>();
    effect(() => {
      const registered = components?.() ?? {};
      for (const key of Object.keys(this.minimapSettings?.().nodeStyles ?? {})) {
        if (key in registered || warned.has(key)) continue;
        warned.add(key);
        console.warn(
          `[ngx-vflow] withMinimapSettings() styles the nodes of "${key}", but no node component is registered under that key with withNodeComponents().`,
        );
      }
    });
  }
}

/** A resolved color that paints something; a color the palette has not resolved yet does not. */
function isVisible(color: string | undefined): color is string {
  return !!color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)';
}

/** The transform that centers `bounds` in a box, inside its padding. Bounds without a size keep 1:1. */
function fit(bounds: Rect, { width, height }: { width: number; height: number }): ViewportState {
  const fitted = Math.min(
    bounds.width > 0 ? Math.max(1, width - PADDING * 2) / bounds.width : Infinity,
    bounds.height > 0 ? Math.max(1, height - PADDING * 2) / bounds.height : Infinity,
  );
  const zoom = Number.isFinite(fitted) ? fitted : 1;
  return {
    x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
    y: height / 2 - (bounds.y + bounds.height / 2) * zoom,
    zoom,
  };
}

/** `rect` grown around its center until no side is shorter than `size`. */
function atLeast(rect: Rect, size: number): Rect {
  const width = Math.max(rect.width, size);
  const height = Math.max(rect.height, size);
  return { x: rect.x - (width - rect.width) / 2, y: rect.y - (height - rect.height) / 2, width, height };
}
