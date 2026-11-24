import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map } from 'rxjs';
import { bindEntityAccessibility } from '../../directives/entity-accessibility.directive';
import { VFLOW_MINIMAP_SETTINGS } from '../../features/with-minimap';
import { createPointerDrag, PointerDragContext } from '../../gestures/pointer-drag';
import { WHEEL_IDLE_MS, wheelPanDelta } from '../../gestures/wheel';
import { Point } from '../../interfaces/point.interface';
import { Rect } from '../../interfaces/rect';
import { ViewportState } from '../../interfaces/viewport.interface';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { FlowRenderingService } from '../../services/flow-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { KeyboardService } from '../../services/keyboard.service';
import { ViewportService, ZOOM_STEP } from '../../services/viewport.service';
import { getNodesFlowBounds } from '../../utils/nodes';
import { getBoundsOfRects, isPointInRect } from '../../utils/rect';
import { resizable } from '../../utils/resizable';
import { clamp, getViewportBounds } from '../../utils/viewport';
import { minimapNodeBatches, minimapNodeStyle } from './minimap-nodes';

/**
 * Zoom factor of one wheel event on the minimap: half a zoom-key step (`ZOOM_STEP` 1.2, so about 1.095 per event),
 * because a trackpad sends many wheel events per gesture where a key sends one.
 */
const MINIMAP_WHEEL_ZOOM = Math.sqrt(ZOOM_STEP);

/** Gap in CSS pixels between the content of the minimap and its edges. */
const PADDING = 5;

/**
 * An overview of the whole graph with the part in view marked, drawn with SVG. The element is the block: size it,
 * give it a border, a radius or a shadow with CSS, and place it with `vPanel` or with your own styles.
 *
 * ```html
 * <vflow [nodes]="nodes">
 *   <v-minimap vPanel="bottom-right" [pannable]="true" />
 * </vflow>
 * ```
 *
 * Nodes are filled with `--v-minimap-node`. `withMinimap()` changes how the nodes of a component are drawn.
 *
 * The nodes are one path per style in flow space, and the transform maps them to the minimap: the bounds of the nodes
 * united with the viewport. While the viewport stays within the nodes the transform does not change, and only the
 * mask moves, so a frame of a camera move costs the same whatever the size of the graph.
 */
@Component({
  selector: 'v-minimap',
  templateUrl: './minimap.component.html',
  styles: [
    `
      /* Without specificity: any selector of the application wins, an element selector included. */
      :where(:host) {
        display: block;
        /* A frame the application adds stays inside the size it sets. */
        box-sizing: border-box;
        width: clamp(120px, 20%, 240px);
        aspect-ratio: 4 / 3;
        background: var(--v-background);
        /* Clips the content to a border radius set by the application. */
        overflow: hidden;
      }

      /* The box of the mask, and its clip, without a position that would compete with vPanel. */
      :host {
        contain: paint;
      }

      svg {
        display: block;
        width: 100%;
        height: 100%;
        /* A layer of its own: a camera move repaints the mask above it, not every node. */
        will-change: transform;
      }

      path {
        vector-effect: non-scaling-stroke;
        stroke-width: 1px;
      }

      .v-minimap-viewport {
        position: absolute;
        /* Dims everything around the viewport; the host clips the spread. */
        box-shadow: 0 0 0 9999px var(--v-minimap-mask);
        outline: 1px solid var(--v-minimap-viewport);
        outline-offset: -1px;
        /* Placed by its center and grown around it, so a deep zoom into a large graph stays findable. */
        min-width: 8px;
        min-height: 8px;
        translate: -50% -50%;
        /* The pointer is on the drawing under it. */
        pointer-events: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'v-minimap',
    // Hidden with the other viewport layers until the first layout is complete.
    '[attr.data-v-pending]': "flowInitialized() ? null : ''",
    // A read-only minimap lets the pointer through to the pane, whatever the layer it is in says.
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
export class VflowMinimapComponent {
  /** Enable click, drag and scroll panning, subject to the main flow gesture settings. */
  public pannable = input(false);

  /** Enable wheel and trackpad pinch zoom, subject to the main flow gesture settings. */
  public zoomable = input(false);

  protected flowInitialized = inject(FlowRenderingService).flowInitialized;

  private view = inject(DOCUMENT).defaultView;
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private entities = inject(FlowEntitiesService);
  private settings = inject(FlowSettingsService);
  private viewport = inject(ViewportService);
  private keyboard = inject(KeyboardService);
  private minimapSettings = inject(VFLOW_MINIMAP_SETTINGS, { optional: true });

  /** The content box the application's CSS gives the minimap. */
  private size = toSignal(
    resizable([this.host], inject(NgZone)).pipe(
      map(([{ contentRect }]) => ({ width: contentRect.width, height: contentRect.height })),
    ),
    { initialValue: { width: 0, height: 0 } },
  );

  /** The flow area the pane shows. */
  private visible = computed(() =>
    getViewportBounds(
      this.viewport.readableViewport(),
      this.settings.computedFlowWidth(),
      this.settings.computedFlowHeight(),
    ),
  );

  /** Apart from the viewport, so a camera move does not measure every node again. */
  private nodesBounds = computed(() => {
    const nodes = this.entities.nodes();
    return nodes.length ? getNodesFlowBounds(nodes) : null;
  });

  /**
   * Flow space to the CSS pixels of the minimap: the bounds of the nodes united with the viewport, so the viewport is
   * inside the minimap wherever the camera is.
   */
  private transform = computed(() => {
    const nodes = this.nodesBounds();
    const bounds = nodes ? getBoundsOfRects([nodes, this.visible()]) : this.visible();
    return fit(bounds, this.size());
  });

  protected matrix = computed(() => {
    const { x, y, zoom } = this.transform();
    return `matrix(${zoom} 0 0 ${zoom} ${x} ${y})`;
  });

  /** Every node with its style, apart from geometry: a moving node calls no style rule. */
  private styled = computed(() => {
    const rules = this.minimapSettings?.().nodeStyles ?? {};
    return this.entities.nodes().map((node) => ({ node, style: minimapNodeStyle(node, rules) }));
  });

  /** The nodes as paths, one per style and depth. Colors stay as written: the browser resolves them. */
  protected batches = computed(() => minimapNodeBatches(this.styled(), this.radius()));

  /** The viewport as the minimap marks it, by its center, in CSS pixels of the minimap. */
  protected marked = computed(() => {
    const { x, y, zoom } = this.transform();
    const { x: left, y: top, width, height } = this.visible();
    return {
      x: x + (left + width / 2) * zoom,
      y: y + (top + height / 2) * zoom,
      width: width * zoom,
      height: height * zoom,
    };
  });

  /** Where the last event of a drag was, to move the viewport by what the pointer moved since. */
  private dragged: Point = { x: 0, y: 0 };

  /** Ends the wheel gesture once the wheel events stop, as on the pane. */
  private wheelTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    bindEntityAccessibility(() => ({ role: 'img', label: this.settings.ariaLabels().minimapLabel }));

    const drag = createPointerDrag(this.host, {
      filter: (event) => event.isPrimary && this.canPanWith(event),
      threshold: () => this.settings.paneClickDistance(),
      capture: true,
      onStart: (context) => {
        // The whole drag is one viewport gesture: the flow reports its end once, on the release.
        this.viewport.beginGesture();
        this.dragged = context.start;
        // A drag that starts outside the viewport brings the viewport under the pointer first.
        const pressed = this.canPan() && this.flowPoint(context.press);
        if (pressed && !isPointInRect(pressed, this.visible())) this.centerOn(pressed);
        this.panBy(context);
      },
      onMove: (context) => this.panBy(context),
      onEnd: () => this.viewport.endGesture(),
      onCancel: () => this.viewport.endGesture(),
    });
    inject(DestroyRef).onDestroy(() => {
      drag.destroy();
      if (this.wheelTimer !== null) {
        clearTimeout(this.wheelTimer);
        this.viewport.endGesture();
      }
    });

    // The listener is not passive: an opted-in minimap keeps the wheel from scrolling the page.
    fromEvent<WheelEvent>(this.host, 'wheel', { passive: false })
      .pipe(takeUntilDestroyed())
      .subscribe((event) => this.onWheel(event));
  }

  /**
   * The radius token in flow pixels; registered as a length, so it computes to pixels. Read once the minimap is laid out.
   * shortcut: read when the paths are built, so a change of the token alone shows with the next change of the graph;
   * watch it if themes come to change radii at runtime.
   */
  private radius() {
    if (!this.flowInitialized() || !this.view) return 0;
    return parseFloat(this.view.getComputedStyle(this.host).getPropertyValue('--v-minimap-node-radius')) || 0;
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
   * changes while the viewport reaches beyond the nodes, so a point of the minimap has no fixed flow point to follow.
   */
  private panBy({ point }: PointerDragContext) {
    const rect = this.contentRect();
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
      this.continueWheel();
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
    const visible = this.visible();
    this.continueWheel();
    this.centerOn({ x: visible.x + visible.width / 2, y: visible.y + visible.height / 2 }, zoom);
  }

  /** A series of wheel events is one viewport gesture, which ends once the events stop. */
  private continueWheel() {
    if (this.wheelTimer === null) this.viewport.beginGesture();
    else clearTimeout(this.wheelTimer);
    this.wheelTimer = setTimeout(() => {
      this.wheelTimer = null;
      this.viewport.endGesture();
    }, WHEEL_IDLE_MS);
  }

  /** The flow point the minimap shows under the pointer. */
  private flowPoint(event: MouseEvent): Point | undefined {
    const rect = this.contentRect();
    const { width, height } = this.size();
    if (!rect.width || !rect.height || !width || !height) return;
    const { x, y, zoom } = this.transform();
    return {
      x: (((event.clientX - rect.left) * width) / rect.width - x) / zoom,
      y: (((event.clientY - rect.top) * height) / rect.height - y) / zoom,
    };
  }

  /** The box the nodes are drawn in, on the screen: the drawing fills the content box of the minimap. */
  private contentRect(): DOMRect {
    return this.host.querySelector('svg')!.getBoundingClientRect();
  }

  private centerOn(point: Point, zoom = this.viewport.readableViewport().zoom) {
    this.viewport.change({
      x: this.settings.computedFlowWidth() / 2 - point.x * zoom,
      y: this.settings.computedFlowHeight() / 2 - point.y * zoom,
      zoom,
    });
  }
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
