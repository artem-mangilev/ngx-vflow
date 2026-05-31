import { computed, inject, signal } from '@angular/core';
import { NodeHandle } from '../services/handle.service';
import { NodeModel } from './node.model';
import { Point } from '../interfaces/point.interface';
import { ViewportService } from '../services/viewport.service';

export type HandleState = 'valid' | 'invalid' | 'idle';

export class HandleModel {
  private viewportService = inject(ViewportService);

  public state = signal<HandleState>('idle');

  /**
   * Parent DOM element the `<handle>` was placed into. Kept so the node can
   * observe it for resizes and re-measure the handle position.
   */
  public hostReference = this.rawHandle.hostReference!;

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

    if (!handleElement || !nodeElement) {
      return;
    }

    // Both rects live in the same zoomed coordinate space (they share the
    // CSS-scaled viewport), so subtracting them and dividing by the zoom yields
    // the connection point in flow units, independent of the current zoom.
    const zoom = this.viewportService.readableViewport().zoom || 1;
    const handleRect = handleElement.getBoundingClientRect();
    const nodeRect = nodeElement.getBoundingClientRect();

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
