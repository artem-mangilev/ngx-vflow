import { Signal, computed, inject, isDevMode, signal } from '@angular/core';
import { NodeModel } from './node.model';
import { Point } from '../interfaces/point.interface';
import { ViewportService } from '../services/viewport.service';
import { Position } from '../types/position.type';
import { HandleLayout, HandleState, HandleType } from '../types/handle-type.type';

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

/** Measurement of an element that is rendered without a layout box, for example under `display: none`. */
export const HANDLE_WITHOUT_BOX = 'without-box';

export type HandleMeasurement = HandleGeometry | typeof HANDLE_WITHOUT_BOX | null;

export interface HandleOptions {
  /** The element the `vflowHandle` directive is applied to. Its parent is the anchor in the `auto` layout. */
  element?: HTMLElement | null;
  type: Signal<HandleType>;
  position: Signal<Position>;
  id?: Signal<string | undefined>;
  layout?: Signal<HandleLayout>;
  offsetX?: Signal<number>;
  offsetY?: Signal<number>;
  canStart?: Signal<boolean>;
  canAccept?: Signal<boolean>;
}

type Box = { left: number; top: number; width: number; height: number };

/** Reads shared by every handle of a node in one measurement pass. */
export type HandleMeasureContext = {
  nodeRect: DOMRect;
  /** The zoom that is rendered. A wheel event updates the viewport signal before Angular applies the transform. */
  zoom: number;
  /** Client rectangles read in this pass, so handles that share an anchor or a containing block read it once. */
  rects: Map<Element, DOMRect>;
};

/** `fallbackZoom` applies to a node that is rendered outside of a flow viewport, for example in a unit test. */
export function createHandleMeasureContext(nodeElement: HTMLElement, fallbackZoom: number): HandleMeasureContext {
  const viewport = nodeElement.closest<HTMLElement>('.vflow-viewport');
  const zoom = (viewport ? new DOMMatrixReadOnly(viewport.style.transform).a : fallbackZoom) || 1;

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

export class HandleModel {
  private viewportService = inject(ViewportService);

  public readonly element: HTMLElement | null;
  public readonly type: Signal<HandleType>;
  public readonly position: Signal<Position>;
  public readonly id: Signal<string | undefined>;
  public readonly layout: Signal<HandleLayout>;
  public readonly offsetX: Signal<number>;
  public readonly offsetY: Signal<number>;
  public readonly canStart: Signal<boolean>;
  public readonly canAccept: Signal<boolean>;

  public readonly state = signal<HandleState>('idle');
  public readonly isMeasured = signal(false);

  /** False while the element has no layout box. Such a handle does not keep its node hidden, but its edges are. */
  public readonly hasBox = signal(true);

  /** Styles of the `auto` layout, relative to the containing block of the element. */
  public readonly layoutStyles = signal<HandleLayoutStyles>(UNPLACED);

  private readonly local = signal<Point>({ x: 0, y: 0 });

  /** Connection point relative to the node origin, in flow units. */
  public readonly localPoint = this.local.asReadonly();

  public readonly pointAbsolute = computed<Point>(() => ({
    x: this.parentNode.globalPoint().x + this.local().x,
    y: this.parentNode.globalPoint().y + this.local().y,
  }));

  private warnedWithoutBox = false;

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
  public measure(context = this.createMeasureContext()): HandleMeasurement {
    if (this.parentNode.culled()) return null;

    const element = this.element;
    const nodeElement = this.parentNode.nodeElement();

    if (!element || !nodeElement || !context) {
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

    const position = this.position();
    const handle = toLocal(element.getBoundingClientRect());

    if (this.layout() === 'manual') {
      return { layoutStyles: UNPLACED, localPoint: sidePoint(position, handle) };
    }

    const node = { width: this.parentNode.width(), height: this.parentNode.height() };
    const anchor = element.parentElement
      ? toLocal(clientRect(context, element.parentElement))
      : { left: 0, top: 0, ...node };

    return computeAutoGeometry({
      position,
      node,
      handle,
      anchor,
      offset: { x: this.offsetX(), y: this.offsetY() },
      origin: containingBlockOrigin(element, nodeElement, context),
    });
  }

  /** Isolated model use. Node rendering shares one context between the handles of the node. */
  private createMeasureContext(): HandleMeasureContext | null {
    const nodeElement = this.parentNode.nodeElement();

    return nodeElement ? createHandleMeasureContext(nodeElement, this.viewportService.readableViewport().zoom) : null;
  }

  /** Write phase. Called only after every handle in the node has been measured. */
  public applyGeometry(geometry: HandleMeasurement): void {
    if (!geometry) {
      return;
    }

    if (geometry === HANDLE_WITHOUT_BOX) {
      this.hasBox.set(false);
      this.isMeasured.set(false);
      this.warnWithoutBox();
      return;
    }

    this.hasBox.set(true);
    this.layoutStyles.set(geometry.layoutStyles);
    this.local.set(geometry.localPoint);
    this.isMeasured.set(true);
  }

  /** Synchronous convenience for isolated model use. Node rendering uses the coalesced controller pass. */
  public sync(): void {
    this.applyGeometry(this.measure());
  }

  private warnWithoutBox() {
    if (this.warnedWithoutBox || !isDevMode()) return;
    this.warnedWithoutBox = true;
    const id = this.id();
    console.warn(
      `[ngx-vflow] The ${this.type()} handle${id ? ` "${id}"` : ''} of node "${this.parentNode.rawNode.id}" ` +
        'has no layout box (display: none?), so it is not measured and its edges are hidden. ' +
        'Keep the element in layout; hide it with visibility: hidden or opacity: 0 instead.',
    );
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
  { nodeRect, zoom, ...context }: HandleMeasureContext,
): Point | null {
  const container = element.offsetParent;

  if (!(container instanceof HTMLElement) || container === nodeElement || !nodeElement.contains(container)) {
    return null;
  }

  const rect = clientRect({ nodeRect, zoom, ...context }, container);

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
