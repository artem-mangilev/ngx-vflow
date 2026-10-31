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
  right: string;
  bottom: string;
};

export type HandleGeometry = {
  layoutStyles: HandleLayoutStyles;
  localPoint: Point;
};

type Box = { left: number; top: number; width: number; height: number };

/** What one measurement reads from the DOM, in node units: the geometry is derived from it and the inputs. */
export interface HandleBoxes {
  /** The box of the element. */
  handle: Box;
  /** The box of the parent element, which anchors the `auto` layout; `null` without a parent, which the node box replaces. */
  anchor: Box | null;
  /** Origin of the containing block of the element, when it is not the node; see {@link containingBlockOrigin}. */
  origin: Point | null;
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

  return { nodeRect: nodeElement.getBoundingClientRect(), zoom, rects: new Map() };
}

function clientRect(context: HandleMeasureContext, element: Element): DOMRect {
  let rect = context.rects.get(element);

  if (!rect) {
    rect = element.getBoundingClientRect();
    context.rects.set(element, rect);
  }

  return rect;
}

const UNPLACED: HandleLayoutStyles = { top: 'auto', left: 'auto', right: 'auto', bottom: 'auto' };
const UNMEASURED: HandleGeometry = { layoutStyles: UNPLACED, localPoint: { x: 0, y: 0 } };

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
      return { layoutStyles: UNPLACED, localPoint: { x: node.width / 2, y: node.height / 2 } };
    }

    const boxes = this.boxes();
    if (!boxes) return UNMEASURED;

    if (this.layout() === 'manual') {
      return { layoutStyles: UNPLACED, localPoint: sidePoint(position, boxes.handle) };
    }

    return computeAutoGeometry({
      position,
      node,
      handle: boxes.handle,
      anchor: boxes.anchor ?? { left: 0, top: 0, ...node },
      offset: { x: this.offsetX(), y: this.offsetY() },
      origin: boxes.origin,
    });
  });

  /** Styles of the `auto` layout, relative to the containing block of the element. */
  public readonly layoutStyles = computed(() => this.geometry().layoutStyles);

  /** Connection point relative to the node origin, in flow units; the node center for a dynamic position. */
  public readonly localPoint = computed(() => this.geometry().localPoint);

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

    if (!element.getClientRects().length) {
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
      anchor: element.parentElement ? toLocal(clientRect(context, element.parentElement)) : null,
      origin: containingBlockOrigin(element, nodeElement, context),
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
  anchor: Box;
  offset: Point;
  origin: Point | null;
}): HandleGeometry {
  const anchorX = anchor.left + anchor.width / 2;
  const anchorY = anchor.top + anchor.height / 2;
  const px = (value: number) => `${value}px`;

  // The element center sits on the node side; the connection point is the outer edge of the element.
  switch (position) {
    case 'left':
      return {
        layoutStyles: origin
          ? { top: px(anchorY - origin.y), left: px(-origin.x), right: 'auto', bottom: 'auto' }
          : { top: px(anchorY), left: '0', right: 'auto', bottom: 'auto' },
        localPoint: { x: -handle.width / 2 + offset.x, y: anchorY + offset.y },
      };
    case 'right':
      return {
        layoutStyles: origin
          ? { top: px(anchorY - origin.y), left: px(node.width - origin.x), right: 'auto', bottom: 'auto' }
          : { top: px(anchorY), left: 'auto', right: '0', bottom: 'auto' },
        localPoint: { x: node.width + handle.width / 2 + offset.x, y: anchorY + offset.y },
      };
    case 'top':
      return {
        layoutStyles: origin
          ? { top: px(-origin.y), left: px(anchorX - origin.x), right: 'auto', bottom: 'auto' }
          : { top: '0', left: px(anchorX), right: 'auto', bottom: 'auto' },
        localPoint: { x: anchorX + offset.x, y: -handle.height / 2 + offset.y },
      };
    case 'bottom':
      return {
        layoutStyles: origin
          ? { top: px(node.height - origin.y), left: px(anchorX - origin.x), right: 'auto', bottom: 'auto' }
          : { top: 'auto', left: px(anchorX), right: 'auto', bottom: '0' },
        localPoint: { x: anchorX + offset.x, y: node.height + handle.height / 2 + offset.y },
      };
  }
}
