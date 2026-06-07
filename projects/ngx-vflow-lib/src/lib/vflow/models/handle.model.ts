import { computed, inject, signal } from '@angular/core';
import { NodeHandle } from '../services/handle.service';
import { NodeModel } from './node.model';
import { Point } from '../interfaces/point.interface';
import { ViewportService } from '../services/viewport.service';
import { Position } from '../types/position.type';

export type HandleState = 'valid' | 'invalid' | 'idle';

export type HandleLayoutStyles = {
  top: string;
  left: string;
  right: string;
  bottom: string;
};

export class HandleModel {
  private viewportService = inject(ViewportService);

  public state = signal<HandleState>('idle');

  /**
   * Anchor element the `<handle>` was placed into. Used to align the handle
   * along the node edge while keeping it on the node boundary.
   */
  public hostReference = this.rawHandle.hostReference!;

  /**
   * Absolute position of the handle relative to the node, same as xyflow handles.
   */
  public layoutStyles = signal<HandleLayoutStyles>({
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
  });

  /**
   * The rendered handle DOM element. Set by `HandleComponent` once its view is
   * initialized, then used to measure the connection point.
   */
  public handleElement: HTMLElement | null = null;

  public template = this.rawHandle.template;

  /**
   * Connection point of the handle relative to the node origin, in flow units.
   * It is measured directly from the DOM so that it always matches the
   * CSS-centered handle, regardless of paddings, borders or custom sizes.
   */
  private localPoint = signal<Point>({ x: 0, y: 0 });

  public pointAbsolute = computed<Point>(() => ({
    x: this.parentNode.globalPoint().x + this.localPoint().x,
    y: this.parentNode.globalPoint().y + this.localPoint().y,
  }));

  public templateContext = {
    $implicit: {
      point: this.pointAbsolute,
      state: this.state,
      node: this.parentNode.rawNode,
    },
  };

  constructor(
    public rawHandle: NodeHandle,
    public parentNode: NodeModel,
  ) {}

  public updateHost() {
    const handleElement = this.handleElement;
    const nodeElement = this.parentNode.nodeElement();

    if (!nodeElement) {
      return;
    }

    const zoom = this.viewportService.readableViewport().zoom || 1;
    const anchorRect = this.hostReference.getBoundingClientRect();
    const nodeRect = nodeElement.getBoundingClientRect();
    const layoutStyles = computeHandleLayoutStyles(this.rawHandle.position, anchorRect, nodeRect, zoom);

    this.layoutStyles.set(layoutStyles);

    if (!handleElement) {
      return;
    }

    applyHandleLayoutStyles(handleElement, layoutStyles);

    // Both rects live in the same zoomed coordinate space (they share the
    // CSS-scaled viewport), so subtracting them and dividing by the zoom yields
    // the connection point in flow units, independent of the current zoom.
    const handleRect = handleElement.getBoundingClientRect();

    let pointX: number;
    let pointY: number;

    switch (this.rawHandle.position) {
      case 'left':
        pointX = handleRect.left;
        pointY = handleRect.top + handleRect.height / 2;
        break;
      case 'right':
        pointX = handleRect.right;
        pointY = handleRect.top + handleRect.height / 2;
        break;
      case 'top':
        pointX = handleRect.left + handleRect.width / 2;
        pointY = handleRect.top;
        break;
      case 'bottom':
        pointX = handleRect.left + handleRect.width / 2;
        pointY = handleRect.bottom;
        break;
    }

    this.localPoint.set({
      x: (pointX - nodeRect.left) / zoom,
      y: (pointY - nodeRect.top) / zoom,
    });
  }
}

function computeHandleLayoutStyles(
  position: Position,
  anchorRect: DOMRect,
  nodeRect: DOMRect,
  zoom: number,
): HandleLayoutStyles {
  const alongY = `${(anchorRect.top + anchorRect.height / 2 - nodeRect.top) / zoom}px`;
  const alongX = `${(anchorRect.left + anchorRect.width / 2 - nodeRect.left) / zoom}px`;

  switch (position) {
    case 'left':
      return { top: alongY, left: '0', right: 'auto', bottom: 'auto' };
    case 'right':
      return { top: alongY, left: 'auto', right: '0', bottom: 'auto' };
    case 'top':
      return { top: '0', left: alongX, right: 'auto', bottom: 'auto' };
    case 'bottom':
      return { top: 'auto', left: alongX, right: 'auto', bottom: '0' };
  }
}

function applyHandleLayoutStyles(element: HTMLElement, styles: HandleLayoutStyles) {
  element.style.top = styles.top;
  element.style.left = styles.left;
  element.style.right = styles.right;
  element.style.bottom = styles.bottom;
}
