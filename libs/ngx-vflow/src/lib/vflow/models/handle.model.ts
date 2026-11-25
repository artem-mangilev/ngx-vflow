import { Signal, computed, signal } from '@angular/core';
import { NodeModel } from './node.model';
import { Point } from '../interfaces/point.interface';
import { Position } from '../types/position.type';
import { HandleLayout, HandlePosition, HandleState, HandleType } from '../types/handle-type.type';
import { NodeEndpoint, getNodeEndpoint } from '../math/node-endpoint';

export type { HandleState } from '../types/handle-type.type';

export type HandleLayoutStyles = {
  top: string;
  left: string;
};

export type HandleGeometry = {
  /** `null`: nothing to write, for a handle the library does not place or has not measured yet. */
  layoutStyles: HandleLayoutStyles | null;
  localPoint: Point;
  /** What the point follows is scrolled out of view inside the node, and the point waits on the border. */
  clipped: boolean;
};

type Box = { left: number; top: number; width: number; height: number };

/** The part of the node an element can be seen in, in node units; an axis that nothing clips is unbounded. */
type Clip = { left: number; top: number; right: number; bottom: number };

/** What one measurement reads from the DOM, in node units: the geometry is derived from it and the inputs. */
export interface HandleBoxes {
  /** The box of the element. */
  handle: Box;
  /** The box of the parent element, which anchors the `auto` layout. */
  anchor: Box;
  /** Origin of the containing block of the element, when it is not the node; see {@link containingBlockOrigin}. */
  origin: Point | null;
  /** What scroll containers leave visible of the parent element: the `auto` layout keeps its point inside. */
  anchorClip: Clip | null;
  /** The same for the element itself, for the `manual` layout. */
  handleClip: Clip | null;
}

/** Measurement of an element that is rendered without a layout box, for example under `display: none`. */
export const HANDLE_WITHOUT_BOX = 'without-box';

/** `null` is nothing to apply: a dynamic handle, or an element that is not rendered. */
export type HandleMeasurement = HandleBoxes | typeof HANDLE_WITHOUT_BOX | null;

export interface HandleOptions {
  /** The element the `vHandle` directive is applied to. Its parent is the anchor in the `auto` layout. */
  element?: HTMLElement | null;
  type: Signal<HandleType>;
  position: Signal<HandlePosition>;
  id?: Signal<string | undefined>;
  layout?: Signal<HandleLayout>;
  offsetX?: Signal<number>;
  offsetY?: Signal<number>;
  canStart?: Signal<boolean>;
  canAccept?: Signal<boolean>;
}

/** Reads shared by every handle of a node in one measurement pass. */
export type HandleMeasureContext = {
  nodeRect: DOMRect;
  /** The zoom that is rendered. A wheel event updates the viewport signal before Angular applies the transform. */
  zoom: number;
  /** Client rectangles read in this pass, so handles that share an anchor or a containing block read it once. */
  rects: Map<Element, DOMRect>;
  /** Visible boxes resolved in this pass, see {@link visibleBox}: handles of one list share its containers. */
  clips: Map<Element, Clip | null>;
};

/**
 * `viewportElement` is the element that carries the zoom transform; `fallbackZoom` applies without one, for a node
 * that is rendered outside of a flow, as in a unit test.
 */
export function createHandleMeasureContext(
  nodeElement: HTMLElement,
  viewportElement: HTMLElement | null,
  fallbackZoom: number,
): HandleMeasureContext {
  const viewport = viewportElement;
  // jsdom has no DOMMatrixReadOnly; it has no layout either, so the zoom divides rectangles of zeros.
  const rendered = viewport && typeof DOMMatrixReadOnly !== 'undefined';
  const zoom = (rendered ? new DOMMatrixReadOnly(viewport.style.transform).a : fallbackZoom) || 1;

  return { nodeRect: nodeElement.getBoundingClientRect(), zoom, rects: new Map(), clips: new Map() };
}

function clientRect(context: HandleMeasureContext, element: Element): DOMRect {
  let rect = context.rects.get(element);

  if (!rect) {
    rect = element.getBoundingClientRect();
    context.rects.set(element, rect);
  }

  return rect;
}

const UNMEASURED: HandleGeometry = { layoutStyles: null, localPoint: { x: 0, y: 0 }, clipped: false };

/**
 * A connection point of a node. The DOM is read in {@link measure}, a pure read of the element's boxes; the layout
 * styles and the connection point are computed from those boxes, the inputs and the node size, so a change of a
 * side, an offset, the layout or the node size needs no new measurement.
 */
export class HandleModel {
  public readonly element: HTMLElement | null;
  public readonly type: Signal<HandleType>;
  public readonly position: Signal<HandlePosition>;
  public readonly id: Signal<string | undefined>;
  public readonly layout: Signal<HandleLayout>;
  public readonly offsetX: Signal<number>;
  public readonly offsetY: Signal<number>;
  public readonly canStart: Signal<boolean>;
  public readonly canAccept: Signal<boolean>;

  public readonly state = signal<HandleState>('idle');

  /** False while the element has no layout box. Such a handle does not keep its node hidden, but its edges are. */
  public readonly hasBox = signal(true);

  /** The last measurement; `null` until the first one, and again after {@link reset}. */
  private readonly boxes = signal<HandleBoxes | null>(null);

  /** `auto` or `center`: the point is resolved per edge on the node, the element is only the surface. */
  public readonly dynamic = computed(() => {
    const position = this.position();
    return position === 'auto' || position === 'center';
  });

  /** A dynamic handle needs no measurement; any other is measured once its boxes are read. */
  public readonly isMeasured = computed(() => this.dynamic() || this.boxes() !== null);

  private readonly geometry = computed<HandleGeometry>(() => {
    const position = this.position();
    const node = { width: this.parentNode.width(), height: this.parentNode.height() };

    if (position === 'auto' || position === 'center') {
      return { layoutStyles: null, localPoint: { x: node.width / 2, y: node.height / 2 }, clipped: false };
    }

    const boxes = this.boxes();
    if (!boxes) return UNMEASURED;

    if (this.layout() === 'manual') {
      const point = sidePoint(position, boxes.handle);
      const visible = clampTo(point, boxes.handleClip);

      return { layoutStyles: null, localPoint: visible, clipped: visible !== point };
    }

    const { anchor } = boxes;
    const center = { x: anchor.left + anchor.width / 2, y: anchor.top + anchor.height / 2 };
    const visible = clampTo(center, boxes.anchorClip);

    return {
      ...computeAutoGeometry({
        position,
        node,
        handle: boxes.handle,
        anchor: visible,
        offset: { x: this.offsetX(), y: this.offsetY() },
        origin: boxes.origin,
      }),
      clipped: visible !== center,
    };
  });

  /** Where the `auto` layout puts the element center, relative to the containing block of the element. */
  public readonly layoutStyles = computed(() => this.geometry().layoutStyles);

  /** Connection point relative to the node origin, in flow units; the node center for a dynamic position. */
  public readonly localPoint = computed(() => this.geometry().localPoint);

  /** Scrolled out of view inside the node: the row of an `auto` handle, or the element of a `manual` one. */
  public readonly clipped = computed(() => this.geometry().clipped);

  public readonly pointAbsolute = computed<Point>(() => ({
    x: this.parentNode.globalPoint().x + this.localPoint().x,
    y: this.parentNode.globalPoint().y + this.localPoint().y,
  }));

  constructor(
    options: HandleOptions,
    public readonly parentNode: NodeModel,
  ) {
    this.element = options.element ?? null;
    this.type = options.type;
    this.position = options.position;
    this.id = options.id ?? signal(undefined);
    this.layout = options.layout ?? signal('auto');
    this.offsetX = options.offsetX ?? signal(0);
    this.offsetY = options.offsetY ?? signal(0);
    this.canStart = options.canStart ?? signal(true);
    this.canAccept = options.canAccept ?? signal(true);
  }

  /** Read phase: reads the element, its anchor and its containing block without changing styles. */
  public measure(context: HandleMeasureContext): HandleMeasurement {
    const element = this.element;
    const nodeElement = this.parentNode.nodeElement();

    if (!element || !nodeElement || this.dynamic()) {
      return null;
    }

    // An element with a layout box has a parent; the check also narrows the type.
    const parent = element.parentElement;
    if (!parent || !element.getClientRects().length) {
      return HANDLE_WITHOUT_BOX;
    }

    const { nodeRect, zoom } = context;
    const toLocal = (rect: DOMRect): Box => ({
      left: (rect.left - nodeRect.left) / zoom,
      top: (rect.top - nodeRect.top) / zoom,
      width: rect.width / zoom,
      height: rect.height / zoom,
    });

    return {
      handle: toLocal(element.getBoundingClientRect()),
      anchor: toLocal(clientRect(context, parent)),
      origin: containingBlockOrigin(element, nodeElement, context),
      anchorClip: visibleBox(parent, nodeElement, context),
      handleClip: visibleBox(element, nodeElement, context),
    };
  }

  /** Write phase. Called only after every handle in the node has been measured. */
  public applyMeasurement(measurement: HandleMeasurement): void {
    if (!measurement) {
      return;
    }

    if (measurement === HANDLE_WITHOUT_BOX) {
      this.hasBox.set(false);
      this.boxes.set(null);
      return;
    }

    this.hasBox.set(true);
    this.boxes.set(measurement);
  }

  /** Forgets the measurement, so the handle waits for the next one: a remount, or a restore from CSS culling. */
  public reset(): void {
    this.boxes.set(null);
  }

  /**
   * Where an edge towards `towards` meets this handle: the fixed point and side of a port, or, for `auto` and
   * `center`, the point on the node that faces `towards`.
   */
  public endpoint(towards: Point): NodeEndpoint {
    const position = this.position();

    return position === 'auto' || position === 'center'
      ? getNodeEndpoint(this.parentNode.geometry(), towards, position)
      : { point: this.pointAbsolute(), position };
  }
}

/** The middle of the `position` side of a box. */
function sidePoint(position: Position, box: Box): Point {
  switch (position) {
    case 'left':
      return { x: box.left, y: box.top + box.height / 2 };
    case 'right':
      return { x: box.left + box.width, y: box.top + box.height / 2 };
    case 'top':
      return { x: box.left + box.width / 2, y: box.top };
    case 'bottom':
      return { x: box.left + box.width / 2, y: box.top + box.height };
  }
}

/**
 * Origin of the padding box that `top` and `left` of the absolutely positioned element resolve against, in node
 * units. `null` when that box is the node itself or cannot be resolved, which keeps the node-relative styles.
 */
function containingBlockOrigin(
  element: HTMLElement,
  nodeElement: HTMLElement,
  context: HandleMeasureContext,
): Point | null {
  const container = element.offsetParent;

  if (!(container instanceof HTMLElement) || container === nodeElement || !nodeElement.contains(container)) {
    return null;
  }

  const { nodeRect, zoom } = context;
  const rect = clientRect(context, container);

  return {
    x: (rect.left - nodeRect.left) / zoom + container.clientLeft - container.scrollLeft,
    y: (rect.top - nodeRect.top) / zoom + container.clientTop - container.scrollTop,
  };
}

/**
 * What the scroll containers between an element and the node leave visible of it, in node units: the padding boxes
 * of the containers that clip, intersected. Clipping follows containing blocks, so an absolutely positioned element
 * is not clipped by the ancestors it escapes. `null` when nothing clips it.
 */
function visibleBox(element: HTMLElement, nodeElement: HTMLElement, context: HandleMeasureContext): Clip | null {
  const cached = context.clips.get(element);
  if (cached !== undefined) return cached;

  const { position } = getComputedStyle(element);
  const container =
    position === 'fixed' ? null : position === 'absolute' ? element.offsetParent : element.parentElement;
  let clip: Clip | null = null;

  if (container instanceof HTMLElement && container !== nodeElement && nodeElement.contains(container)) {
    clip = visibleBox(container, nodeElement, context);
    const { overflowX, overflowY } = getComputedStyle(container);

    if (overflowX !== 'visible' || overflowY !== 'visible') {
      const { nodeRect, zoom } = context;
      const rect = clientRect(context, container);
      const left = (rect.left - nodeRect.left) / zoom + container.clientLeft;
      const top = (rect.top - nodeRect.top) / zoom + container.clientTop;

      clip = {
        left: Math.max(clip?.left ?? -Infinity, overflowX === 'visible' ? -Infinity : left),
        top: Math.max(clip?.top ?? -Infinity, overflowY === 'visible' ? -Infinity : top),
        right: Math.min(clip?.right ?? Infinity, overflowX === 'visible' ? Infinity : left + container.clientWidth),
        bottom: Math.min(clip?.bottom ?? Infinity, overflowY === 'visible' ? Infinity : top + container.clientHeight),
      };
    }
  }

  context.clips.set(element, clip);
  return clip;
}

/**
 * Moves a point into the visible box: a handle scrolled out of a list stays on the border it left through. A point
 * inside the box is returned as it is, which is how a caller tells.
 */
function clampTo(point: Point, clip: Clip | null): Point {
  if (!clip) return point;

  const x = Math.min(Math.max(point.x, clip.left), clip.right);
  const y = Math.min(Math.max(point.y, clip.top), clip.bottom);

  return x === point.x && y === point.y ? point : { x, y };
}

function computeAutoGeometry({
  position,
  node,
  handle,
  anchor,
  offset,
  origin,
}: {
  position: Position;
  node: { width: number; height: number };
  handle: Box;
  /** The center of the parent element, inside its visible box. */
  anchor: Point;
  offset: Point;
  origin: Point | null;
}): Omit<HandleGeometry, 'clipped'> {
  const { x: anchorX, y: anchorY } = anchor;
  const dx = offset.x - (origin?.x ?? 0);
  const dy = offset.y - (origin?.y ?? 0);
  const px = (value: number) => `${value}px`;
  // While the node is the containing block, a percentage follows its size in CSS, ahead of the measured size.
  const far = (size: number, shift: number) => (origin ? px(size + shift) : `calc(100% + ${shift}px)`);

  // The flow stylesheet centers the element on `top` and `left`, so its center sits on the node side; the
  // connection point is the outer edge of the element.
  switch (position) {
    case 'left':
      return {
        layoutStyles: { top: px(anchorY + dy), left: px(dx) },
        localPoint: { x: -handle.width / 2 + offset.x, y: anchorY + offset.y },
      };
    case 'right':
      return {
        layoutStyles: { top: px(anchorY + dy), left: far(node.width, dx) },
        localPoint: { x: node.width + handle.width / 2 + offset.x, y: anchorY + offset.y },
      };
    case 'top':
      return {
        layoutStyles: { top: px(dy), left: px(anchorX + dx) },
        localPoint: { x: anchorX + offset.x, y: -handle.height / 2 + offset.y },
      };
    case 'bottom':
      return {
        layoutStyles: { top: far(node.height, dy), left: px(anchorX + dx) },
        localPoint: { x: anchorX + offset.x, y: node.height + handle.height / 2 + offset.y },
      };
  }
}
